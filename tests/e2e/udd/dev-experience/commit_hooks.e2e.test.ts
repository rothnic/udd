import fs from "node:fs/promises";
import path from "node:path";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { expect } from "vitest";
import { rootDir } from "../../../utils.js";

const feature = await loadFeature(
	"specs/features/udd/dev-experience/commit_hooks.feature",
);

describeFeature(feature, ({ Scenario }) => {
	Scenario("Commit Hooks", ({ Given, When, Then, And }) => {
		let hookContent = "";
		let packageJson: {
			"lint-staged"?: Record<string, string[]>;
		};

		Given("the repository has a Husky pre-commit hook", async () => {
			hookContent = await fs.readFile(
				path.join(rootDir, ".husky/pre-commit"),
				"utf-8",
			);
		});

		When("I inspect the hook configuration", async () => {
			packageJson = JSON.parse(
				await fs.readFile(path.join(rootDir, "package.json"), "utf-8"),
			);
		});

		Then("the hook should run lint-staged", () => {
			expect(hookContent).toContain("lint-staged");
		});

		And(
			"lint-staged should run related tests, type checking, and Biome on staged TypeScript files",
			() => {
				const tsTasks = packageJson["lint-staged"]?.["**/*.ts"] ?? [];
				expect(tsTasks.join("\n")).toContain("vitest.mjs related --run");
				expect(tsTasks).toContain("bash -c 'tsc --noEmit'");
				expect(tsTasks).toContain(
					"biome check --write --no-errors-on-unmatched",
				);
			},
		);
	});
});
