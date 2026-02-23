import fs from "node:fs/promises";
import path from "node:path";
import chalk from "chalk";
import { Command } from "commander";
import yaml from "yaml";
import { getProjectStatus } from "../lib/status.js";

export const statusCommand = new Command("status")
	.description("Summarize current test-based status")
	.option("--json", "Output status as JSON")
	.option("--doctor", "Run diagnostics and provide recommendations")
	.action(async (options) => {
		try {
			const status = await getProjectStatus();

			// Doctor mode: focused diagnostics with actionable recommendations
			if (options.doctor) {
				console.log(chalk.bold("🔍 Running diagnostics..."));
				console.log(chalk.dim("=============="));

				const issues: string[] = [];
				const recommendations: string[] = [];

				// Check 1: Manifest health
				const manifestPath = path.join(
					process.cwd(),
					"specs/.udd/manifest.yml",
				);
				try {
					await fs.access(manifestPath);

					// Attempt to read and parse manifest to detect malformed YAML
					try {
						const manifestContent = await fs.readFile(manifestPath, "utf-8");
						try {
							const parsed = yaml.parse(manifestContent);
							if (!parsed || typeof parsed !== "object") {
								issues.push(
									"Manifest file invalid (specs/.udd/manifest.yml) - unexpected structure",
								);
								recommendations.push(
									"Run 'udd sync' to regenerate the manifest",
								);
							}
						} catch (_err) {
							issues.push(
								"Manifest YAML malformed or unreadable (specs/.udd/manifest.yml)",
							);
							recommendations.push("Run 'udd sync' to regenerate the manifest");
						}
					} catch (_err) {
						issues.push(
							"Manifest file exists but cannot be read (specs/.udd/manifest.yml)",
						);
						recommendations.push("Check file permissions or restore from VCS");
					}
				} catch {
					issues.push("Manifest file missing (specs/.udd/manifest.yml)");
					recommendations.push("Run 'udd sync' to generate the manifest");
				}

				// Check 2: Product directory exists
				if (!status.hasProductDir) {
					issues.push("No product/ directory found");
					recommendations.push(
						"Run 'udd init' to initialize the project structure",
					);
				}

				// Check 3: Stale journeys
				const staleJourneys = Object.values(status.journeys).filter(
					(j) => j.isStale,
				);
				if (staleJourneys.length > 0) {
					issues.push(
						`${staleJourneys.length} journey(s) need syncing (hash mismatch)`,
					);
					recommendations.push(
						"Run 'udd sync' to update scenarios from journey changes",
					);
				}

				// Check 4: Missing scenarios from journeys
				const totalMissing = Object.values(status.journeys).reduce(
					(acc, j) => acc + j.scenariosMissing,
					0,
				);
				if (totalMissing > 0) {
					issues.push(
						`${totalMissing} scenario file(s) referenced in journeys not found`,
					);
					recommendations.push(
						"Check journey step references, create missing scenario files",
					);
				}

				// Check 5: Orphaned scenarios
				if (status.orphaned_scenarios.length > 0) {
					issues.push(
						`${status.orphaned_scenarios.length} orphaned scenario(s) not linked to use cases`,
					);
					recommendations.push(
						"Link scenarios to use case outcomes or remove unused scenarios",
					);
				}

				// Check 6: Failing tests
				let failingCount = 0;
				for (const feature of Object.values(status.features)) {
					for (const scenario of Object.values(feature.scenarios)) {
						if (scenario.e2e === "failing") failingCount++;
					}
				}
				if (failingCount > 0) {
					issues.push(`${failingCount} scenario test(s) failing`);
					recommendations.push(
						"Run 'npm test' to see failures and fix implementation",
					);
				}

				// Check 7: Missing tests
				let missingCount = 0;
				for (const feature of Object.values(status.features)) {
					for (const scenario of Object.values(feature.scenarios)) {
						if (scenario.e2e === "missing") missingCount++;
					}
				}
				if (missingCount > 0) {
					issues.push(`${missingCount} scenario(s) missing E2E tests`);
					recommendations.push(
						"Create test stubs with 'udd new scenario' or implement tests",
					);
				}

				// Check 8: Validation errors in use cases
				let hasValidationErrors = false;
				for (const useCase of Object.values(status.use_cases)) {
					if (useCase.validation_errors.length > 0) {
						hasValidationErrors = true;
						break;
					}
				}
				if (hasValidationErrors) {
					issues.push("Use cases have validation errors");
					recommendations.push(
						"Fix use case YAML format - outcomes should be objects with 'description' and 'scenarios'",
					);
				}

				// Explicit doctor-mode journey file readability check (independent of status.journeys)
				if (status.hasProductDir) {
					try {
						const journeysDir = path.join(process.cwd(), "product/journeys");
						const files = await fs.readdir(journeysDir);
						for (const f of files) {
							if (!f.endsWith(".md") || f.startsWith("_")) continue;
							const p = path.join(journeysDir, f);
							try {
								await fs.readFile(p, "utf-8");
							} catch (_err) {
								issues.push(
									`Unreadable journey file: ${path.join("product/journeys", f)}`,
								);
								recommendations.push(
									"Check file permissions or restore journey file from VCS/backup",
								);
							}
						}
					} catch {
						// ignore - product/journeys may not exist
					}
				}

				// Output results
				console.log();
				if (issues.length === 0) {
					console.log(chalk.green("✓ No issues found - project is healthy!"));
					console.log(
						chalk.dim(
							"\
Tip: Run 'udd status' for detailed status view",
						),
					);
					process.exitCode = 0;
				} else {
					console.log(chalk.red(`Found ${issues.length} issue(s):`));
					issues.forEach((issue, i) => {
						console.log(chalk.red(`  ${i + 1}. ${issue}`));
					});

					console.log(
						chalk.bold(
							"\
Recommendations:",
						),
					);
					recommendations.forEach((rec, i) => {
						console.log(chalk.cyan(`  ${i + 1}. ${rec}`));
					});

					process.exitCode = 1;
				}

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
					console.log(chalk.dim("\n  Suggestions:"));
					if (status.hasProductDir) {
						console.log(
							chalk.dim("    - Run 'udd sync' to link scenarios to journeys"),
						);
					}
					console.log(
						chalk.dim(
							"    - Add scenario reference to a use case in specs/use-cases/",
						),
					);
					console.log(chalk.dim("    - Remove scenario if no longer needed"));
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
