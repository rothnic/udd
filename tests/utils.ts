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

export async function runUdd(args: string) {
	const command = `npx tsx ${uddBin} ${args}`;
	return execAsync(command);
}
