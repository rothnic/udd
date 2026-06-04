import { execFile } from "node:child_process";
import { promisify } from "node:util";
import chalk from "chalk";
import { Command } from "commander";
import {
	buildAgentEvidencePackage,
	buildAgentIssueList,
	buildAgentProjectSnapshot,
	recommendNextAgentWorkWithGovernance,
} from "../lib/agent-integration.js";
import { analyzeProjectDiagnostics } from "../lib/diagnostics.js";
import { getProjectStatus } from "../lib/status.js";
import { validateSpecs } from "../lib/validator.js";

const execFileAsync = promisify(execFile);

async function getAgentInputs() {
	const [status, diagnostics] = await Promise.all([
		getProjectStatus(),
		analyzeProjectDiagnostics(),
	]);

	return { status, diagnostics };
}

export function parseGitPorcelainChangedFiles(stdout: string): string[] {
	return [
		...new Set(
			stdout
				.split("\n")
				.filter((line) => line.trim() !== "")
				.map((line) => {
					const status = line.slice(0, 2);
					const pathPart = line.slice(3).trim();
					if (status.includes("R") || status.includes("C")) {
						const renamed = pathPart.match(/^(.*?) -> (.*?)$/);
						return renamed?.[2] ?? pathPart;
					}
					return pathPart;
				}),
		),
	].sort();
}

async function getChangedFiles(): Promise<string[]> {
	try {
		const { stdout } = await execFileAsync("git", ["status", "--porcelain"]);
		return parseGitPorcelainChangedFiles(stdout);
	} catch {
		return [];
	}
}

export const opencodeCommand = new Command("opencode").description(
	"OpenCode adapter commands backed by shared UDD project state",
);

opencodeCommand
	.command("status")
	.description("Show deep UDD project status for OpenCode sessions")
	.option("--json", "Output JSON for agent consumption")
	.action(async (options) => {
		const { status, diagnostics } = await getAgentInputs();
		const snapshot = buildAgentProjectSnapshot(status, diagnostics);

		if (options.json) {
			console.log(JSON.stringify(snapshot, null, 2));
			return;
		}

		console.log(chalk.bold("OpenCode Agent Status"));
		console.log(chalk.dim("====================="));
		console.log("");
		console.log(`Project: ${snapshot.project.name}`);
		console.log(
			`Current Phase: Phase ${snapshot.phase.current} - ${snapshot.phase.name}`,
		);
		console.log(
			`Health: ${
				snapshot.health.healthy
					? chalk.green("healthy")
					: chalk.yellow(snapshot.health.status)
			}`,
		);
		console.log(
			`Scenarios: ${snapshot.scenarios.total} total, ${snapshot.scenarios.passing} passing, ${snapshot.scenarios.failing} failing, ${snapshot.scenarios.missing} missing, ${snapshot.scenarios.stale} stale`,
		);
		console.log(
			`Issues: ${snapshot.health.summary.total} total (${snapshot.health.summary.critical} critical, ${snapshot.health.summary.warning} warning, ${snapshot.health.summary.info} info)`,
		);
		console.log(
			`Git: ${snapshot.git.branch} ${snapshot.git.clean ? "clean" : "dirty"}`,
		);
	});

opencodeCommand
	.command("next")
	.description("Recommend the next UDD work item for an OpenCode session")
	.option("--json", "Output JSON for agent consumption")
	.action(async (options) => {
		const { status, diagnostics } = await getAgentInputs();
		const recommendation = await recommendNextAgentWorkWithGovernance(
			status,
			diagnostics,
		);

		if (options.json) {
			console.log(JSON.stringify(recommendation, null, 2));
			return;
		}

		console.log(chalk.bold("OpenCode Next Work"));
		console.log(chalk.dim("=================="));
		console.log("");
		console.log(`Recommended: ${recommendation.recommended}`);
		console.log(`Reason: ${recommendation.reason}`);
		if (recommendation.suggested_files.length > 0) {
			console.log("");
			console.log(chalk.bold("Suggested Files:"));
			for (const file of recommendation.suggested_files) {
				console.log(`- ${file.path}: ${file.action}`);
			}
		}
	});

opencodeCommand
	.command("issues")
	.description("List UDD diagnostic issues for an OpenCode session")
	.option("--json", "Output JSON for agent consumption")
	.action(async (options) => {
		const diagnostics = await analyzeProjectDiagnostics();
		const issues = buildAgentIssueList(diagnostics);
		const output = {
			status: diagnostics.status,
			healthy: diagnostics.healthy,
			summary: diagnostics.summary,
			issues,
			generated_at: diagnostics.lastCheck,
		};

		if (options.json) {
			console.log(JSON.stringify(output, null, 2));
			return;
		}

		console.log(chalk.bold("OpenCode UDD Issues"));
		console.log(chalk.dim("==================="));
		console.log("");
		console.log(
			`Issues: ${output.summary.total} total (${output.summary.critical} critical, ${output.summary.warning} warning, ${output.summary.info} info)`,
		);

		for (const issue of issues) {
			const color =
				issue.severity === "critical"
					? chalk.red
					: issue.severity === "warning"
						? chalk.yellow
						: chalk.blue;
			console.log("");
			console.log(color(`${issue.severity.toUpperCase()} ${issue.type}`));
			console.log(`File: ${issue.file}`);
			console.log(issue.message);
			console.log(chalk.dim(`Next: ${issue.recommendation}`));
		}
	});

opencodeCommand
	.command("evidence")
	.description("Build an adapter-neutral review evidence package")
	.option("--json", "Output JSON for agent consumption")
	.option("--goal <path>", "Goal file path this evidence supports")
	.action(async (options: { json?: boolean; goal?: string }) => {
		const { status, diagnostics } = await getAgentInputs();
		const lint = await validateSpecs();
		const evidence = await buildAgentEvidencePackage(status, diagnostics, {
			goalPath: options.goal,
			goalStatus:
				diagnostics.summary.critical === 0 ? "in_progress" : "blocked",
			changedFiles: await getChangedFiles(),
			verification: [
				{ command: "./bin/udd status", status: "passed" },
				{
					command: "./bin/udd lint",
					status: lint.valid ? "passed" : "failed",
				},
				{
					command: "npm test -- --run",
					status: "not_run",
				},
			],
			reviewNotes: [
				"Adapter-neutral evidence package generated from shared UDD project facts.",
				"Test status is not inferred from generated local state; attach explicit command output in PR evidence.",
			],
		});

		if (options.json) {
			console.log(JSON.stringify(evidence, null, 2));
			return;
		}

		console.log(chalk.bold("OpenCode Evidence"));
		console.log(chalk.dim("================="));
		console.log("");
		console.log(`Project: ${evidence.project.name}`);
		console.log(`Goal: ${evidence.goal.path ?? "not specified"}`);
		console.log(
			`Issues: ${evidence.issues_summary.total} total (${evidence.issues_summary.critical} critical, ${evidence.issues_summary.warning} warning, ${evidence.issues_summary.info} info)`,
		);
		console.log(`Next: ${evidence.next_recommendation.recommended}`);
	});
