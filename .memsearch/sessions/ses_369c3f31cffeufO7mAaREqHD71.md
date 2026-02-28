# Update status command for multi-project (@Sisyphus-Junior subagent)

**ID**: ses_369c3f31cffeufO7mAaREqHD71
**Project ID**: ad761ea6174e58ed763fc75290c3f403ed51079d
**Created**: 2/25/2026, 1:17:23 PM
**Stats**: 2 files changed, +68 -1

---

## USER (1:17:24 PM)

import fs from "node:fs/promises";
import path from "node:path";
import chalk from "chalk";
import { Command } from "commander";
import yaml from "yaml";
import { listExamples, resolvePaths } from "../lib/paths.js";
import { getProjectStatus } from "../lib/status.js";

export const statusCommand = new Command("status")
	.description("Summarize current test-based status")
	.option("--json", "Output status as JSON")
	.option("--doctor", "Run diagnostics and provide recommendations")
	.option("--example <name>", "Show status for a specific example")
	.option("--all", "Show status for all projects (product + examples)")
	.action(async (options) => {
		try {
			// New multi-project handling: --all and --example
			if (options.all) {
				console.log(chalk.bold("Product Status:\n"));
				// Show minimal product status for now
				const productStatus = await getProjectStatus();
				console.log(
					chalk.dim(
						`  Product detected: ${productStatus.hasProductDir ? "yes" : "no"}`,
					),
				);
				// List examples
				let examples: any[] = [];
				try {
					examples = await listExamples();
				} catch (err) {
					console.log(chalk.dim("  (Could not list examples)"));
				}
				for (const ex of examples) {
					console.log(chalk.bold(`\n${ex.name} Status:\n`));
					console.log(chalk.dim(`  Example path: ${ex.path}`));
				}
				return;
			}

			if (options.example) {
				const exampleName = options.example;
				let paths: any = {};
				try {
					paths = resolvePaths(exampleName);
				} catch (err) {
					console.log(
						chalk.red(`Unable to resolve paths for example '${exampleName}'`),
					);
					return;
				}
				console.log(chalk.bold(`Status for ${exampleName}:\n`));
				console.log(chalk.dim(`  Product: ${paths.product}`));
				console.log(chalk.dim(`  Specs: ${paths.specs}`));
				console.log(chalk.dim(`  Tests: ${paths.tests}`));
				return;
			}
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


import fs from "node:fs/promises";
import path from "node:path";
import chalk from "chalk";
import { Command } from "commander";
import { glob } from "glob";
import { isStrictMode, resolvePaths } from "../lib/paths.js";

export const validateCommand = new Command("validate")
	.description("Check feature scenario completeness")
	.option(
		"-f, --feature <path>",
		"Validate specific feature file (default: all in specs/)",
	)
	.option("--strict", "Require all completeness checks to pass", false)
	.option("--example <name>", "Validate a specific example project")
	.action(async (options) => {
		const rootDir = process.cwd();
		// Determine validation mode based on flags and config
		const useStrict = options.strict || (!options.example && isStrictMode());
		const context = options.example || "product";

		if (options.example) {
			try {
				const paths = resolvePaths(options.example);
				console.log(chalk.blue(`Validating example: ${options.example}`));
				console.log(chalk.dim(`  Specs: ${paths.specs}`));
				// adjust rootDir for example
			} catch (err) {
				console.log(chalk.red(String(err)));
				process.exit(1);
			}
		} else if (useStrict) {
			console.log(chalk.blue("Using strict validation mode"));
		}
		let featureFiles: string[] = [];

		if (options.feature) {
			featureFiles = [path.resolve(rootDir, options.feature)];
		} else {
			// Find all feature files
			let specsDir = path.join(rootDir, "specs");
			if (options.example) {
				const paths = resolvePaths(options.example);
				specsDir = paths.specs;
			}
			const pattern = path.join(specsDir, "**/*.feature");
			featureFiles = await glob(pattern);
		}

		if (featureFiles.length === 0) {
			console.log(chalk.yellow("No feature files found to validate."));
			process.exit(0);
		}

		console.log(
			chalk.blue.bold(
				`\n🔍 Validating Feature Completeness (${featureFiles.length} files)\n`,
			),
		);

		const results: Array<{
			file: string;
			issues: string[];
			warnings: string[];
			score: number;
		}> = [];

		for (const file of featureFiles) {
			const content = await fs.readFile(file, "utf-8");
			const relativePath = path.relative(rootDir, file);
			const analysis = analyzeFeatureCompleteness(content);

			results.push({
				file: relativePath,
				issues: analysis.issues,
				warnings: analysis.warnings,
				score: analysis.score,
			});
		}

		// Report results
		let hasIssues = false;
		let totalScore = 0;

		for (const result of results) {
			const scoreColor =
				result.score >= 80
					? chalk.green
					: result.score >= 60
						? chalk.yellow
						: chalk.red;

			console.log(
				`${scoreColor(`[${result.score}%]`)} ${chalk.white(result.file)}`,
			);

			if (result.issues.length > 0) {
				hasIssues = true;
				for (const issue of result.issues) {
					console.log(`  ${chalk.red("✗")} ${issue}`);
				}
			}

			if (result.warnings.length > 0) {
				for (const warning of result.warnings) {
					console.log(`  ${chalk.yellow("!")} ${warning}`);
				}
			}

			if (result.issues.length === 0 && result.warnings.length === 0) {
				console.log(`  ${chalk.green("✓")} Complete`);
			}

			console.log();
			totalScore += result.score;
		}

		// Summary
		const avgScore = Math.round(totalScore / results.length);
		const summaryColor =
			avgScore >= 80 ? chalk.green : avgScore >= 60 ? chalk.yellow : chalk.red;

		console.log(chalk.blue.bold("📊 Summary\n"));
		console.log(`Files analyzed: ${results.length}`);
		console.log(`Average completeness: ${summaryColor(`${avgScore}%`)}`);

		// Recommendations
		if (avgScore < 80) {
			console.log(chalk.yellow("\n💡 Recommendations:\n"));
			console.log(
				chalk.dim(
					"  • Add comments documenting user needs and alternatives considered",
				),
			);
			console.log(
				chalk.dim("  • Include error handling and edge case scenarios"),
			);
			console.log(
				chalk.dim("  • Use Background for common setup across scenarios"),
			);
			console.log(
				chalk.dim(
					"  • See examples/feature-features/ for examples of complete features",
				),
			);
			console.log(
				chalk.dim("  • Use 'udd discover feature' for guided feature creation"),
			);
		}

		if (options.strict && hasIssues) {
			console.log(chalk.red("\n✗ Validation failed (strict mode)"));
			process.exit(1);
		}

		if (!hasIssues) {
			console.log(chalk.green("\n✓ All validations passed"));
		}
	});

interface FeatureAnalysis {
	issues: string[];
	warnings: string[];
	score: number;
}

function analyzeFeatureCompleteness(content: string): FeatureAnalysis {
	const issues: string[] = [];
	const warnings: string[] = [];
	let score = 100;

	const _lines = content.split("\n");

	// Check for Feature declaration
	if (!content.match(/^Feature:/m)) {
		issues.push("Missing Feature declaration");
		score -= 20;
	}

	// Check for at least one Scenario
	const scenarioCount = (content.match(/^\s*Scenario:/gm) || []).length;
	if (scenarioCount === 0) {
		issues.push("No scenarios defined");
		score -= 30;
	} else if (scenarioCount === 1) {
		warnings.push(
			"Only one scenario - consider adding error cases and edge cases",
		);
		score -= 10;
	}

	// Check for SysML-style context comments
	const hasUserNeed = content.includes("# User Need:");
	const hasAlternatives = content.includes("# Alternatives Considered:");
	const hasSuccessCriteria = content.includes("# Success Criteria:");

	if (!hasUserNeed) {
		warnings.push("Missing user need context (# User Need:)");
		score -= 10;
	}

	if (!hasAlternatives) {
		warnings.push("Missing alternatives analysis (# Alternatives Considered:)");
		score -= 10;
	}

	if (!hasSuccessCriteria) {
		warnings.push("Missing success criteria (# Success Criteria:)");
		score -= 10;
	}

	// Check for Given/When/Then structure
	const hasGiven = content.includes("Given");
	const hasWhen = content.includes("When");
	const hasThen = content.includes("Then");

	if (!hasGiven || !hasWhen || !hasThen) {
		issues.push("Incomplete Given/When/Then structure");
		score -= 15;
	}

	// Check for error handling scenarios
	const hasErrorScenario =
		/Scenario:.*\b(error|fail|failure|invalid|wrong|incorrect|missing)\b/i.test(
			content,
		);

	if (scenarioCount > 1 && !hasErrorScenario) {
		warnings.push(
			"No error handling scenarios found - consider adding failure cases",
		);
		score -= 5;
	}

	// Check for edge cases
	const hasEdgeCaseComment = content.includes("# Edge Cases");
	const hasEdgeCaseScenario =
		/Scenario:.*\b(edge|boundary|empty|large|limit|maximum|minimum|zero)\b/i.test(
			content,
		);

	if (!hasEdgeCaseComment && !hasEdgeCaseScenario && scenarioCount > 1) {
		warnings.push(
			"No edge cases mentioned - consider boundary conditions and unusual inputs",
		);
		score -= 5;
	}

	// Check for Background (if multiple scenarios)
	if (scenarioCount > 2 && !content.includes("Background:")) {
		warnings.push(
			"Consider using Background for common setup across scenarios",
		);
		score -= 5;
	}

	// Check for template boilerplate (only in feature declaration and Given/When/Then steps)
	const hasTemplatePlaceholders =
		/^Feature:.*\[.*\]/m.test(content) ||
		/^\s*(Given|When|Then|And)\s+\[.*\]/m.test(content);

	if (hasTemplatePlaceholders) {
		warnings.push("Contains template placeholders - needs customization");
		score -= 10;
	}

	// Ensure score doesn't go below 0
	score = Math.max(0, score);

	return { issues, warnings, score };
}


