import chalk from "chalk";
import { Command } from "commander";
import { getProjectStatus } from "../lib/status.js";

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
