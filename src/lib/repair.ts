import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import yaml from "yaml";
import {
	analyzeProjectDiagnostics,
	type DiagnosticIssue,
} from "./diagnostics.js";

export interface RepairAction {
	id: string;
	kind: "mkdir" | "write_file" | "refresh_manifest" | "manual";
	safe: boolean;
	reversible: boolean;
	path: string;
	description: string;
	reason: string;
}

export interface RepairReport {
	mode: "dry-run" | "apply";
	applied: RepairAction[];
	proposed: RepairAction[];
	refused: RepairAction[];
	evidence: {
		path: string;
		written: boolean;
		markdown: string;
	};
}

function toPosix(filePath: string): string {
	return filePath.replace(/\\/g, "/");
}

async function exists(filePath: string): Promise<boolean> {
	try {
		await fs.access(filePath);
		return true;
	} catch {
		return false;
	}
}

function safeActionForIssue(issue: DiagnosticIssue): RepairAction {
	if (issue.type === "product_missing" || issue.type === "journeys_missing") {
		return {
			id: `mkdir:${issue.file}`,
			kind: "mkdir",
			safe: true,
			reversible: true,
			path: issue.file,
			description: `Create missing directory ${issue.file}.`,
			reason: issue.message,
		};
	}

	if (issue.type === "specs_missing") {
		return {
			id: "mkdir:specs/.udd",
			kind: "mkdir",
			safe: true,
			reversible: true,
			path: "specs/.udd",
			description:
				"Create missing specs/.udd directory for generated metadata.",
			reason: issue.message,
		};
	}

	if (issue.type === "manifest_missing" || issue.type === "journey_stale") {
		return {
			id: "refresh:specs/.udd/manifest.yml",
			kind: "refresh_manifest",
			safe: true,
			reversible: true,
			path: "specs/.udd/manifest.yml",
			description:
				"Refresh the generated journey manifest from current journey files.",
			reason: issue.message,
		};
	}

	return {
		id: `manual:${issue.file}:${issue.type}`,
		kind: "manual",
		safe: false,
		reversible: false,
		path: issue.file,
		description: `Manual review required for ${issue.type}; repair will not rewrite behavior specs.`,
		reason: issue.message,
	};
}

async function buildManifest(rootDir: string): Promise<string> {
	const journeysDir = path.join(rootDir, "product", "journeys");
	const manifest: {
		version: number;
		journeys: Record<string, { path: string; hash: string }>;
		scenarios: Record<string, { path: string }>;
	} = {
		version: 1,
		journeys: {},
		scenarios: {},
	};

	if (await exists(journeysDir)) {
		const files = (await fs.readdir(journeysDir)).filter(
			(file) => file.endsWith(".md") && !file.startsWith("_"),
		);
		for (const file of files.sort()) {
			const relPath = toPosix(path.join("product", "journeys", file));
			const content = await fs.readFile(path.join(rootDir, relPath), "utf-8");
			manifest.journeys[path.basename(file, ".md")] = {
				path: relPath,
				hash: crypto
					.createHash("sha256")
					.update(content)
					.digest("hex")
					.slice(0, 12),
			};
			for (const match of content.matchAll(/(?:→|->)\s*`([^`]+\.feature)`/g)) {
				manifest.scenarios[match[1]] = { path: match[1] };
			}
		}
	}

	return yaml.stringify(manifest);
}

export async function planRepair(
	rootDir = process.cwd(),
): Promise<RepairReport> {
	const diagnostics = await analyzeProjectDiagnostics(rootDir);
	const actions = diagnostics.issues.map(safeActionForIssue);
	const proposed = actions.filter((action) => action.safe);
	const refused = actions.filter((action) => !action.safe);
	const markdown = [
		"# UDD Repair Dry-Run Evidence",
		"",
		"## Proposed Safe Actions",
		...proposed.map((action) => `- ${action.description} (${action.path})`),
		"",
		"## Refused Unsafe Actions",
		...refused.map((action) => `- ${action.description} (${action.path})`),
		"",
	].join("\n");

	return {
		mode: "dry-run",
		applied: [],
		proposed,
		refused,
		evidence: {
			path: "docs/project/reviews/repair-evidence.md",
			written: false,
			markdown,
		},
	};
}

export async function applyRepair(
	rootDir = process.cwd(),
): Promise<RepairReport> {
	const report = await planRepair(rootDir);
	const applied: RepairAction[] = [];
	const seen = new Set<string>();

	for (const action of report.proposed) {
		if (seen.has(action.id)) continue;
		seen.add(action.id);
		if (action.kind === "mkdir") {
			await fs.mkdir(path.join(rootDir, action.path), { recursive: true });
			applied.push(action);
		}
		if (action.kind === "refresh_manifest") {
			const manifestPath = path.join(rootDir, action.path);
			await fs.mkdir(path.dirname(manifestPath), { recursive: true });
			await fs.writeFile(manifestPath, await buildManifest(rootDir));
			applied.push(action);
		}
	}

	const evidenceDir = path.join(
		rootDir,
		"docs",
		"project",
		"reviews",
		"repair",
	);
	await fs.mkdir(evidenceDir, { recursive: true });
	const evidencePath = path.join(evidenceDir, "latest-repair-evidence.md");
	const content = [
		"# UDD Repair Evidence",
		"",
		`Generated: ${new Date().toISOString()}`,
		"",
		"## Applied",
		...applied.map((action) => `- ${action.description} (${action.path})`),
		"",
		"## Refused",
		...report.refused.map(
			(action) => `- ${action.description} (${action.path})`,
		),
		"",
	].join("\n");
	await fs.writeFile(evidencePath, content);

	return {
		...report,
		mode: "apply",
		applied,
		evidence: {
			path: toPosix(path.relative(rootDir, evidencePath)),
			written: true,
			markdown: content,
		},
	};
}
