import chalk from "chalk";
import { Command } from "commander";
import { checkTestGate } from "../lib/test-governance.js";

export const gateCommand = new Command("gate").description(
	"Run UDD governance gates",
);

gateCommand
	.command("test-governance")
	.description("Report test-governance findings, failing only in strict mode")
	.option("--strict", "Fail on blocking findings")
	.option("--json", "Output gate result as JSON")
	.action(async (options: { strict?: boolean; json?: boolean }) => {
		const result = await checkTestGate();

		if (options.json) {
			console.log(JSON.stringify(result, null, 2));
			if (options.strict && !result.passed) process.exit(1);
			return;
		}

		if (result.passed) {
			console.log(chalk.green("✓ Test governance gate passed"));
			return;
		}

		console.log(chalk.yellow("Test governance findings"));
		for (const issue of result.reviewManifestIssues) {
			console.log(chalk.red(`  Review manifest issue: ${issue}`));
		}
		for (const entry of result.stubbedTests) {
			console.log(chalk.red(`  Stub assertions: ${entry.path}`));
		}
		for (const entry of result.orphanedTests) {
			console.log(
				chalk.red(`  Orphaned feature link: ${entry.path} -> ${entry.feature}`),
			);
		}
		for (const entry of result.unlinkedTests) {
			console.log(chalk.red(`  Unlinked test proof: ${entry.path}`));
		}
		for (const entry of result.dirtyReviews) {
			console.log(chalk.red(`  Dirty review: ${entry.path}`));
		}

		if (options.strict) {
			process.exit(1);
		} else {
			console.log(
				chalk.dim(
					"Advisory only. Use `udd gate test-governance --strict` to fail on findings.",
				),
			);
		}
	});
