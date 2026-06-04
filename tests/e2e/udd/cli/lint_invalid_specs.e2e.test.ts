import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { afterAll, expect } from "vitest";
import { rootDir, runUdd } from "../../../utils.js";

const feature = await loadFeature(
	"specs/features/udd/cli/lint_invalid_specs.feature",
);

let tempDir: string | undefined;

async function cleanupProject(): Promise<void> {
	process.chdir(rootDir);
	if (tempDir) {
		await fs.rm(tempDir, { recursive: true, force: true });
		tempDir = undefined;
	}
}

async function enterProject(): Promise<void> {
	await cleanupProject();
	tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "udd-lint-invalid-"));
	process.chdir(tempDir);
}

afterAll(cleanupProject);

describeFeature(feature, ({ Scenario }) => {
	Scenario("Linting an invalid use-case spec", ({ Given, When, Then, And }) => {
		let commandError:
			| { code: number; stdout: string; stderr: string }
			| undefined;
		let combinedOutput = "";

		Given(
			"I have a UDD project with a use-case spec missing required fields",
			async () => {
				await enterProject();
				await fs.mkdir("specs/use-cases", { recursive: true });
				await fs.mkdir("specs/features/auth", { recursive: true });
				await fs.writeFile(
					"specs/VISION.md",
					`---
id: lint-invalid-fixture
name: Lint Invalid Fixture
goals: []
use_cases: []
---
# Lint Invalid Fixture
`,
				);
				await fs.writeFile(
					"specs/features/auth/login.feature",
					`Feature: Login
  Scenario: User logs in
    Given a user exists
    When the user logs in
    Then the user is authenticated
`,
				);
				await fs.writeFile(
					"specs/use-cases/broken.yml",
					`id: broken
outcomes: []
`,
				);
			},
		);

		When('I run "udd lint"', async () => {
			try {
				await runUdd("lint");
			} catch (error) {
				commandError = error as {
					code: number;
					stdout: string;
					stderr: string;
				};
				combinedOutput = `${commandError.stdout}\n${commandError.stderr}`;
			}
		});

		Then("the command should exit with a non-zero code", () => {
			expect(commandError?.code).toBeGreaterThan(0);
		});

		And('the output should contain "Spec validation failed"', () => {
			expect(combinedOutput).toContain("Spec validation failed");
		});

		And("the output should identify the invalid use-case file", () => {
			expect(combinedOutput).toContain("specs/use-cases/broken.yml");
			expect(combinedOutput).toContain("Invalid schema");
		});
	});
});
