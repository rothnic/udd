import chalk from "chalk";
import { Command } from "commander";
import { getProjectStatus } from "../lib/status";

export const statusCommand = new Command("status")
	.description("Summarize current test-based status")
	.option("--json", "Output status as JSON")
	.action(async (options) => {
		try {
			const status = await getProjectStatus();

			if (options.json) {
				console.log(JSON.stringify(status, null, 2));
			} else {
				console.log(chalk.bold("Project Status"));
				console.log(chalk.dim("=============="));

				console.log(chalk.bold("\nActive Features:"));
				status.active_features.forEach((f) => {
					console.log(`- ${f}`);
				});

				console.log(chalk.bold("\nFeature Details:"));
				for (const [id, feature] of Object.entries(status.features)) {
					console.log(chalk.blue(`\n${id}`));
					console.log("  Scenarios:");
					for (const [slug, sStatus] of Object.entries(feature.scenarios)) {
						const color =
							sStatus.e2e === "passing"
								? chalk.green
								: sStatus.e2e === "failing"
									? chalk.red
									: chalk.yellow;
						console.log(`    ${slug}: ${color(sStatus.e2e)}`);
					}
					console.log("  Requirements:");
					for (const [key, rStatus] of Object.entries(feature.requirements)) {
						const color =
							rStatus.tests === "passing"
								? chalk.green
								: rStatus.tests === "failing"
									? chalk.red
									: chalk.yellow;
						console.log(`    ${key}: ${color(rStatus.tests)}`);
					}
				}
			}
		} catch (error) {
			console.error(chalk.red("Error getting status:"), error);
			process.exit(1);
		}
	});
