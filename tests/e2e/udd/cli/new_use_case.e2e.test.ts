import fs from "node:fs/promises";
import path from "node:path";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { afterAll, expect } from "vitest";
import { rootDir, runUdd } from "../../../utils.js";

const feature = await loadFeature(
	"specs/features/udd/cli/new_use_case.feature",
);

// Cleanup helper
const cleanup = async () => {
	try {
		await fs.unlink(path.join(rootDir, "specs/use-cases/my_new_use_case.yml"));
	} catch {}
};

afterAll(async () => {
	await cleanup();
});

describeFeature(feature, ({ Scenario }) => {
	Scenario("Create a new use case", ({ Given, When, Then, And }) => {
		Given("I am in the project root", () => {
			// Assumed
		});

		When('I run "udd new use-case my_new_use_case"', async () => {
			await runUdd("new use-case my_new_use_case");
		});

		Then(
			'a file "specs/use-cases/my_new_use_case.yml" should exist',
			async () => {
				await fs.access(
					path.join(rootDir, "specs/use-cases/my_new_use_case.yml"),
				);
			},
		);

		And('the file content should contain "id: my_new_use_case"', async () => {
			const content = await fs.readFile(
				path.join(rootDir, "specs/use-cases/my_new_use_case.yml"),
				"utf-8",
			);
			expect(content).toContain("id: my_new_use_case");
		});
	});
});
