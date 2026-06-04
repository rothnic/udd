import chalk from "chalk";
import { Command } from "commander";
import { buildTestGovernanceReport } from "../lib/test-governance.js";

export const testScanCommand = new Command("test-scan")
	.description(
		"Scan tests for linked, unlinked, orphaned, and stubbed coverage",
	)
	.option("--json", "Output scan result as JSON")
	.action(async (options: { json?: boolean }) => {
		const report = await buildTestGovernanceReport();

		if (options.json) {
			console.log(JSON.stringify(report, null, 2));
			return;
		}

		console.log(chalk.bold("Test Scan"));
		console.log(chalk.dim("========="));
		console.log(
			`Total: ${report.summary.total}  Linked: ${report.summary.linked}  Unlinked: ${report.summary.unlinked}  Orphaned: ${report.summary.orphaned}  Stubbed: ${report.summary.stubbed}`,
		);
		console.log(
			`Reviewed: ${report.summary.reviewed}  Stale: ${report.summary.stale}  Missing: ${report.summary.missing}  Blocking: ${report.summary.gate_blocking}`,
		);
		if (report.findings.length > 0) {
			console.log(chalk.bold("Findings"));
			for (const finding of report.findings) {
				const marker = finding.gate_blocking
					? chalk.red("!")
					: chalk.yellow("i");
				console.log(`  ${marker} ${finding.message}`);
			}
		}
	});
