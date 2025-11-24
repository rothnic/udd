import { exec } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { expect } from "vitest";
import { rootDir } from "../../../utils.js";

const execAsync = promisify(exec);
const feature = await loadFeature(
	"specs/features/udd/dev-experience/sort_imports.feature",
);

describeFeature(feature, ({ Scenario }) => {
	Scenario("Sort Imports", ({ Given, When, Then }) => {
		const testFilePath = path.join(
			rootDir,
			"tests/fixtures/unsorted_imports.ts",
		);

		Given("I have a file with unsorted imports", async () => {
			const content = `import { z } from "zod";
import { describe } from "vitest";

export const schema = z.string();
export const suite = describe("suite", () => {});
`;
			await fs.mkdir(path.dirname(testFilePath), { recursive: true });
			await fs.writeFile(testFilePath, content);
		});

		When('I run "npm run check:fix"', async () => {
			await execAsync("npm run check:fix");
		});

		Then("the imports should be sorted", async () => {
			const content = await fs.readFile(testFilePath, "utf-8");
			const lines = content.split("\n").filter((l) => l.trim() !== "");
			// Expect vitest (v) before zod (z)
			expect(lines[0]).toContain('"vitest"');
			expect(lines[1]).toContain('"zod"');
			// Cleanup
			await fs.rm(testFilePath);
		});
	});
});
