import { spawn } from "node:child_process";
import path from "node:path";
import chalk from "chalk";
import { Command } from "commander";
import {
	checkTestGate,
	loadTestReviewManifest,
	reviewTest,
	scanTests,
} from "../lib/test-governance.js";

export const testCommand = new Command("test");

testCommand
	.description("Run E2E tests with visual feedback")
	.argument("[args...]", "Arguments to pass to vitest")
	.action(async (args) => {
		const vitestBin = path.resolve(
			process.cwd(),
			"node_modules/vitest/vitest.mjs",
		);
		const useBun = process.env.UDD_TEST_RUNTIME === "bun";
		const command = useBun ? "bun" : process.execPath;
		const commandArgs = useBun
			? ["--bun", vitestBin, "run", "--reporter=verbose", ...(args || [])]
			: [vitestBin, "run", "--reporter=verbose", ...(args || [])];

		const child = spawn(command, commandArgs, {
			stdio: "inherit",
			shell: false,
		});

		child.on("close", (code) => {
			process.exit(code ?? 1);
		});

		child.on("error", (err) => {
			console.error(err);
			process.exit(1);
		});
	});

testCommand
	.command("scan")
	.description("Scan tests for feature links and stub assertions")
	.option("--json", "Output scan result as JSON")
	.action(async (options: { json?: boolean }) => {
		const entries = await scanTests();
		const linked = entries.filter((entry) => entry.status === "linked").length;
		const unlinked = entries.filter(
			(entry) => entry.status === "unlinked",
		).length;
		const orphaned = entries.filter(
			(entry) => entry.status === "orphaned",
		).length;
		const stubbed = entries.filter(
			(entry) => entry.stubAssertions.length > 0,
		).length;

		if (options.json) {
			console.log(
				JSON.stringify(
					{
						summary: {
							total: entries.length,
							linked,
							unlinked,
							orphaned,
							stubbed,
						},
						tests: entries,
					},
					null,
					2,
				),
			);
			return;
		}

		console.log(chalk.bold("Test Scan"));
		console.log(chalk.dim("========="));
		console.log(
			`Total: ${entries.length}  Linked: ${linked}  Unlinked: ${unlinked}  Orphaned: ${orphaned}  Stubbed: ${stubbed}`,
		);
		for (const entry of entries) {
			const marker =
				entry.status === "linked"
					? chalk.green("✓")
					: entry.status === "orphaned"
						? chalk.red("✗")
						: chalk.yellow("○");
			const feature = entry.feature ? ` -> ${entry.feature}` : "";
			const stubLabel =
				entry.stubAssertions.length > 0 ? chalk.red(" [stub assertions]") : "";
			console.log(`  ${marker} ${entry.path}${feature}${stubLabel}`);
		}
	});

testCommand
	.command("review")
	.description("Review a test and record local clean state")
	.argument("<path>", "Path to the test file")
	.action(async (testPath: string) => {
		try {
			const record = await reviewTest(testPath);
			console.log(chalk.green(`✓ Test reviewed: ${record.path}`));
			if (record.feature) {
				console.log(chalk.dim(`  Feature: ${record.feature}`));
			}
			console.log(chalk.dim(`  Review count: ${record.reviewCount}`));
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error);
			console.error(chalk.red(`✗ ${message}`));
			process.exit(1);
		}
	});

testCommand
	.command("status")
	.description("Show local test review state")
	.option("--json", "Output review state as JSON")
	.action(async (options: { json?: boolean }) => {
		const manifest = await loadTestReviewManifest();
		if (options.json) {
			console.log(JSON.stringify(manifest, null, 2));
			return;
		}

		console.log(chalk.bold("Test Review Status"));
		console.log(chalk.dim("=================="));
		if (manifest.tests.length === 0) {
			console.log(chalk.yellow("No reviewed tests found."));
			console.log(
				chalk.dim("Run `udd test review <path>` after reviewing a test."),
			);
			return;
		}

		for (const test of manifest.tests) {
			const marker =
				test.status === "clean" ? chalk.green("✓") : chalk.red("✗");
			const reviewed = test.lastReviewed
				? test.lastReviewed.split("T")[0]
				: "never";
			const reason = test.dirtyReason ? ` (${test.dirtyReason})` : "";
			console.log(`  ${marker} ${test.path} ${chalk.dim(reviewed)}${reason}`);
		}
	});

testCommand
	.command("gate")
	.description("Run explicit local test-governance gate checks")
	.option(
		"--strict",
		"Fail on gate findings instead of reporting advisory status",
	)
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
		for (const entry of result.dirtyReviews) {
			console.log(chalk.red(`  Dirty review: ${entry.path}`));
		}

		if (options.strict) {
			process.exit(1);
		} else {
			console.log(
				chalk.dim(
					"Advisory only. Use `udd test gate --strict` to fail on findings.",
				),
			);
		}
	});
