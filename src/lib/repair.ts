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
	rank: number;
	kind: "mkdir" | "write_file" | "refresh_manifest" | "manual";
	safe: boolean;
	reversible: boolean;
	path: string;
	description: string;
	reason: string;
	would_write: string[];
	source_issue: {
		id: string;
		type: DiagnosticIssue["type"];
		severity: DiagnosticIssue["severity"];
		file: string;
	};
	source_issues: Array<{
		id: string;
		type: DiagnosticIssue["type"];
		severity: DiagnosticIssue["severity"];
		file: string;
	}>;
}

export interface RepairReport {
	mode: "dry-run" | "apply";
	applied: RepairAction[];
	proposed: RepairAction[];
	refused: RepairAction[];
	advisory: RepairAction[];
	would_write: string[];
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

function actionRank(issue: DiagnosticIssue, safe: boolean): number {
	if (safe && issue.severity === "critical") return 10;
	if (safe && issue.severity === "warning") return 20;
	if (safe) return 30;
	if (issue.severity === "critical") return 60;
	if (issue.severity === "warning") return 70;
	return 80;
}

function actionForIssue(issue: DiagnosticIssue): Omit<RepairAction, "rank"> {
	if (issue.type === "product_missing" || issue.type === "journeys_missing") {
		return {
			id: `mkdir:${issue.file}`,
			kind: "mkdir",
			safe: true,
			reversible: true,
			path: issue.file,
			description: `Create missing directory ${issue.file}.`,
			reason: issue.message,
			would_write: [issue.file],
			source_issue: {
				id: issue.id,
				type: issue.type,
				severity: issue.severity,
				file: issue.file,
			},
			source_issues: [
				{
					id: issue.id,
					type: issue.type,
					severity: issue.severity,
					file: issue.file,
				},
			],
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
			would_write: ["specs/.udd"],
			source_issue: {
				id: issue.id,
				type: issue.type,
				severity: issue.severity,
				file: issue.file,
			},
			source_issues: [
				{
					id: issue.id,
					type: issue.type,
					severity: issue.severity,
					file: issue.file,
				},
			],
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
			would_write: ["specs/.udd/manifest.yml"],
			source_issue: {
				id: issue.id,
				type: issue.type,
				severity: issue.severity,
				file: issue.file,
			},
			source_issues: [
				{
					id: issue.id,
					type: issue.type,
					severity: issue.severity,
					file: issue.file,
				},
			],
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
		would_write: [],
		source_issue: {
			id: issue.id,
			type: issue.type,
			severity: issue.severity,
			file: issue.file,
		},
		source_issues: [
			{
				id: issue.id,
				type: issue.type,
				severity: issue.severity,
				file: issue.file,
			},
		],
	};
}

function repairActionForIssue(issue: DiagnosticIssue): RepairAction {
	const action = actionForIssue(issue);
	return {
		...action,
		rank: actionRank(issue, action.safe),
	};
}

function dedupeActions(actions: RepairAction[]): RepairAction[] {
	const byId = new Map<string, RepairAction>();
	for (const action of actions) {
		const existing = byId.get(action.id);
		if (!existing) {
			byId.set(action.id, action);
			continue;
		}

		byId.set(action.id, {
			...existing,
			rank: Math.min(existing.rank, action.rank),
			reason: `${existing.reason}; ${action.reason}`,
			source_issues: [...existing.source_issues, ...action.source_issues],
		});
	}
	return [...byId.values()].sort(
		(left, right) => left.rank - right.rank || left.id.localeCompare(right.id),
	);
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
				const scenarioPath = toPosix(match[1]);
				if (await exists(path.join(rootDir, scenarioPath))) {
					manifest.scenarios[scenarioPath] = { path: scenarioPath };
				}
			}
		}
	}

	return yaml.stringify(manifest);
}

export async function planRepair(
	rootDir = process.cwd(),
): Promise<RepairReport> {
	const diagnostics = await analyzeProjectDiagnostics(rootDir);
	const advisoryIssues = diagnostics.issues.filter(
		(issue) => issue.severity === "info" && issue.type === "missing_scenario",
	);
	const actionableIssues = diagnostics.issues.filter(
		(issue) =>
			!(issue.severity === "info" && issue.type === "missing_scenario"),
	);
	const actions = dedupeActions(actionableIssues.map(repairActionForIssue));
	const advisory = dedupeActions(advisoryIssues.map(repairActionForIssue));
	const proposed = actions.filter((action) => action.safe);
	const refused = actions.filter((action) => !action.safe);
	const evidencePath = "docs/project/reviews/repair/latest-repair-evidence.md";
	const wouldWrite = [
		...new Set([
			...proposed.flatMap((action) => action.would_write).map(toPosix),
			evidencePath,
		]),
	];
	const markdown = [
		"# UDD Repair Dry-Run Evidence",
		"",
		"## Apply-Mode Writes",
		...wouldWrite.map((file) => `- ${file}`),
		"",
		"## Proposed Safe Actions",
		...proposed.map(
			(action) =>
				`- [${action.rank}] ${action.description} (${action.path}) writes: ${action.would_write.join(", ") || "none"}`,
		),
		"",
		"## Refused Unsafe Actions",
		...refused.map(
			(action) =>
				`- [${action.rank}] ${action.description} (${action.path}) reason: ${action.reason}`,
		),
		"",
		"## Advisory Discovery Context",
		...advisory.map(
			(action) =>
				`- [${action.rank}] ${action.reason} (${action.path}); no repair action proposed unless promoted to current behavior scope.`,
		),
		"",
	].join("\n");

	return {
		mode: "dry-run",
		applied: [],
		proposed,
		refused,
		advisory,
		would_write: wouldWrite,
		evidence: {
			path: evidencePath,
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
		would_write: [
			...new Set([
				...applied.flatMap((action) => action.would_write).map(toPosix),
				toPosix(path.relative(rootDir, evidencePath)),
			]),
		],
		evidence: {
			path: toPosix(path.relative(rootDir, evidencePath)),
			written: true,
			markdown: content,
		},
	};
}
