# Implement Task 10 status doctor mode (@Sisyphus-Junior subagent)

**ID**: ses_378791ba3ffe16mRFQBfY3MXxg
**Project ID**: ad761ea6174e58ed763fc75290c3f403ed51079d
**Created**: 2/22/2026, 4:44:50 PM
**Stats**: 1 files changed, +170 -0

---

## USER (4:45:31 PM)

import chalk from "chalk";
import { Command } from "commander";
import fs from "node:fs/promises";
import path from "node:path";
import { getProjectStatus } from "../lib/status.js";
import yaml from "yaml";

export const statusCommand = new Command("status")
	.description("Summarize current test-based status")
	.option("--json", "Output status as JSON")
	.option(
		"--doctor",
		"Run diagnostics and report actionable issues",
	)
	.action(async (options) => {
		try {
			const status = await getProjectStatus();

			// Doctor mode: run diagnostics
			if (options.doctor) {
				const rootDir = process.cwd();
				const issues: string[] = [];
				let exitCode = 0;

				console.log(chalk.bold("UDD Doctor - Diagnostics"));
				console.log(chalk.dim("==================="));

				// 1. Check manifest exists and is parseable
				console.log(chalk.dim("Checking manifest..."));
				const manifestPath = path.join(rootDir, "specs/.udd/manifest.yml");
				try {
					const manifestContent = await fs.readFile(manifestPath, "utf-8");
					try {
							yaml.parse(manifestContent);
						console.log(chalk.green("  ✓ manifest.yml exists and is valid YAML"));
					} catch {
						issues.push("manifest.yml exists but is not valid YAML");
						console.log(chalk.red("  ✗ manifest.yml is not valid YAML"));
						exitCode = 1;
					}
				} catch {
					issues.push("manifest.yml does not exist - run 'udd sync' to generate");
					console.log(chalk.yellow("  ○ manifest.yml not found"));
					console.log(chalk.dim("    Run 'udd sync' to generate it"));
					// Not a fatal error - new projects may not have manifest yet
				}

				// 2. Check journey files exist (if product dir exists)
				console.log(chalk.dim("Checking journeys..."));
				if (status.hasProductDir) {
					const journeysDir = path.join(rootDir, "product/journeys");
					try {
						const journeyFiles = await fs.readdir(journeysDir);
						const mdFiles = journeyFiles.filter(
							(f) => f.endsWith(".md") && !f.startsWith("_"),
						);
						if (mdFiles.length > 0) {
							console.log(
								chalk.green(`  ✓ ${mdFiles.length} journey file(s) found`),
							);
						} else {
							issues.push("No journey files found in product/journeys/");
							console.log(chalk.yellow("  ○ No journey files found"));
							console.log(chalk.dim("    Add journey files to product/journeys/"));
							exitCode = 1;
						}
					} catch {
						issues.push("product/journeys/ directory not accessible");
						console.log(chalk.red("  ✗ Cannot read product/journeys/"));
						exitCode = 1;
					}

					// Check linked scenarios exist for each journey
					for (const [_key, journey] of Object.entries(status.journeys)) {
						if (journey.scenariosMissing > 0) {
							issues.push(
								`Journey "${journey.name}" has ${journey.scenariosMissing} missing scenario(s)`,
							);
							console.log(
								chalk.yellow(
									`  ○ Journey "${journey.name}": ${journey.scenariosMissing} scenario(s) not found`,
								),
							);
							console.log(
								chalk.dim(
									`    Run 'udd sync' to create missing scenario files`,
								),
							);
							exitCode = 1;
						} else if (journey.scenarioCount > 0) {
							console.log(
								chalk.green(
									`  ✓ Journey "${journey.name}": all ${journey.scenarioCount} scenarios exist`,
								),
							);
						}
						if (journey.isStale) {
							issues.push(
								`Journey "${journey.name}" is stale (needs sync)`,
							);
							console.log(
								chalk.yellow(
									`  ◌ Journey "${journey.name}": needs sync (hash mismatch)`,
								),
							);
							console.log(
								chalk.dim(
									`    Run 'udd sync' to update manifest hashes`,
								),
							);
							exitCode = 1;
						}
					}
				} else {
					console.log(
						chalk.dim("  (product/ directory not present - skipping journey checks)"),
					);
				}

				// 3. Check for orphaned scenarios
				console.log(chalk.dim("Checking for orphans..."));
				if (status.orphaned_scenarios.length > 0) {
					issues.push(
						`${status.orphaned_scenarios.length} orphaned scenario(s) not linked to any use case`,
					);
					console.log(
						chalk.yellow(
							`  ⚠ ${status.orphaned_scenarios.length} orphaned scenario(s) found`,
						),
					);
					status.orphaned_scenarios.slice(0, 5).forEach((s) => {
						console.log(chalk.dim(`    - ${s}`));
					});
					if (status.orphaned_scenarios.length > 5) {
						console.log(
							chalk.dim(
								`    ... and ${status.orphaned_scenarios.length - 5} more`,
							),
						);
					}
					console.log(
						chalk.dim(
							"    Link scenarios to use cases or journeys to resolve",
						),
					);
					exitCode = 1;
				} else {
					console.log(chalk.green("  ✓ No orphaned scenarios"));
				}

				// 4. Check VISION.md exists
				console.log(chalk.dim("Checking roadmap..."));
				const visionPath = path.join(rootDir, "specs/VISION.md");
				try {
					await fs.access(visionPath);
					console.log(chalk.green("  ✓ VISION.md exists"));
				} catch {
					issues.push("VISION.md not found - create to define project phases");
					console.log(chalk.yellow("  ○ VISION.md not found"));
					console.log(
						chalk.dim("    Create specs/VISION.md with phase definitions"),
					);
					// Not fatal - default phase 1 is used
				}

				// Summary
				console.log(chalk.dim("-------------------"));
				if (exitCode === 0) {
					console.log(chalk.green.bold("✓ All checks passed"));
				} else {
					console.log(chalk.red.bold(`✗ ${issues.length} issue(s) found`));
					console.log(chalk.dim("Recommendations:"));
					issues.forEach((issue, i) => {
						console.log(chalk.dim(`  ${i + 1}. ${issue}`));
					});
				}

				process.exitCode = exitCode;
				return;
			}

			if (options.json) {
				console.log(JSON.stringify(status, null, 2));
			} else {
				console.log(chalk.bold("Project Status"));
				console.log(chalk.dim("=============="));

				// V2 Journeys (if product/ exists)
				if (status.hasProductDir && Object.keys(status.journeys).length > 0) {
					console.log(chalk.bold("\nUser Journeys:"));
					for (const [_key, journey] of Object.entries(status.journeys)) {
						const staleMarker = journey.isStale
							? chalk.yellow(" (needs sync)")
							: "";
						const coverageColor =
							journey.scenariosMissing === 0
								? chalk.green
								: journey.scenariosMissing < journey.scenarioCount
									? chalk.yellow
									: chalk.red;
						const coverage =
							journey.scenarioCount > 0
								? `${journey.scenariosPassing}/${journey.scenarioCount}`
								: "no scenarios";

						console.log(
							`  ${journey.name}${staleMarker}: ${coverageColor(coverage)}`,
						);
						if (journey.scenariosMissing > 0) {
							console.log(
								chalk.dim(
									`    → ${journey.scenariosMissing} scenario(s) missing`,
								),
							);
						}
					}
				} else if (status.hasProductDir) {
					console.log(chalk.dim("\nNo journeys found in product/journeys/"));
					console.log(chalk.dim("  Run `udd sync` to generate from journeys"));
				}

				// Show current phase info
				if (status.phases && Object.keys(status.phases).length > 0) {
					console.log(chalk.bold("\nRoadmap:"));
					console.log(
						`  Current Phase: ${chalk.cyan(status.current_phase)} - ${status.phases[status.current_phase.toString()] || "Unnamed"}`,
					);
					for (const [phaseNum, phaseName] of Object.entries(status.phases)) {
						const isCurrent = Number(phaseNum) === status.current_phase;
						const marker = isCurrent ? chalk.green("→") : " ";
						const color = isCurrent ? chalk.cyan : chalk.dim;
						console.log(`  ${marker} Phase ${phaseNum}: ${color(phaseName)}`);
					}
				}

				// Calculate health metrics
				let totalOutcomes = 0;
				let unsatisfiedOutcomes = 0;
				let deferredOutcomes = 0;
				let failingScenarios = 0;
				let missingScenarios = 0;
				let staleScenarios = 0;
				let deferredScenarios = 0;

				for (const feature of Object.values(status.features)) {
					for (const scenario of Object.values(feature.scenarios)) {
						if (scenario.e2e === "deferred") {
							deferredScenarios++;
						} else if (scenario.e2e === "missing") {
							missingScenarios++;
						} else if (scenario.e2e === "stale") {
							staleScenarios++;
						} else if (scenario.e2e === "failing") {
							failingScenarios++;
						}
					}
				}

				for (const useCase of Object.values(status.use_cases)) {
					for (const outcome of useCase.outcomes) {
						totalOutcomes++;
						if (outcome.status === "deferred") deferredOutcomes++;
						else if (outcome.status !== "satisfied") unsatisfiedOutcomes++;
					}
				}

				// Health Summary (deferred items don't count as blockers)
				console.log(chalk.bold("\nHealth Summary:"));
				const hasProblems =
					unsatisfiedOutcomes > 0 ||
					failingScenarios > 0 ||
					missingScenarios > 0 ||
					status.orphaned_scenarios.length > 0;
				const needsTestRun = staleScenarios > 0;

				if (!hasProblems && !needsTestRun && deferredOutcomes === 0) {
					console.log(
						chalk.green("  ✓ All outcomes satisfied, all tests passing"),
					);
				} else if (!hasProblems && !needsTestRun) {
					console.log(chalk.green("  ✓ Current phase complete"));
					console.log(
						chalk.blue(
							`  ◇ ${deferredOutcomes} outcome(s) deferred to future phase`,
						),
					);
					if (deferredScenarios > 0) {
						console.log(
							chalk.blue(
								`  ◇ ${deferredScenarios} scenario(s) deferred to future phase`,
							),
						);
					}
				} else {
					if (unsatisfiedOutcomes > 0) {
						console.log(
							chalk.red(
								`  ✗ ${unsatisfiedOutcomes}/${totalOutcomes - deferredOutcomes} outcomes unsatisfied`,
							),
						);
					}
					if (missingScenarios > 0) {
						console.log(
							chalk.yellow(`  ○ ${missingScenarios} scenario(s) missing tests`),
						);
					}
					if (failingScenarios > 0) {
						console.log(
							chalk.red(`  ✗ ${failingScenarios} scenario(s) failing`),
						);
					}
					if (staleScenarios > 0) {
						console.log(
							chalk.gray(
								`  ◌ ${staleScenarios} scenario(s) stale (run tests to update)`,
							),
						);
					}
					if (status.orphaned_scenarios.length > 0) {
						console.log(
							chalk.yellow(
								`  ⚠ ${status.orphaned_scenarios.length} orphaned scenario(s)`,
							),
						);
					}
					if (deferredOutcomes > 0) {
						console.log(
							chalk.blue(
								`  ◇ ${deferredOutcomes} outcome(s) deferred to future phase`,
							),
						);
					}
				}

				const { git } = status;
				console.log(chalk.bold("\nGit Status:"));
				console.log(`  Branch: ${chalk.cyan(git.branch)}`);
				if (git.clean) {
					console.log(`  State:  ${chalk.green("Clean")}`);
				} else {
					console.log(`  State:  ${chalk.yellow("Dirty")}`);
					if (git.staged > 0)
						console.log(`    Staged:    ${chalk.green(git.staged)}`);
					if (git.modified > 0)
						console.log(`    Modified:  ${chalk.yellow(git.modified)}`);
					if (git.untracked > 0)
						console.log(`    Untracked: ${chalk.red(git.untracked)}`);
				}

				console.log(chalk.bold("\nUse Cases:"));
				for (const [id, useCase] of Object.entries(status.use_cases)) {
					console.log(chalk.blue(`\n${useCase.name} (${id})`));

					if (useCase.validation_errors.length > 0) {
						useCase.validation_errors.forEach((err) => {
							console.log(chalk.red(`  [Validation Error] ${err}`));
						});
					}

					if (useCase.outcomes.length > 0) {
						console.log(chalk.dim("  Outcomes:"));
						useCase.outcomes.forEach((outcome) => {
							let icon = chalk.red("✗");
							if (outcome.status === "satisfied") icon = chalk.green("✓");
							else if (outcome.status === "deferred") icon = chalk.blue("◇");
							else if (outcome.status === "unknown") icon = chalk.yellow("?");

							console.log(`    ${icon} ${outcome.description}`);
							if (outcome.scenarios.length > 0) {
								outcome.scenarios.forEach((s) => {
									console.log(chalk.dim(`      -> ${s}`));
								});
							}
						});
					}

					if (Object.keys(useCase.scenarios).length > 0) {
						console.log(chalk.dim("  Scenarios (Legacy):"));
						for (const [scenarioId, sStatus] of Object.entries(
							useCase.scenarios,
						)) {
							let color = chalk.yellow;
							if (sStatus === "passing") color = chalk.green;
							else if (sStatus === "failing") color = chalk.red;
							else if (sStatus === "stale") color = chalk.gray;
							else if (sStatus === "deferred") color = chalk.blue;

							console.log(`    - ${scenarioId}: ${color(sStatus)}`);
						}
					} else if (useCase.outcomes.length === 0) {
						console.log(chalk.yellow("  (No scenarios or outcomes linked)"));
					}
				}

				if (status.orphaned_scenarios.length > 0) {
					console.log(
						chalk.bold("\nOrphaned Scenarios (Not linked to Use Case):"),
					);
					status.orphaned_scenarios.forEach((s) => {
						console.log(chalk.red(`- ${s}`));
					});
				}

				console.log(chalk.bold("\nActive Features:"));
				status.active_features.forEach((f) => {
					console.log(`- ${f}`);
				});

				console.log(chalk.bold("\nFeature Details:"));
				for (const [id, feature] of Object.entries(status.features)) {
					console.log(chalk.blue(`\n${id}`));
					console.log("  Scenarios:");
					for (const [slug, sStatus] of Object.entries(feature.scenarios)) {
						let color = chalk.yellow;
						if (sStatus.e2e === "passing") color = chalk.green;
						else if (sStatus.e2e === "failing") color = chalk.red;
						else if (sStatus.e2e === "stale") color = chalk.gray;
						else if (sStatus.e2e === "deferred") color = chalk.blue;

						const phaseInfo = sStatus.phase
							? chalk.dim(` [phase:${sStatus.phase}]`)
							: "";
						console.log(`    ${slug}: ${color(sStatus.e2e)}${phaseInfo}`);
					}
					console.log("  Requirements:");
					for (const [key, rStatus] of Object.entries(feature.requirements)) {
						let color = chalk.yellow;
						if (rStatus.tests === "passing") color = chalk.green;
						else if (rStatus.tests === "failing") color = chalk.red;
						else if (rStatus.tests === "stale") color = chalk.gray;

						console.log(`    ${key}: ${color(rStatus.tests)}`);
					}
				}
			}
		} catch (error) {
			console.error(chalk.red("Error getting status:"), error);
			process.exit(1);
		}
	});


