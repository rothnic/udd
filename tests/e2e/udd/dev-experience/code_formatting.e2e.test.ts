import { execFile } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { expect } from "vitest";
import { rootDir } from "../../../utils.js";

const execFileAsync = promisify(execFile);
const feature = await loadFeature(
	"specs/features/udd/dev-experience/code_formatting.feature",
);

describeFeature(feature, ({ Scenario }) => {
	Scenario("Code Formatting", ({ Given, When, Then }) => {
		const testFilePath = path.join(rootDir, "tests/fixtures/unformatted.ts");

		Given("I have a TypeScript file with inconsistent spacing", async () => {
			await fs.mkdir(path.dirname(testFilePath), { recursive: true });
			await fs.writeFile(
				testFilePath,
				`export function example() {
  return {
    value: 1,
  };
}
`,
			);
		});

		When("I run the repository formatter", async () => {
			const biomeBin = path.join(
				rootDir,
				"node_modules/@biomejs/biome/bin/biome",
			);
			await execFileAsync("node", [
				biomeBin,
				"format",
				"--write",
				testFilePath,
			]);
		});

		Then(
			"the file should be rewritten with the configured tab indentation",
			async () => {
				const formatted = await fs.readFile(testFilePath, "utf-8");
				expect(formatted).toContain("\treturn {");
				expect(formatted).toContain("\t\tvalue: 1,");
				await fs.rm(testFilePath);
			},
		);
	});
});
