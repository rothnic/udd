import chalk from "chalk";
import { Command } from "commander";
import { analyzeProjectDiagnostics } from "../lib/diagnostics.js";

export const doctorCommand = new Command("doctor")
	.description("Diagnose UDD project health and drift")
	.option("--json", "Output diagnostics as JSON")
	.option("--strict", "Exit with code 1 when any issue is detected")
	.action(async (options) => {
		const report = await analyzeProjectDiagnostics();

		if (options.json) {
			console.log(JSON.stringify(report, null, 2));
		} else {
			console.log(chalk.bold("UDD Doctor"));
			console.log(chalk.dim("=========="));
			console.log("");

			if (report.healthy) {
				console.log(chalk.green("Project is healthy"));
			} else {
				console.log(chalk.yellow(`Found ${report.summary.total} issue(s)`));
				console.log(
					chalk.dim(
						`Critical: ${report.summary.critical}  Warning: ${report.summary.warning}  Info: ${report.summary.info}`,
					),
				);
				console.log("");

				for (const issue of report.issues) {
					const color =
						issue.severity === "critical"
							? chalk.red
							: issue.severity === "warning"
								? chalk.yellow
								: chalk.blue;
					console.log(color(`${issue.severity.toUpperCase()} ${issue.type}`));
					console.log(`  ${issue.message}`);
					console.log(chalk.dim(`  File: ${issue.file}`));
					console.log(chalk.dim(`  Next: ${issue.recommendation}`));
				}
			}
		}

		if (options.strict && !report.healthy) {
			process.exitCode = 1;
		}
	});
