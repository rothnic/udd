import chalk from "chalk";
import { Command } from "commander";
import {
	buildAgentIssueList,
	buildAgentProjectSnapshot,
	recommendNextAgentWork,
} from "../lib/agent-integration.js";
import { analyzeProjectDiagnostics } from "../lib/diagnostics.js";
import { getProjectStatus } from "../lib/status.js";

async function getAgentInputs() {
	const [status, diagnostics] = await Promise.all([
		getProjectStatus(),
		analyzeProjectDiagnostics(),
	]);

	return { status, diagnostics };
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
		const recommendation = recommendNextAgentWork(status, diagnostics);

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
