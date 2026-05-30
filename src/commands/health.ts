import chalk from "chalk";
import { Command } from "commander";
import { analyzeProjectDiagnostics } from "../lib/diagnostics.js";

export const healthCommand = new Command("health-check")
	.description("Check UDD project health")
	.option("--json", "Output health status as JSON")
	.action(async (options) => {
		const report = await analyzeProjectDiagnostics();
		const payload = {
			healthy: report.healthy,
			status: report.status,
			summary: report.summary,
			issues: report.issues,
			lastCheck: report.lastCheck,
		};

		if (options.json) {
			console.log(JSON.stringify(payload, null, 2));
		} else if (report.healthy) {
			console.log(chalk.green("Project is healthy"));
		} else {
			console.log(chalk.yellow("Project has health issues"));
			console.log(
				chalk.dim(
					`Critical: ${report.summary.critical}  Warning: ${report.summary.warning}  Info: ${report.summary.info}`,
				),
			);
			console.log(chalk.dim("Run 'udd doctor' for details."));
		}

		process.exitCode = report.healthy ? 0 : 1;
	});
