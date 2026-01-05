import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { expect } from "vitest";
import { runUdd } from "../../../../utils.js";

const feature = await loadFeature(
	"specs/features/udd/cli/validation/discover_feature.feature",
);

describeFeature(feature, ({ Scenario }) => {
	Scenario("Discover command exists and shows help", ({ When, Then, And }) => {
		let commandOutput: { stdout: string; stderr: string };
		let commandError:
			| { code: number; stdout: string; stderr: string }
			| undefined;

		When('I run "udd discover --help"', async () => {
			try {
				commandOutput = await runUdd("discover --help");
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

		And('the output should contain "Interactive feature discovery"', () => {
			expect(commandOutput.stdout).toContain("Interactive feature discovery");
		});

		And('the output should contain "feature <path>"', () => {
			expect(commandOutput.stdout).toContain("feature <path>");
		});
	});

	Scenario("Discover feature command shows help", ({ When, Then, And }) => {
		let commandOutput: { stdout: string; stderr: string };
		let commandError:
			| { code: number; stdout: string; stderr: string }
			| undefined;

		When('I run "udd discover feature --help"', async () => {
			try {
				commandOutput = await runUdd("discover feature --help");
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

		And(
			'the output should contain "Guided feature discovery with SysML-style analysis"',
			() => {
				expect(commandOutput.stdout).toContain(
					"Guided feature discovery with SysML-style analysis",
				);
			},
		);
	});
});
