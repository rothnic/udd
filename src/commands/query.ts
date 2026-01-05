import chalk from "chalk";
import { Command } from "commander";
import {
	getActors,
	getFeatures,
	getJourneys,
	getQueryStatus,
} from "../lib/query.js";

export const queryCommand = new Command("query").description(
	"Query project structure (use --json for agent consumption)",
);

// Query actors
queryCommand
	.command("actors")
	.description("List all actors and their associated use cases")
	.option("--json", "Output as JSON")
	.action(async (options) => {
		try {
			const actors = await getActors();

			if (options.json) {
				console.log(JSON.stringify({ actors }, null, 2));
			} else {
				console.log(chalk.bold("\nActors:"));
				console.log(chalk.dim("=======\n"));

				if (actors.length === 0) {
					console.log(chalk.yellow("No actors found in use cases."));
				} else {
					for (const actor of actors) {
						console.log(chalk.cyan(`${actor.name}`));
						if (actor.use_cases.length > 0) {
							console.log(chalk.dim("  Use Cases:"));
							for (const useCase of actor.use_cases) {
								console.log(chalk.dim(`    - ${useCase}`));
							}
						}
						console.log();
					}
				}
			}
		} catch (error) {
			console.error(chalk.red("Error querying actors:"), error);
			process.exit(1);
		}
	});

// Query journeys
queryCommand
	.command("journeys")
	.description("List all user journeys")
	.option("--json", "Output as JSON")
	.action(async (options) => {
		try {
			const journeys = await getJourneys();

			if (options.json) {
				console.log(JSON.stringify({ journeys }, null, 2));
			} else {
				console.log(chalk.bold("\nJourneys:"));
				console.log(chalk.dim("=========\n"));

				if (journeys.length === 0) {
					console.log(
						chalk.yellow(
							"No journeys found. Journeys should be in product/journeys/ directory.",
						),
					);
				} else {
					for (const journey of journeys) {
						const staleMarker = journey.is_stale
							? chalk.yellow(" (needs sync)")
							: "";
						console.log(chalk.cyan(`${journey.name}${staleMarker}`));
						if (journey.actor) {
							console.log(chalk.dim(`  Actor: ${journey.actor}`));
						}
						if (journey.goal) {
							console.log(chalk.dim(`  Goal: ${journey.goal}`));
						}
						const coverage =
							journey.scenario_count > 0
								? `${journey.scenarios_passing}/${journey.scenario_count}`
								: "no scenarios";
						const coverageColor =
							journey.scenarios_missing === 0
								? chalk.green
								: journey.scenarios_missing < journey.scenario_count
									? chalk.yellow
									: chalk.red;
						console.log(chalk.dim(`  Scenarios: ${coverageColor(coverage)}`));
						console.log();
					}
				}
			}
		} catch (error) {
			console.error(chalk.red("Error querying journeys:"), error);
			process.exit(1);
		}
	});

// Query features
queryCommand
	.command("features")
	.description("List all features with test status")
	.option("--json", "Output as JSON")
	.action(async (options) => {
		try {
			const features = await getFeatures();

			if (options.json) {
				console.log(JSON.stringify({ features }, null, 2));
			} else {
				console.log(chalk.bold("\nFeatures:"));
				console.log(chalk.dim("=========\n"));

				if (features.length === 0) {
					console.log(chalk.yellow("No features found."));
				} else {
					for (const feature of features) {
						const statusIcon = feature.all_passing
							? chalk.green("✓")
							: feature.has_tests
								? chalk.yellow("○")
								: chalk.red("✗");
						console.log(`${statusIcon} ${chalk.cyan(feature.id)}`);
						console.log(chalk.dim(`  Path: ${feature.path}`));
						console.log(chalk.dim(`  Scenarios: ${feature.scenarios.length}`));

						for (const scenario of feature.scenarios) {
							let statusColor = chalk.yellow;
							const statusText = scenario.status;
							if (scenario.status === "passing") {
								statusColor = chalk.green;
							} else if (scenario.status === "failing") {
								statusColor = chalk.red;
							} else if (scenario.status === "stale") {
								statusColor = chalk.gray;
							} else if (scenario.status === "deferred") {
								statusColor = chalk.blue;
							}
							console.log(`    - ${scenario.slug}: ${statusColor(statusText)}`);
						}
						console.log();
					}
				}
			}
		} catch (error) {
			console.error(chalk.red("Error querying features:"), error);
			process.exit(1);
		}
	});

// Query status with gaps
queryCommand
	.command("status")
	.description("Show project status with gap analysis")
	.option("--json", "Output as JSON")
	.action(async (options) => {
		try {
			const status = await getQueryStatus();

			if (options.json) {
				console.log(JSON.stringify(status, null, 2));
			} else {
				console.log(chalk.bold("\nProject Status:"));
				console.log(chalk.dim("===============\n"));

				console.log(chalk.bold("Features:"));
				console.log(`  Total: ${status.features.total}`);
				console.log(`  With Tests: ${status.features.with_tests}`);
				console.log(`  All Passing: ${status.features.passing}`);

				console.log(chalk.bold("\nScenarios:"));
				console.log(`  Total: ${status.scenarios.total}`);
				console.log(`  With Tests: ${status.scenarios.with_tests}`);
				console.log(
					`  Passing: ${chalk.green(status.scenarios.passing.toString())}`,
				);
				if (status.scenarios.failing > 0) {
					console.log(
						`  Failing: ${chalk.red(status.scenarios.failing.toString())}`,
					);
				}
				if (status.scenarios.stale > 0) {
					console.log(
						`  Stale: ${chalk.gray(status.scenarios.stale.toString())}`,
					);
				}
				if (status.scenarios.deferred > 0) {
					console.log(
						`  Deferred: ${chalk.blue(status.scenarios.deferred.toString())}`,
					);
				}

				console.log(chalk.bold("\nGaps:"));
				if (status.gaps.features_without_tests.length > 0) {
					console.log(
						chalk.yellow(
							`  Features without tests: ${status.gaps.features_without_tests.length}`,
						),
					);
					for (const feature of status.gaps.features_without_tests) {
						console.log(chalk.dim(`    - ${feature}`));
					}
				}
				if (status.gaps.scenarios_without_tests.length > 0) {
					console.log(
						chalk.yellow(
							`  Scenarios without tests: ${status.gaps.scenarios_without_tests.length}`,
						),
					);
					for (const scenario of status.gaps.scenarios_without_tests) {
						console.log(chalk.dim(`    - ${scenario}`));
					}
				}
				if (status.gaps.failing_scenarios.length > 0) {
					console.log(
						chalk.red(
							`  Failing scenarios: ${status.gaps.failing_scenarios.length}`,
						),
					);
					for (const scenario of status.gaps.failing_scenarios) {
						console.log(chalk.dim(`    - ${scenario}`));
					}
				}
				if (
					status.gaps.features_without_tests.length === 0 &&
					status.gaps.scenarios_without_tests.length === 0 &&
					status.gaps.failing_scenarios.length === 0
				) {
					console.log(chalk.green("  No gaps found! ✓"));
				}

				console.log(
					chalk.bold(
						`\nCompleteness: ${status.completeness >= 80 ? chalk.green(status.completeness.toString()) : status.completeness >= 50 ? chalk.yellow(status.completeness.toString()) : chalk.red(status.completeness.toString())}%`,
					),
				);
			}
		} catch (error) {
			console.error(chalk.red("Error querying status:"), error);
			process.exit(1);
		}
	});
