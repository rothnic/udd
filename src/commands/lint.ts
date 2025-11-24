import chalk from "chalk";
import { Command } from "commander";
import { validateSpecs } from "../lib/validator.js";

export const lintCommand = new Command("lint")
	.description("Validate spec structure and relationships")
	.action(async () => {
		try {
			const results = await validateSpecs();
			if (results.valid) {
				console.log(chalk.green("All specs are valid"));
				process.exit(0);
			} else {
				console.error(chalk.red("Spec validation failed:"));
				results.errors.forEach((err) => {
					console.error(chalk.red(`- ${err}`));
				});
				process.exit(1);
			}
		} catch (error) {
			console.error(
				chalk.red("An unexpected error occurred during linting:"),
				error,
			);
			process.exit(1);
		}
	});
