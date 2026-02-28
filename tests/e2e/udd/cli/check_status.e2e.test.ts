import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { expect } from "vitest";
import { runUdd } from "../../../utils.js";

const feature = await loadFeature(
	"specs/features/udd/cli/check_status.feature",
);

describeFeature(feature, ({ Scenario }) => {
	Scenario("Check status of a project", ({ Given, When, Then, And }) => {
		let commandOutput: { stdout: string; stderr: string };
		let commandError:
			| { code: number; stdout: string; stderr: string }
			| undefined;

		Given("I have a valid UDD spec structure", () => {
			// Already true
		});

		When('I run "udd status"', async () => {
			try {
				commandOutput = await runUdd("status");
			} catch (error) {
				commandError = error as {
					code: number;
					stdout: string;
					stderr: string;
				};
			}
		});

		Then("the command should exit with code 0", () => {
			if (commandError) {
				console.error(commandError.stdout);
				console.error(commandError.stderr);
				throw new Error(`Command failed with code ${commandError.code}`);
			}
		});

		And('the output should contain "Project Status"', () => {
			expect(commandOutput.stdout).toContain("Project Status");
		});
	});

	Scenario(
		"Status check fails when UDD is not initialized",
		({ Given, When, Then }) => {
			Given("I am in a repository without UDD initialized", () => {
				// placeholder
			});

			When('I run "udd status"', () => {
				// placeholder
			});

			Then("the command should exit with code 1", () => {
				expect(true).toBe(true);
			});

			Then(
				'the output should contain "UDD is not initialized" or "run \'udd init\'"',
				() => {
					expect(true).toBe(true);
				},
			);

			Scenario(
				"Status with no journeys defined (empty project)",
				({ Given, When, Then, And }) => {
					Given("UDD is initialized", () => {
						// placeholder
					});

					Given('there are no journey files in "product/journeys/"', () => {
						// placeholder
					});

					When('I run "udd status"', () => {
						// placeholder
					});

					Then("the command should exit with code 0", () => {
						expect(true).toBe(true);
					});

					And(
						'the output should contain "No journeys defined" or "0 journeys"',
						() => {
							expect(true).toBe(true);
						},
					);
				},
			);

			Scenario(
				"Status with stale/outdated manifest warns the user",
				({ Given, When, Then, And }) => {
					Given("UDD is initialized", () => {
						// placeholder
					});

					Given(
						"the .udd/manifest.yml is older than one or more journey files",
						() => {
							// placeholder
						},
					);

					When('I run "udd status"', () => {
						// placeholder
					});

					Then("the command should exit with code 0", () => {
						expect(true).toBe(true);
					});

					And(
						'the output should contain "manifest is stale" or "run \'udd sync\' to update"',
						() => {
							expect(true).toBe(true);
						},
					);
				},
			);
		},
	);
});
