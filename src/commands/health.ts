import chalk from "chalk";
import { Command } from "commander";
import { detectDrift } from "./doctor.js";

export const healthCommand = new Command("health-check")
	.description("Check project health and drift status")
	.option("--json", "Output health status as JSON")
	.option("--verbose", "Show detailed health information")
	.action(async (options) => {
		try {
			const drift = await detectDrift();
			const isHealthy = drift.status === "clean";

			if (options.json) {
				console.log(
					JSON.stringify(
						{
							healthy: isHealthy,
							status: drift.status,
							summary: drift.summary,
							lastCheck: drift.lastCheck,
						},
						null,
						2,
					),
				);
			} else {
				if (isHealthy) {
					console.log(chalk.green("✓ Project is healthy"));
					console.log(chalk.dim(`  Last check: ${drift.lastCheck}`));
				} else {
					console.log(chalk.yellow("⚠ Project has drift issues"));
					console.log(chalk.dim(`  Critical: ${drift.summary.critical}`));
					console.log(chalk.dim(`  Warning: ${drift.summary.warning}`));
					console.log(chalk.dim(`  Info: ${drift.summary.info}`));
					console.log(chalk.dim(`\n  Run 'udd doctor' for details`));
				}
			}

			process.exit(isHealthy ? 0 : 1);
		} catch (error) {
			console.error(chalk.red("Health check failed:"), error);
			process.exit(1);
		}
	});
