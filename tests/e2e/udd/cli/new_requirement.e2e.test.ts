import fs from "node:fs/promises";
import path from "node:path";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { afterAll, expect } from "vitest";
import { rootDir, runUdd } from "../../../utils.js";

const feature = await loadFeature(
	"specs/features/udd/cli/new_requirement.feature",
);

// Cleanup helper
const cleanup = async () => {
	try {
		await fs.rm(path.join(rootDir, "specs/requirements/my_requirement.yml"), {
			force: true,
		});
	} catch {}
};

afterAll(async () => {
	await cleanup();
});

describeFeature(feature, ({ Scenario }) => {
	Scenario("Create a new requirement", ({ Given, When, Then, And }) => {
		Given("I am in the project root", () => {
			// Assumed
		});

		When('I run "udd new requirement my_requirement"', async () => {
			await runUdd("new requirement my_requirement");
		});

		Then(
			'a file "specs/requirements/my_requirement.yml" should exist',
			async () => {
				await fs.access(
					path.join(rootDir, "specs/requirements/my_requirement.yml"),
				);
			},
		);

		And('the file content should contain "key: my_requirement"', async () => {
			const content = await fs.readFile(
				path.join(rootDir, "specs/requirements/my_requirement.yml"),
				"utf-8",
			);
			expect(content).toContain("key: my_requirement");
		});
	});
});
