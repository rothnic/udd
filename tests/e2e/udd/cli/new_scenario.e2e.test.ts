import fs from "node:fs/promises";
import path from "node:path";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { afterAll, expect } from "vitest";
import { rootDir, runUdd } from "../../../utils";

const feature = await loadFeature(
	"specs/features/udd/cli/new_scenario.feature",
);

// Cleanup helper
const cleanup = async () => {
	try {
		await fs.rm(path.join(rootDir, "specs/features/my_area"), {
			recursive: true,
			force: true,
		});
	} catch {}
};

afterAll(async () => {
	await cleanup();
});

describeFeature(feature, ({ Scenario }) => {
	Scenario("Create a new scenario", ({ Given, When, Then, And }) => {
		Given('I have a feature "my_area/my_feature"', async () => {
			// Ensure feature exists
			await runUdd("new feature my_area my_feature");
		});

		When(
			'I run "udd new scenario my_area my_feature my_scenario"',
			async () => {
				await runUdd("new scenario my_area my_feature my_scenario");
			},
		);

		Then(
			'a file "specs/features/my_area/my_feature/my_scenario.feature" should exist',
			async () => {
				await fs.access(
					path.join(
						rootDir,
						"specs/features/my_area/my_feature/my_scenario.feature",
					),
				);
			},
		);

		And('the file content should contain "Scenario: My scenario"', async () => {
			const content = await fs.readFile(
				path.join(
					rootDir,
					"specs/features/my_area/my_feature/my_scenario.feature",
				),
				"utf-8",
			);
			expect(content).toContain("Scenario: My Scenario");
		});
	});
});
