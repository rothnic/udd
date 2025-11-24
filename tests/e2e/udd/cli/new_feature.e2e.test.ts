import fs from "node:fs/promises";
import path from "node:path";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { afterAll, expect } from "vitest";
import { rootDir, runUdd } from "../../../utils.js";

const feature = await loadFeature("specs/features/udd/cli/new_feature.feature");

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
	Scenario("Create a new feature", ({ Given, When, Then, And }) => {
		Given("I am in the project root", () => {
			// Assumed
		});

		When('I run "udd new feature my_area my_feature"', async () => {
			await runUdd("new feature my_area my_feature");
		});

		Then(
			'a directory "specs/features/my_area/my_feature" should exist',
			async () => {
				await fs.access(
					path.join(rootDir, "specs/features/my_area/my_feature"),
				);
			},
		);

		And(
			'a file "specs/features/my_area/my_feature/_feature.yml" should exist',
			async () => {
				await fs.access(
					path.join(rootDir, "specs/features/my_area/my_feature/_feature.yml"),
				);
			},
		);

		And(
			'the file content should contain "id: my_area/my_feature"',
			async () => {
				const content = await fs.readFile(
					path.join(rootDir, "specs/features/my_area/my_feature/_feature.yml"),
					"utf-8",
				);
				expect(content).toContain("id: my_area/my_feature");
			},
		);
	});
});
