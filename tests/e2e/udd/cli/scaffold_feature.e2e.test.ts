import fs from "node:fs/promises";
import path from "node:path";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { expect } from "vitest";
import { runUdd } from "../../../utils.js";

const feature = await loadFeature(
	"specs/features/udd/cli/scaffold_feature.feature",
);

describeFeature(feature, ({ Scenario }) => {
	Scenario(
		"Create new feature from SysML template",
		({ Given, When, Then, And }) => {
			let _commandOutput: { stdout: string; stderr: string };
			let commandError:
				| { code: number; stdout: string; stderr: string }
				| undefined;
			const testFeaturePath = path.join(
				process.cwd(),
				"specs/features/test_domain/sample_feature/sample_feature.feature",
			);

			Given("I am in a UDD project", () => {
				// Already true - running in the UDD project
			});

			When('I run "udd new feature test_domain sample_feature"', async () => {
				try {
					_commandOutput = await runUdd(
						"new feature test_domain sample_feature",
					);
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
					console.error("STDOUT:", commandError.stdout);
					console.error("STDERR:", commandError.stderr);
					throw new Error(`Command failed with code ${commandError.code}`);
				}
			});

			And(
				'a feature file should be created at "specs/features/test_domain/sample_feature/sample_feature.feature"',
				async () => {
					const exists = await fs
						.access(testFeaturePath)
						.then(() => true)
						.catch(() => false);
					expect(exists).toBe(true);
				},
			);

			And(
				'the feature file should contain "Feature: Sample Feature"',
				async () => {
					const content = await fs.readFile(testFeaturePath, "utf-8");
					expect(content).toContain("Feature: Sample Feature");
				},
			);

			And("the feature file should be valid Gherkin", async () => {
				const content = await fs.readFile(testFeaturePath, "utf-8");
				// Check for basic Gherkin structure
				expect(content).toMatch(/Feature:/);
				expect(content).toMatch(/Scenario:/);
				expect(content).toMatch(/Given/);
				expect(content).toMatch(/When/);
				expect(content).toMatch(/Then/);
			});
		},
	);
});
