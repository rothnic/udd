import chalk from "chalk";
import { Command } from "commander";
import { scanTests } from "../lib/test-governance.js";

export const testScanCommand = new Command("test-scan")
	.description(
		"Scan tests for linked, unlinked, orphaned, and stubbed coverage",
	)
	.option("--json", "Output scan result as JSON")
	.action(async (options: { json?: boolean }) => {
		const tests = await scanTests();
		const summary = {
			total: tests.length,
			linked: tests.filter((entry) => entry.status === "linked").length,
			unlinked: tests.filter((entry) => entry.status === "unlinked").length,
			orphaned: tests.filter((entry) => entry.status === "orphaned").length,
			stubbed: tests.filter((entry) => entry.stubAssertions.length > 0).length,
		};

		if (options.json) {
			console.log(JSON.stringify({ summary, tests }, null, 2));
			return;
		}

		console.log(chalk.bold("Test Scan"));
		console.log(chalk.dim("========="));
		console.log(
			`Total: ${summary.total}  Linked: ${summary.linked}  Unlinked: ${summary.unlinked}  Orphaned: ${summary.orphaned}  Stubbed: ${summary.stubbed}`,
		);
	});
