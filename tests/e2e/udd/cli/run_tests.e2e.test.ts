import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { expect } from "vitest";
import { runUdd } from "../../../utils.js";

const feature = await loadFeature("specs/features/udd/cli/run_tests.feature");

describeFeature(feature, ({ Scenario }) => {
	Scenario("Run tests with visual feedback", ({ Given, When, Then, And }) => {
		let commandOutput: { stdout: string; stderr: string };
		let commandError:
			| { code: number; stdout: string; stderr: string }
			| undefined;

		Given("I have a valid UDD spec structure", () => {
			// Already true in this workspace
		});

		When('I run "udd test"', async () => {
			try {
				// Run only check_status tests to avoid infinite recursion and save time
				commandOutput = await runUdd("test check_status");
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

		And('the output should contain "Feature:"', () => {
			expect(commandOutput.stdout).toContain("Feature:");
		});

		And('the output should contain "Scenario:"', () => {
			expect(commandOutput.stdout).toContain("Scenario:");
		});
	});
});
