import { exec } from "node:child_process";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";

/**
 * Create a temporary directory, switch cwd to it, run the callback, and
 * always restore the original cwd and remove the temp directory.
 *
 * The callback may be async and return any type T.
 */
export async function withTempDir<T>(fn: () => Promise<T> | T): Promise<T> {
	const prev = process.cwd();
	const base = await fs.mkdtemp(path.join(os.tmpdir(), "udd-test-"));

	try {
		process.chdir(base);
		return await fn();
	} finally {
		try {
			process.chdir(prev);
		} catch {
			// best-effort: if chdir back fails, rethrow after cleanup attempt
		}

		// remove the temp dir recursively; ignore errors
		try {
			await fs.rm(base, { recursive: true, force: true });
		} catch {
			// swallow
		}
	}
}

export const execAsync = promisify(exec);
export const rootDir = process.cwd();
export const uddBin = path.resolve(rootDir, "bin/udd.ts");
export const tsxLoader = path.resolve(
	rootDir,
	"node_modules/tsx/dist/loader.mjs",
);

export type JsonSchema = {
	$ref?: string;
	type?: string | string[];
	required?: string[];
	properties?: Record<string, JsonSchema>;
	items?: JsonSchema;
	additionalProperties?: boolean | JsonSchema;
	$defs?: Record<string, JsonSchema>;
};

export function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}

function shellQuote(value: string): string {
	return `'${value.replace(/'/g, "'\\''")}'`;
}

export function buildUddCommand(args: string): string {
	return [
		"node",
		"--import",
		shellQuote(tsxLoader),
		shellQuote(uddBin),
		args,
	].join(" ");
}

export async function runUdd(args: string) {
	const command = buildUddCommand(args);
	return execAsync(command);
}

export async function loadSharedAgentPayloadSchema(): Promise<JsonSchema> {
	const schemaPath = path.resolve(
		rootDir,
		"integrations/shared/agent-payload.schema.json",
	);
	return JSON.parse(await fs.readFile(schemaPath, "utf8")) as JsonSchema;
}

function resolveSchemaRef(schema: JsonSchema, root: JsonSchema): JsonSchema {
	if (!schema.$ref) {
		return schema;
	}

	const parts = schema.$ref.replace(/^#\//, "").split("/");
	let current: unknown = root;
	for (const part of parts) {
		if (!isRecord(current)) {
			throw new Error(`Unresolved schema ref ${schema.$ref}`);
		}
		const key = part.replace(/~1/g, "/").replace(/~0/g, "~");
		current = current[key];
	}
	if (!current) {
		throw new Error(`Unresolved schema ref ${schema.$ref}`);
	}
	return current as JsonSchema;
}

function valueMatchesType(value: unknown, type: string): boolean {
	if (type === "array") {
		return Array.isArray(value);
	}
	if (type === "integer") {
		return Number.isInteger(value);
	}
	if (type === "null") {
		return value === null;
	}
	return typeof value === type;
}

export function assertMatchesJsonSchema(
	value: unknown,
	schema: JsonSchema,
	root: JsonSchema = schema,
	location = "$",
): void {
	const resolved = resolveSchemaRef(schema, root);
	const allowedTypes = Array.isArray(resolved.type)
		? resolved.type
		: resolved.type
			? [resolved.type]
			: [];

	if (
		allowedTypes.length > 0 &&
		!allowedTypes.some((type) => valueMatchesType(value, type))
	) {
		throw new Error(
			`${location} expected ${allowedTypes.join("|")}, received ${value === null ? "null" : typeof value}`,
		);
	}

	if (resolved.type === "object" || resolved.properties || resolved.required) {
		if (!isRecord(value)) {
			throw new Error(`${location} expected object`);
		}
		const record = value;
		for (const key of resolved.required ?? []) {
			if (!(key in record)) {
				throw new Error(`${location}.${key} is required`);
			}
		}
		for (const [key, childSchema] of Object.entries(
			resolved.properties ?? {},
		)) {
			if (key in record) {
				assertMatchesJsonSchema(
					record[key],
					childSchema,
					root,
					`${location}.${key}`,
				);
			}
		}
	}

	if (resolved.type === "array" || resolved.items) {
		if (!Array.isArray(value)) {
			throw new Error(`${location} expected array`);
		}
		if (resolved.items) {
			for (const [index, item] of value.entries()) {
				assertMatchesJsonSchema(
					item,
					resolved.items as JsonSchema,
					root,
					`${location}[${index}]`,
				);
			}
		}
	}
}
