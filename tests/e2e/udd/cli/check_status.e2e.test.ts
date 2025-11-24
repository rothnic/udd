import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { expect } from "vitest";
import { runUdd } from "../../../utils";

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
});
