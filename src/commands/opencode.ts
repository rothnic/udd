import chalk from "chalk";
import { Command } from "commander";
import { getProjectStatus, type ProjectStatus } from "../lib/status.js";
import { type DriftIssue, type DriftState, detectDrift } from "./doctor.js";

/**
 * Format a journey status for display
 */
function formatJourneyStatus(status: ProjectStatus): string {
	const lines: string[] = [];

	if (Object.keys(status.journeys).length === 0) {
		lines.push(chalk.yellow("  No journeys found"));
		return lines.join("\n");
	}

	for (const [key, journey] of Object.entries(status.journeys)) {
		let statusIcon: string;
		let statusColor: (text: string) => string;

		if (journey.scenariosMissing > 0) {
			statusIcon = "○";
			statusColor = chalk.yellow;
		} else if (journey.isStale) {
			statusIcon = "◌";
			statusColor = chalk.gray;
		} else {
			statusIcon = "✓";
			statusColor = chalk.green;
		}

		const progress = `${journey.scenariosPassing}/${journey.scenarioCount}`;
		lines.push(
			`  ${statusIcon} ${key} — ${statusColor(progress)}${journey.isStale ? chalk.gray(" (stale)") : ""}`,
		);
	}

	return lines.join("\n");
}

/**
 * Format issues list for display
 */
function formatIssuesList(drift: DriftState): string {
	const lines: string[] = [];

	if (drift.issues.length === 0) {
		return chalk.green("  ✓ No issues found");
	}

	// Group by severity
	const critical = drift.issues.filter((i) => i.severity === "critical");
	const warnings = drift.issues.filter((i) => i.severity === "warning");
	const info = drift.issues.filter((i) => i.severity === "info");

	if (critical.length > 0) {
		lines.push(chalk.bold.red("\n  Critical:"));
		for (const issue of critical) {
			lines.push(`    ✗ ${chalk.red(issue.message)}`);
			lines.push(chalk.dim(`       ${issue.file}`));
		}
	}

	if (warnings.length > 0) {
		lines.push(chalk.bold.yellow("\n  Warnings:"));
		for (const issue of warnings) {
			lines.push(`    ⚠ ${chalk.yellow(issue.message)}`);
			lines.push(chalk.dim(`       ${issue.file}`));
		}
	}

	if (info.length > 0) {
		lines.push(chalk.bold.blue("\n  Info:"));
		for (const issue of info) {
			lines.push(`    ℹ ${chalk.blue(issue.message)}`);
		}
	}

	return lines.join("\n");
}

/**
 * Get a health summary string
 */
function getHealthSummary(status: ProjectStatus, drift: DriftState): string {
	const totalJourneys = Object.keys(status.journeys).length;
	const staleJourneys = Object.values(status.journeys).filter(
		(j) => j.isStale,
	).length;

	let totalScenarios = 0;
	let missingScenarios = 0;
	let failingScenarios = 0;
	let passingScenarios = 0;

	for (const feature of Object.values(status.features)) {
		for (const scenario of Object.values(feature.scenarios)) {
			totalScenarios++;
			if (scenario.e2e === "missing") missingScenarios++;
			else if (scenario.e2e === "failing") failingScenarios++;
			else if (scenario.e2e === "passing") passingScenarios++;
		}
	}

	if (drift.issues.length === 0) {
		return chalk.green("Healthy");
	} else if (drift.summary.critical === 0) {
		return chalk.yellow("Issues detected");
	} else {
		return chalk.red("Critical issues");
	}
}

/**
 * Status subcommand - Deep project status for agents
 */
export const statusCommand = new Command("status")
	.description("Deep project status for OpenCode agents")
	.option("--json", "Output status as JSON for agent consumption")
	.action(async (options) => {
		try {
			const [status, drift] = await Promise.all([
				getProjectStatus(),
				detectDrift(),
			]);

			if (options.json) {
				// Structured JSON output for agents
				const jsonOutput = {
					project: {
						name: process.cwd().split("/").pop() || "unknown",
						root: process.cwd(),
					},
					phase: {
						current: status.current_phase,
						name: status.phases[status.current_phase.toString()] || "Unknown",
						all: status.phases,
					},
					journeys: Object.entries(status.journeys).map(([key, journey]) => ({
						name: key,
						display_name: journey.name,
						actor: journey.actor,
						goal: journey.goal,
						status:
							journey.scenariosMissing > 0
								? "incomplete"
								: journey.isStale
									? "stale"
									: "complete",
						scenario_count: journey.scenarioCount,
						scenarios_missing: journey.scenariosMissing,
						scenarios_passing: journey.scenariosPassing,
						is_stale: journey.isStale,
					})),
					scenarios: {
						total: Object.values(status.features).reduce(
							(acc, f) => acc + Object.keys(f.scenarios).length,
							0,
						),
						passing: Object.values(status.features).reduce(
							(acc, f) =>
								acc +
								Object.values(f.scenarios).filter((s) => s.e2e === "passing")
									.length,
							0,
						),
						failing: Object.values(status.features).reduce(
							(acc, f) =>
								acc +
								Object.values(f.scenarios).filter((s) => s.e2e === "failing")
									.length,
							0,
						),
						missing: Object.values(status.features).reduce(
							(acc, f) =>
								acc +
								Object.values(f.scenarios).filter((s) => s.e2e === "missing")
									.length,
							0,
						),
						stale: Object.values(status.features).reduce(
							(acc, f) =>
								acc +
								Object.values(f.scenarios).filter((s) => s.e2e === "stale")
									.length,
							0,
						),
					},
					issues: drift.issues.map((issue) => ({
						id: issue.id,
						severity: issue.severity,
						type: issue.type,
						file: issue.file,
						message: issue.message,
						auto_fixable: issue.autoFixable,
					})),
					health: {
						status: drift.status,
						summary: drift.summary,
					},
					generated_at: new Date().toISOString(),
				};
				console.log(JSON.stringify(jsonOutput, null, 2));
			} else {
				// Human-readable output
				console.log(chalk.bold("\n🔍 OpenCode Agent Status"));
				console.log(chalk.dim("========================\n"));

				// Project Health Overview
				console.log(chalk.bold("Project Health Overview:"));
				console.log(`  Status: ${getHealthSummary(status, drift)}`);
				console.log(
					`  Journeys: ${Object.keys(status.journeys).length}, Scenarios: ${Object.values(status.features).reduce((acc, f) => acc + Object.keys(f.scenarios).length, 0)}`,
				);
				console.log(
					`  Current Phase: Phase ${status.current_phase} - ${status.phases[status.current_phase.toString()] || "Unnamed"}`,
				);

				// Journeys section
				console.log(chalk.bold("\nJourneys:"));
				console.log(formatJourneyStatus(status));

				// Blocking Issues section
				if (drift.issues.length > 0) {
					console.log(chalk.bold("\nBlocking Issues:"));
					console.log(formatIssuesList(drift));
				}

				console.log(); // Final newline
			}
		} catch (error) {
			console.error(chalk.red("Error getting status:"), error);
			process.exit(1);
		}
	});

/**
 * Find the next recommended work item based on project status
 */
function findNextRecommendation(
	status: ProjectStatus,
	drift: DriftState,
): {
	recommended: string;
	reason: string;
	suggestedFiles: Array<{ path: string; action: string }>;
	blocking: Array<{ slug: string; blocked_by?: string }>;
} {
	// Priority 1: Fix critical drift issues
	const criticalIssues = drift.issues.filter((i) => i.severity === "critical");
	if (criticalIssues.length > 0) {
		const issue = criticalIssues[0];
		return {
			recommended: "fix_critical_issues",
			reason: `Critical issue: ${issue.message}`,
			suggestedFiles: [{ path: issue.file, action: `Fix ${issue.type}` }],
			blocking: [],
		};
	}

	// Priority 2: Complete incomplete journeys with missing scenarios
	const incompleteJourneys = Object.entries(status.journeys)
		.filter(([, j]) => j.scenariosMissing > 0)
		.sort(([, a], [, b]) => b.scenariosMissing - a.scenariosMissing);

	if (incompleteJourneys.length > 0) {
		const [journeyKey, journey] = incompleteJourneys[0];
		return {
			recommended: journeyKey,
			reason: `Highest priority incomplete journey with ${journey.scenariosMissing} missing scenarios`,
			suggestedFiles: [
				{
					path: `product/journeys/${journeyKey}.md`,
					action: "Review journey definition",
				},
				{
					path: `specs/features/${journeyKey}/`,
					action: `Create ${journey.scenariosMissing} missing scenario(s)`,
				},
			],
			blocking: [],
		};
	}

	// Priority 3: Sync stale journeys
	const staleJourneys = Object.entries(status.journeys).filter(
		([, j]) => j.isStale,
	);
	if (staleJourneys.length > 0) {
		const [journeyKey] = staleJourneys[0];
		return {
			recommended: journeyKey,
			reason: "Journey has changed since last sync and needs update",
			suggestedFiles: [
				{
					path: `product/journeys/${journeyKey}.md`,
					action: "Review changes and run 'udd sync'",
				},
			],
			blocking: [],
		};
	}

	// Priority 4: Create missing test files for existing scenarios
	for (const [featureId, feature] of Object.entries(status.features)) {
		for (const [slug, scenario] of Object.entries(feature.scenarios)) {
			if (scenario.e2e === "missing") {
				const testPath = `tests/e2e/${featureId}/${slug}.e2e.test.ts`;
				const scenarioPath = `specs/features/${featureId}/${slug}.feature`;
				return {
					recommended: `${featureId}/${slug}`,
					reason: `Scenario exists but test file is missing`,
					suggestedFiles: [
						{
							path: scenarioPath,
							action: "Review scenario specification",
						},
						{
							path: testPath,
							action: "Create E2E test implementation",
						},
					],
					blocking: [],
				};
			}
		}
	}

	// Priority 5: Fix failing tests
	for (const [featureId, feature] of Object.entries(status.features)) {
		for (const [slug, scenario] of Object.entries(feature.scenarios)) {
			if (scenario.e2e === "failing") {
				const testPath = `tests/e2e/${featureId}/${slug}.e2e.test.ts`;
				return {
					recommended: `${featureId}/${slug}`,
					reason: `Test is failing and needs to be fixed`,
					suggestedFiles: [
						{
							path: testPath,
							action: "Fix failing test implementation",
						},
					],
					blocking: [],
				};
			}
		}
	}

	// All caught up
	return {
		recommended: "none",
		reason: "All journeys complete and all tests passing",
		suggestedFiles: [],
		blocking: [],
	};
}

/**
 * Next subcommand - Recommend next work item
 */
export const nextCommand = new Command("next")
	.description("Recommend the next work item to implement")
	.option("--json", "Output recommendation as JSON for agent consumption")
	.option("--context", "Include detailed context about files to modify")
	.action(async (options) => {
		try {
			const [status, drift] = await Promise.all([
				getProjectStatus(),
				detectDrift(),
			]);

			const recommendation = findNextRecommendation(status, drift);

			if (options.json) {
				const jsonOutput = {
					...recommendation,
					edit_plan: recommendation.suggestedFiles.map((f) => ({
						path: f.path,
						action: f.action,
					})),
					generated_at: new Date().toISOString(),
				};
				console.log(JSON.stringify(jsonOutput, null, 2));
			} else {
				console.log(chalk.bold("\n📋 Next Recommendation"));
				console.log(chalk.dim("======================\n"));

				if (recommendation.recommended === "none") {
					console.log(
						chalk.green("✓ All caught up! No work items to recommend."),
					);
				} else if (recommendation.recommended === "fix_critical_issues") {
					console.log(chalk.red("⚠ Critical Issues Detected"));
					console.log(`\n${recommendation.reason}`);
					console.log(chalk.bold("\nAction Required:"));
					console.log(`  Run: udd doctor --fix`);
				} else {
					console.log(chalk.cyan("Recommended:"));
					console.log(`  ${recommendation.recommended}`);
					console.log(chalk.dim(`\n  ${recommendation.reason}`));

					if (options.context || recommendation.suggestedFiles.length > 0) {
						console.log(chalk.bold("\nFiles to Modify:"));
						for (const file of recommendation.suggestedFiles) {
							console.log(`  • ${chalk.yellow(file.path)}`);
							console.log(chalk.dim(`    Action: ${file.action}`));
						}
					}

					if (recommendation.blocking.length > 0) {
						console.log(chalk.bold("\nBlocking Dependencies:"));
						for (const block of recommendation.blocking) {
							console.log(
								`  • ${block.slug} blocked by ${block.blocked_by || "unknown"}`,
							);
						}
					}
				}

				console.log(); // Final newline
			}
		} catch (error) {
			console.error(chalk.red("Error generating recommendation:"), error);
			process.exit(1);
		}
	});

/**
 * Issues subcommand - List all blockers
 */
export const issuesCommand = new Command("issues")
	.description("List all blocking issues and problems")
	.option("--json", "Output issues as JSON for agent consumption")
	.option("--severity <level>", "Filter by severity (critical|warning|info)")
	.action(async (options) => {
		try {
			const drift = await detectDrift();

			// Filter by severity if specified
			let issues = drift.issues;
			if (options.severity) {
				issues = issues.filter((i) => i.severity === options.severity);
			}

			if (options.json) {
				const jsonOutput = {
					count: issues.length,
					by_severity: {
						critical: issues.filter((i) => i.severity === "critical").length,
						warning: issues.filter((i) => i.severity === "warning").length,
						info: issues.filter((i) => i.severity === "info").length,
					},
					issues: issues.map((issue) => ({
						id: issue.id,
						severity: issue.severity,
						type: issue.type,
						summary: issue.message,
						file: issue.file,
						auto_fixable: issue.autoFixable,
						requires_user_input: issue.requiresUserInput,
					})),
					generated_at: new Date().toISOString(),
				};
				console.log(JSON.stringify(jsonOutput, null, 2));
			} else {
				console.log(chalk.bold("\n🚨 Issues List"));
				console.log(chalk.dim("==============\n"));

				// Summary by severity
				const criticalCount = drift.issues.filter(
					(i) => i.severity === "critical",
				).length;
				const warningCount = drift.issues.filter(
					(i) => i.severity === "warning",
				).length;
				const infoCount = drift.issues.filter(
					(i) => i.severity === "info",
				).length;

				console.log("Summary:");
				console.log(
					`  Critical issues: ${criticalCount > 0 ? chalk.red(criticalCount) : chalk.green(0)}`,
				);
				console.log(
					`  Warning issues: ${warningCount > 0 ? chalk.yellow(warningCount) : chalk.green(0)}`,
				);
				console.log(
					`  Info issues: ${infoCount > 0 ? chalk.blue(infoCount) : chalk.green(0)}`,
				);

				if (issues.length === 0) {
					console.log(chalk.green("\n✓ No issues found - project is healthy!"));
				} else {
					console.log(chalk.bold("\nDrift Issues:"));
					console.log(formatIssuesList(drift));
				}

				// Failing Tests subsection
				const failingTests = issues.filter((i) => i.type === "test_failing");
				if (failingTests.length > 0) {
					console.log(chalk.bold("\nFailing Tests:"));
					for (const issue of failingTests) {
						console.log(`  ✗ ${chalk.red(issue.file)}`);
						console.log(chalk.dim(`    ${issue.message}`));
					}
				}

				// Missing Tests subsection
				const missingTests = issues.filter(
					(i) => i.type === "test_missing" && !i.file.includes(".feature"),
				);
				if (missingTests.length > 0) {
					console.log(chalk.bold("\nMissing Tests:"));
					for (const issue of missingTests) {
						console.log(`  ○ ${chalk.yellow(issue.file)}`);
						console.log(chalk.dim(`    ${issue.message}`));
					}
				}

				console.log(); // Final newline
			}
		} catch (error) {
			console.error(chalk.red("Error listing issues:"), error);
			process.exit(1);
		}
	});

/**
 * Main opencode command with subcommands
 */
export const opencodeCommand = new Command("opencode")
	.description("OpenCode agent integration commands")
	.addCommand(statusCommand)
	.addCommand(nextCommand)
	.addCommand(issuesCommand);
