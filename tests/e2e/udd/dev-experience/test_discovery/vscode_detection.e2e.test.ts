import fs from "node:fs/promises";
import path from "node:path";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { expect } from "vitest";
import { rootDir } from "../../../../utils.js";

const feature = await loadFeature(
	"specs/features/udd/dev-experience/test_discovery/vscode_detection.feature",
);

describeFeature(feature, ({ Scenario }) => {
	Scenario("Vscode Detection", ({ Given, When, Then, And }) => {
		let vitestConfig = "";

		Given("the repository uses Vitest for E2E scenario tests", async () => {
			const packageJson = JSON.parse(
				await fs.readFile(path.join(rootDir, "package.json"), "utf-8"),
			);
			expect(packageJson.scripts.test).toContain("vitest run");
		});

		When("I inspect the Vitest configuration", async () => {
			vitestConfig = await fs.readFile(
				path.join(rootDir, "vitest.config.ts"),
				"utf-8",
			);
		});

		Then('the include pattern should cover test files under "tests/"', () => {
			expect(vitestConfig).toContain('include: ["tests/**/*.test.ts"]');
		});

		And(
			"known generated or manual integration directories should be excluded",
			() => {
				expect(vitestConfig).toContain('"tests/e2e/my_area/**/*"');
				expect(vitestConfig).toContain('"tests/e2e/opencode/integration/**/*"');
			},
		);
	});
});
