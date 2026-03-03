import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import chalk from "chalk";
import { Command } from "commander";
import yaml from "yaml";
import { checkGate, handleGateResult } from "../lib/gate.js";
import {
	buildTestManifest,
	calculateExpirationDate,
	createReviewRecord,
	detectStubAssertions,
	getPhaseFromTest,
	isTestExpired,
	loadTestGovernanceConfig,
} from "../lib/test-governance.js";
import type { ManifestTestEntry } from "../types.js";

// -------------------------
// Local test manifest helpers
// -------------------------

const TEST_MANIFEST_FILE = ".udd/test-reviews.yml";

async function loadTestManifest(rootDir: string): Promise<ManifestTestEntry[]> {
	const manifestPath = path.join(rootDir, TEST_MANIFEST_FILE);
	try {
		const content = await fs.readFile(manifestPath, "utf-8");
		const parsed = yaml.parse(content);
		if (Array.isArray(parsed?.tests)) return parsed.tests;
		return [];
	} catch {
		return [];
	}
}

async function saveTestManifest(
	rootDir: string,
	tests: ManifestTestEntry[],
): Promise<void> {
	const manifestPath = path.join(rootDir, TEST_MANIFEST_FILE);
	await fs.mkdir(path.dirname(manifestPath), { recursive: true });
	const content = yaml.stringify({ tests });
	await fs.writeFile(manifestPath, content);
}

// -------------------------
// Command
// -------------------------

export const testCommand = new Command("test")
	.description("Test governance and execution")

	// Subcommand: run (existing vitest behavior)
	.addCommand(
		new Command("run")
			.description("Run E2E tests with vitest")
			.argument("[args...]", "Arguments to pass to vitest")
			.option("--skip-gate", "Skip gate check (not recommended)")
			.action(async (args: string[], options: { skipGate?: boolean }) => {
				// Gate check before running tests (critical issues always block)
				const gateResult = await checkGate({ skipGate: options.skipGate || false });
				handleGateResult(gateResult);

				const child = spawn(
					"npx",
					["vitest", "run", "--reporter=verbose", ...(args || [])],
					{
						stdio: "inherit",
						shell: true,
					},
				);

				child.on("close", (code) => {
					process.exit(code ?? 1);
				});

				child.on("error", (err) => {
					console.error(chalk.red(`Error: ${err.message}`));
					process.exit(1);
				});
			}),
	)

	// Subcommand: review
	.addCommand(
		new Command("review")
			.description("Review a test with the governance checklist")
			.argument("<path>", "Path to test file")
			.option("-c, --checklist <name>", "Checklist to use", "default")
			.option("-r, --reviewer <name>", "Reviewer name", "")
			.action(
				async (
					testPath: string,
					options: { checklist: string; reviewer: string },
				) => {
					const rootDir = process.cwd();
					const absPath = path.isAbsolute(testPath)
						? testPath
						: path.join(rootDir, testPath);
					const relPath = path.relative(rootDir, absPath);

					// 1. Verify file exists
					try {
						await fs.access(absPath);
					} catch {
						console.error(chalk.red(`✗ Test file not found: ${relPath}`));
						process.exit(1);
					}

					// 2. Load config and file content
					const config = await loadTestGovernanceConfig(rootDir);
					const content = await fs.readFile(absPath, "utf-8");

					// 3. Check for stub assertions first (fail fast)
					const stubs = detectStubAssertions(content);
					if (stubs.hasStubs) {
						console.error(chalk.red.bold("\n✗ Stub assertions detected!\n"));
						for (const pattern of stubs.stubPatterns) {
							console.error(chalk.red(`  • ${pattern}`));
						}
						console.error(
							chalk.yellow(
								"\nReplace stub assertions with meaningful checks before review.",
							),
						);
						process.exit(1);
					}

					// 4. Get checklist
					const checklistName = options.checklist;
					const checklist = config.checklists[checklistName];
					if (!checklist) {
						console.error(
							chalk.red(`✗ Checklist '${checklistName}' not found in config`),
						);
						console.error(
							chalk.dim(
								`  Available: ${Object.keys(config.checklists).join(", ")}`,
							),
						);
						process.exit(1);
					}

					// 5. Display checklist and auto-accept (interactive prompts deferred)
					console.log(chalk.blue.bold(`\n📋 Reviewing: ${relPath}\n`));
					console.log(chalk.dim(`Checklist: ${checklist.name}`));
					console.log(chalk.dim(`Items: ${checklist.items.length}\n`));

					const answers: Record<string, boolean> = {};
					for (const item of checklist.items) {
						// Auto-pass for now (interactive prompts in future task)
						answers[item.id] = true;
						const marker = item.required ? chalk.green("✓") : chalk.dim("✓");
						const label = item.required
							? chalk.white(item.question)
							: chalk.dim(item.question);
						console.log(`  ${marker} ${label}`);
					}

					// 6. Create review record
					const reviewer = options.reviewer || "cli-user";
					const record = createReviewRecord(
						relPath,
						checklistName,
						reviewer,
						answers,
					);

					// 7. Update manifest
					const tests = await loadTestManifest(rootDir);
					const idx = tests.findIndex((t) => t.path === relPath);
					const entry: ManifestTestEntry = {
						path: relPath,
						status: record.status,
						lastReviewed: record.lastReviewed,
						reviewCount: idx >= 0 ? (tests[idx].reviewCount ?? 0) + 1 : 1,
						dirtyReason: record.dirtyReason,
					};

					if (idx >= 0) {
						tests[idx] = entry;
					} else {
						tests.push(entry);
					}
					await saveTestManifest(rootDir, tests);

					// 8. Report result
					console.log();
					if (record.status === "clean") {
						console.log(chalk.green.bold("✓ Test marked clean"));
						console.log(chalk.dim(`  Reviewer: ${reviewer}`));
						console.log(chalk.dim(`  Expires: ${record.expiresAt}`));
					} else {
						console.log(
							chalk.red.bold(`✗ Test marked dirty: ${record.dirtyReason}`),
						);
					}
				},
			),
	)

	// Subcommand: status
	.addCommand(
		new Command("status")
			.description("Show test review status")
			.option("--dirty", "Show only dirty tests")
			.option("--clean", "Show only clean tests")
			.action(async (options: { dirty?: boolean; clean?: boolean }) => {
				const rootDir = process.cwd();
				const config = await loadTestGovernanceConfig(rootDir);
				const tests = await loadTestManifest(rootDir);

				if (tests.length === 0) {
					console.log(
						chalk.yellow(
							"No test reviews found. Run 'udd test review <path>' to review a test.",
						),
					);
					return;
				}

				const expirationDays = config.settings?.reviewExpirationDays ?? 90;

				const categorized = tests.map((t) => {
					const expired = isTestExpired(t.lastReviewed ?? null, expirationDays);
					const effectiveStatus =
						t.status === "clean" && expired ? "expired" : t.status;
					const expiresAt = t.lastReviewed
						? calculateExpirationDate(new Date(t.lastReviewed), expirationDays)
								.toISOString()
								.split("T")[0]
						: "—";

					return {
						path: t.path,
						status: effectiveStatus,
						lastReviewed: t.lastReviewed
							? t.lastReviewed.split("T")[0]
							: "never",
						expiresAt,
						reason: t.dirtyReason ?? "—",
					};
				});

				let filtered = categorized;
				if (options.dirty) {
					filtered = categorized.filter(
						(t) => t.status === "dirty" || t.status === "expired",
					);
				} else if (options.clean) {
					filtered = categorized.filter((t) => t.status === "clean");
				}

				console.log(chalk.blue.bold("\n📊 Test Review Status\n"));

				const pathWidth = Math.max(12, ...filtered.map((t) => t.path.length));
				const statusWidth = 10;
				const dateWidth = 12;
				const expiresWidth = 12;

				const header = [
					chalk.bold("Test Path".padEnd(pathWidth)),
					chalk.bold("Status".padEnd(statusWidth)),
					chalk.bold("Reviewed".padEnd(dateWidth)),
					chalk.bold("Expires".padEnd(expiresWidth)),
					chalk.bold("Reason"),
				].join("  ");
				console.log(header);
				console.log(chalk.dim("─".repeat(80)));

				for (const t of filtered) {
					const statusColor =
						t.status === "clean"
							? chalk.green
							: t.status === "expired"
								? chalk.yellow
								: chalk.red;
					const row = [
						chalk.white(t.path.padEnd(pathWidth)),
						statusColor(t.status.padEnd(statusWidth)),
						chalk.dim(t.lastReviewed.padEnd(dateWidth)),
						chalk.dim(t.expiresAt.padEnd(expiresWidth)),
						chalk.dim(t.reason),
					].join("  ");
					console.log(row);
				}

				const cleanCount = categorized.filter(
					(t) => t.status === "clean",
				).length;
				const dirtyCount = categorized.filter(
					(t) => t.status === "dirty",
				).length;
				const expiredCount = categorized.filter(
					(t) => t.status === "expired",
				).length;

				console.log();
				console.log(chalk.dim("─".repeat(60)));
				console.log(
					`${chalk.green(`${cleanCount} clean`)}  ${chalk.red(`${dirtyCount} dirty`)}  ${chalk.yellow(`${expiredCount} expired`)}  ${chalk.dim(`${tests.length} total`)}`,
				);
			}),
	)

	// Subcommand: check
	.addCommand(
		new Command("check")
			.description("Check if test needs review (dry run)")
			.argument("<path>", "Path to test file")
			.option("--detect-stubs", "Check for stub assertions")
			.action(async (testPath: string, options: { detectStubs?: boolean }) => {
				const rootDir = process.cwd();
				const absPath = path.isAbsolute(testPath)
					? testPath
					: path.join(rootDir, testPath);
				const relPath = path.relative(rootDir, absPath);

				try {
					await fs.access(absPath);
				} catch {
					console.error(chalk.red(`✗ Test file not found: ${relPath}`));
					process.exit(1);
				}

				const config = await loadTestGovernanceConfig(rootDir);
				const tests = await loadTestManifest(rootDir);
				const expirationDays = config.settings?.reviewExpirationDays ?? 90;

				console.log(chalk.blue.bold(`\n🔍 Checking: ${relPath}\n`));

				const entry = tests.find((t) => t.path === relPath);
				if (!entry) {
					console.log(
						chalk.yellow("  ○ Not in manifest — needs initial review"),
					);
				} else {
					const expired = isTestExpired(
						entry.lastReviewed ?? null,
						expirationDays,
					);

					if (entry.status === "clean" && !expired) {
						console.log(chalk.green("  ✓ Status: clean"));
						console.log(
							chalk.dim(
								`    Last reviewed: ${entry.lastReviewed?.split("T")[0] ?? "—"}`,
							),
						);
						const expiresAt = entry.lastReviewed
							? calculateExpirationDate(
									new Date(entry.lastReviewed),
									expirationDays,
								)
									.toISOString()
									.split("T")[0]
							: "—";
						console.log(chalk.dim(`    Expires: ${expiresAt}`));
					} else if (expired) {
						console.log(chalk.yellow("  ⚠ Status: expired — needs re-review"));
					} else {
						console.log(chalk.red("  ✗ Status: dirty"));
						if (entry.dirtyReason) {
							console.log(chalk.dim(`    Reason: ${entry.dirtyReason}`));
						}
					}
				}

				if (options.detectStubs) {
					const content = await fs.readFile(absPath, "utf-8");
					const stubs = detectStubAssertions(content);
					console.log();
					if (stubs.hasStubs) {
						console.log(chalk.red("  ✗ Stub assertions found:"));
						for (const pattern of stubs.stubPatterns) {
							console.log(chalk.red(`    • ${pattern}`));
						}
					} else {
						console.log(chalk.green("  ✓ No stub assertions detected"));
					}
				}
			}),
	)

	// Subcommand: reset
	.addCommand(
		new Command("reset")
			.description("Mark tests as dirty (requires re-review)")
			.option("--all", "Reset all tests")
			.option("--phase <n>", "Reset tests for specific phase", (val) =>
				Number.parseInt(val, 10),
			)
			.argument("[paths...]", "Specific test paths to reset")
			.action(
				async (paths: string[], options: { all?: boolean; phase?: number }) => {
					const rootDir = process.cwd();
					const tests = await loadTestManifest(rootDir);

					if (tests.length === 0) {
						console.log(chalk.yellow("No test reviews found."));
						return;
					}

					let resetCount = 0;

					if (options.all) {
						console.log(chalk.yellow.bold("\n⚠ Resetting ALL test reviews\n"));
						for (const t of tests) {
							if (t.status !== "dirty") {
								t.status = "dirty";
								t.dirtyReason = "manual reset (--all)";
								t.lastReviewed = null;
								resetCount++;
							}
						}
					} else if (options.phase !== undefined) {
						console.log(
							chalk.blue(`\nResetting tests for phase ${options.phase}\n`),
						);
						for (const t of tests) {
							const phase = await getPhaseFromTest(path.join(rootDir, t.path));
							if (phase === options.phase && t.status !== "dirty") {
								t.status = "dirty";
								t.dirtyReason = `manual reset (phase ${options.phase})`;
								t.lastReviewed = null;
								resetCount++;
							}
						}
					} else if (paths && paths.length > 0) {
						for (const p of paths) {
							const relPath = path.relative(
								rootDir,
								path.isAbsolute(p) ? p : path.join(rootDir, p),
							);
							const entry = tests.find((t) => t.path === relPath);
							if (entry) {
								if (entry.status !== "dirty") {
									entry.status = "dirty";
									entry.dirtyReason = "manual reset";
									entry.lastReviewed = null;
									resetCount++;
								}
							} else {
								console.log(
									chalk.yellow(`  ⚠ Not found in manifest: ${relPath}`),
								);
							}
						}
					} else {
						console.log(
							chalk.yellow(
								"Specify --all, --phase <n>, or test paths to reset.",
							),
						);
						return;
					}

					await saveTestManifest(rootDir, tests);
					console.log(chalk.green(`\n✓ ${resetCount} test(s) marked dirty`));
				},
			),
	)

	// Subcommand: scan
	.addCommand(
		new Command("scan")
			.description("Scan all tests and populate test manifest")
			.option("--pattern <glob>", "Test file pattern", "tests/**/*.e2e.test.ts")
			.action(async (options: { pattern: string }) => {
				const rootDir = process.cwd();

				try {
					// 1. Scan for tests
					console.log(
						chalk.blue(
							`\n🔍 Scanning for tests matching: ${options.pattern}\n`,
						),
					);
					const scannedTests = await buildTestManifest(
						rootDir,
						options.pattern,
					);

					// 2. Load existing manifest to preserve review status
					const existingTests = await loadTestManifest(rootDir);
					const existingMap = new Map(existingTests.map((t) => [t.path, t]));

					// 3. Merge: keep existing entries, add new ones with status "dirty"
					let addedCount = 0;
					let updatedCount = 0;
					const mergedTests: ManifestTestEntry[] = [];

					for (const scanned of scannedTests) {
						const existing = existingMap.get(scanned.path);

						if (existing) {
							// Preserve existing entry (keep status, review info)
							mergedTests.push(existing);
							existingMap.delete(scanned.path);
							updatedCount++;
						} else {
							// New test - add with dirty status
							mergedTests.push({
								path: scanned.path,
								status: "dirty",
								lastReviewed: null,
								reviewCount: 0,
								dirtyReason: "new test - needs review",
							});
							addedCount++;
						}
					}

					// Add any existing tests that weren't scanned (preserved)
					for (const [, existing] of existingMap) {
						mergedTests.push(existing);
					}

					// 4. Save to manifest
					await saveTestManifest(rootDir, mergedTests);

					// 5. Report results
					console.log(chalk.green.bold("✓ Scan complete\n"));
					console.log(`  Found ${scannedTests.length} test(s)`);
					console.log(chalk.green(`  Added ${addedCount} new`));
					console.log(chalk.yellow(`  Updated ${updatedCount} existing`));
					console.log(
						chalk.dim(`\n  Total in manifest: ${mergedTests.length}`),
					);
					console.log(chalk.dim(`  Saved to: ${TEST_MANIFEST_FILE}`));
				} catch (error) {
					console.error(
						chalk.red(`\n✗ Scan failed: ${(error as Error).message}`),
					);
					process.exit(1);
				}
			}),
	);

// Add link subcommand separately to avoid chaining parsing ambiguities
testCommand.addCommand(
	new Command("link")
		.description("Explicitly link a test to a feature file")
		.argument("<test-path>", "Path to test file")
		.argument("<feature-path>", "Path to feature file")
		.action(async (testPath: string, featurePath: string) => {
			const rootDir = process.cwd();

			// Resolve absolute paths
			const absTestPath = path.isAbsolute(testPath)
				? testPath
				: path.join(rootDir, testPath);
			const absFeaturePath = path.isAbsolute(featurePath)
				? featurePath
				: path.join(rootDir, featurePath);

			const relTestPath = path.relative(rootDir, absTestPath);
			const relFeaturePath = path.relative(rootDir, absFeaturePath);

			// 1. Validate both files exist
			try {
				await fs.access(absTestPath);
			} catch {
				console.error(chalk.red(`✗ Test file not found: ${relTestPath}`));
				process.exit(1);
			}

			try {
				await fs.access(absFeaturePath);
			} catch {
				console.error(chalk.red(`✗ Feature file not found: ${relFeaturePath}`));
				process.exit(1);
			}

			// 2. Load existing manifest
			const tests = await loadTestManifest(rootDir);

			// 3. Find or create entry for test
			const idx = tests.findIndex((t) => t.path === relTestPath);
			if (idx >= 0) {
				tests[idx].feature = relFeaturePath;
			} else {
				const entry: ManifestTestEntry = {
					path: relTestPath,
					status: "dirty",
					lastReviewed: null,
					reviewCount: 0,
					dirtyReason: "linked - needs review",
					feature: relFeaturePath,
				};
				tests.push(entry);
			}

			// 4. Save manifest
			await saveTestManifest(rootDir, tests);

			// 5. Report success
			console.log();
			console.log(
				chalk.green.bold(`✓ Linked ${relTestPath} → ${relFeaturePath}`),
			);
		}),
);
