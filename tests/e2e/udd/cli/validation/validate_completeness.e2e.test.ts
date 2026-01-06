import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { expect } from "vitest";
import { runUdd } from "../../../../utils.js";

const feature = await loadFeature(
	"specs/features/udd/cli/validation/validate_completeness.feature",
);

describeFeature(feature, ({ Scenario }) => {
	Scenario(
		"Validate all feature files in project",
		({ Given, When, Then, And }) => {
			let commandOutput: { stdout: string; stderr: string };
			let commandError:
				| { code: number; stdout: string; stderr: string }
				| undefined;

			Given("I have feature files in the specs directory", () => {
				// Already true in this project
			});

			When('I run "udd validate"', async () => {
				try {
					commandOutput = await runUdd("validate");
				} catch (error) {
					commandError = error as {
						code: number;
						stdout: string;
						stderr: string;
					};
				}
			});

			Then("the command should succeed", () => {
				if (commandError) {
					console.error(commandError.stdout);
					console.error(commandError.stderr);
					throw new Error(`Command failed with code ${commandError.code}`);
				}
			});

			And("the output should show completeness scores for each feature", () => {
				expect(commandOutput.stdout).toMatch(/\[\d+%\]/);
			});

			And("the output should show an average completeness score", () => {
				expect(commandOutput.stdout).toContain("Average completeness:");
			});
		},
	);

	Scenario("Validate specific feature file", ({ Given, When, Then, And }) => {
		let commandOutput: { stdout: string; stderr: string };
		let commandError:
			| { code: number; stdout: string; stderr: string }
			| undefined;

		Given(
			'I have a feature file "docs/example-features/export_data.feature"',
			() => {
				// Already exists in the project
			},
		);

		When(
			'I run "udd validate -f docs/example-features/export_data.feature"',
			async () => {
				try {
					commandOutput = await runUdd(
						"validate -f docs/example-features/export_data.feature",
					);
				} catch (error) {
					commandError = error as {
						code: number;
						stdout: string;
						stderr: string;
					};
				}
			},
		);

		Then("the command should succeed", () => {
			if (commandError) {
				console.error(commandError.stdout);
				console.error(commandError.stderr);
				throw new Error(`Command failed with code ${commandError.code}`);
			}
		});

		And(
			"the output should show the completeness score for that feature",
			() => {
				expect(commandOutput.stdout).toContain(
					"docs/example-features/export_data.feature",
				);
				expect(commandOutput.stdout).toMatch(/\[\d+%\]/);
			},
		);
	});

	Scenario(
		"Validate reports missing SysML context",
		({ Given, When, Then, And }) => {
			let commandOutput: { stdout: string; stderr: string };
			let _commandError:
				| { code: number; stdout: string; stderr: string }
				| undefined;

			Given("I have a feature file without SysML comments", () => {
				// specs/features/udd/cli/check_status.feature exists and doesn't have SysML comments
			});

			When(
				'I run "udd validate -f specs/features/udd/cli/check_status.feature"',
				async () => {
					try {
						commandOutput = await runUdd(
							"validate -f specs/features/udd/cli/check_status.feature",
						);
					} catch (error) {
						_commandError = error as {
							code: number;
							stdout: string;
							stderr: string;
						};
					}
				},
			);

			Then("the output should warn about missing user need context", () => {
				expect(commandOutput.stdout).toContain("Missing user need context");
			});

			And("the output should warn about missing alternatives analysis", () => {
				expect(commandOutput.stdout).toContain("Missing alternatives analysis");
			});

			And("the output should warn about missing success criteria", () => {
				expect(commandOutput.stdout).toContain("Missing success criteria");
			});
		},
	);

	Scenario(
		"Validate scores complete features at 100%",
		({ Given, When, Then, And }) => {
			let commandOutput: { stdout: string; stderr: string };
			let _commandError:
				| { code: number; stdout: string; stderr: string }
				| undefined;

			Given(
				'I have a complete feature file "docs/example-features/export_data.feature"',
				() => {
					// Already exists and is complete
				},
			);

			When(
				'I run "udd validate -f docs/example-features/export_data.feature"',
				async () => {
					try {
						commandOutput = await runUdd(
							"validate -f docs/example-features/export_data.feature",
						);
					} catch (error) {
						_commandError = error as {
							code: number;
							stdout: string;
							stderr: string;
						};
					}
				},
			);

			Then("the completeness score should be 100%", () => {
				expect(commandOutput.stdout).toContain("[100%]");
			});

			And('the output should show "Complete"', () => {
				expect(commandOutput.stdout).toContain("Complete");
			});
		},
	);
});
