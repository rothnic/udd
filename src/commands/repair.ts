import chalk from "chalk";
import { Command } from "commander";
import { applyRepair, planRepair } from "../lib/repair.js";

export const repairCommand = new Command("repair")
	.description("Plan or apply safe UDD project repairs")
	.option("--dry-run", "List proposed changes without writing files")
	.option("--apply", "Apply only explicit safe repairs")
	.option("--json", "Output repair result as JSON")
	.action(
		async (options: { dryRun?: boolean; apply?: boolean; json?: boolean }) => {
			const result = options.apply ? await applyRepair() : await planRepair();

			if (options.json) {
				console.log(JSON.stringify(result, null, 2));
				return;
			}

			console.log(
				chalk.bold(options.apply ? "UDD Repair Apply" : "UDD Repair Plan"),
			);
			console.log(
				chalk.dim(options.apply ? "================" : "==============="),
			);
			console.log("");
			for (const action of result.proposed) {
				console.log(
					`${options.apply ? chalk.green("✓") : chalk.yellow("•")} ${action.description}`,
				);
				console.log(chalk.dim(`  Path: ${action.path}`));
			}
			for (const action of result.refused) {
				console.log(chalk.red(`✗ ${action.description}`));
				console.log(chalk.dim(`  Path: ${action.path}`));
			}
			if (!options.apply) {
				console.log(
					chalk.dim(
						"Dry run only. Use `udd repair --apply` to apply safe repairs.",
					),
				);
			} else if (result.evidence.written) {
				console.log(chalk.dim(`Evidence: ${result.evidence.path}`));
			}
		},
	);
