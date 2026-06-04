import fs from "node:fs/promises";
import path from "node:path";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { expect } from "vitest";
import { rootDir } from "../../../../utils.js";

const feature = await loadFeature(
	"specs/features/udd/dev-experience/test_discovery/editor_status.feature",
);

describeFeature(feature, ({ Scenario }) => {
	Scenario("Editor Status", ({ Given, When, Then }) => {
		let settings: Record<string, unknown>;

		Given("the repository has VS Code Vitest settings", async () => {
			await fs.access(path.join(rootDir, ".vscode/settings.json"));
		});

		When('I inspect ".vscode/settings.json"', async () => {
			settings = JSON.parse(
				await fs.readFile(path.join(rootDir, ".vscode/settings.json"), "utf-8"),
			);
		});

		Then(
			"static AST collection should be disabled for reliable scenario discovery",
			() => {
				expect(settings["vitest.experimentalStaticAstCollect"]).toBe(false);
			},
		);
	});
});
