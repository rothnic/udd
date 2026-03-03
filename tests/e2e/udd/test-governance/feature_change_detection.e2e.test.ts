import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { expect } from "vitest";
import { runUdd, withTempDir } from "../../../utils.js";

const feature = await loadFeature(
	"specs/features/udd/test-governance/feature-change-detection.feature",
);

describeFeature(feature, ({ Scenario, Background }) => {
	Background(({ Given, And }) => {
		Given("a UDD project is initialized", async () => {
			// Background setup handled in scenario
		});

		And(
			'a feature file exists at "specs/features/auth/login.feature"',
			async () => {
				// Background setup handled in scenario
			},
		);

		And(
			'a test file "tests/auth/login.test.ts" links to the feature',
			async () => {
				// Background setup handled in scenario
			},
		);
	});

	Scenario("Detect change in feature file", ({ Given, When, Then, And }) => {
		let result: { stdout: string; stderr: string } | undefined;

		Given('the feature file "auth/login.feature" has content', async () => {
			await withTempDir(async () => {
				await runUdd("init --yes");
				await fs.mkdir("specs/features/auth", { recursive: true });
				await fs.writeFile(
					"specs/features/auth/login.feature",
					`Feature: Login
  Scenario: User logs in
`,
				);
				await fs.mkdir("tests/auth", { recursive: true });
				await fs.writeFile(
					"tests/auth/login.test.ts",
					`import { test, expect } from "vitest";
test("login", () => { expect(true).toBe(true); });
`,
				);
				await runUdd(
					"test link tests/auth/login.test.ts specs/features/auth/login.feature",
				);
			});
		});

		When("I modify the feature file content", async () => {
			await fs.writeFile(
				"specs/features/auth/login.feature",
				`Feature: Login
  Scenario: User logs in
  Scenario: User logs out
`,
			);
		});

		And('I run "udd detect-changes"', async () => {
			result = await runUdd("detect-changes");
		});

		Then("the change should be detected", () => {
			expect(result).toBeDefined();
			expect(result!.stdout).toContain("changed");
		});

		And("the linked test should be flagged as potentially stale", () => {
			expect(result).toBeDefined();
			expect(result!.stdout).toContain("stale");
		});
	});

	Scenario(
		"Status shows stale tests after feature change",
		({ Given, And, When, Then }) => {
			let result: { stdout: string; stderr: string } | undefined;

			Given('I modified "specs/features/auth/login.feature"', async () => {
				await withTempDir(async () => {
					await runUdd("init --yes");
					await fs.mkdir("specs/features/auth", { recursive: true });
					await fs.writeFile(
						"specs/features/auth/login.feature",
						`Feature: Login
  Scenario: User logs in
`,
					);
					await fs.mkdir("tests/auth", { recursive: true });
					await fs.writeFile(
						"tests/auth/login.test.ts",
						`import { test, expect } from "vitest";
test("login", () => { expect(true).toBe(true); });
`,
					);
					await runUdd(
						"test link tests/auth/login.test.ts specs/features/auth/login.feature",
					);
					await fs.writeFile(
						"specs/features/auth/login.feature",
						`Feature: Login
  Scenario: User logs in
  Scenario: New scenario
`,
					);
				});
			});

			And('I have not updated "tests/auth/login.test.ts"', async () => {
				// Test file unchanged
			});

			When('I run "udd status"', async () => {
				result = await runUdd("status");
			});

			Then('the output should show "auth/login" as having stale tests', () => {
				expect(result).toBeDefined();
				expect(result!.stdout).toContain("stale");
			});

			And("the output should recommend reviewing the linked tests", () => {
				expect(result).toBeDefined();
				expect(result!.stdout).toContain("review");
			});
		},
	);

	Scenario("New scenario added to feature", ({ Given, When, And, Then }) => {
		let result: { stdout: string; stderr: string } | undefined;

		Given("a feature has 3 scenarios", async () => {
			await withTempDir(async () => {
				await runUdd("init --yes");
				await fs.mkdir("specs/features/auth", { recursive: true });
				await fs.writeFile(
					"specs/features/auth/login.feature",
					`Feature: Login
  Scenario: User logs in
  Scenario: User logs out
  Scenario: User resets password
`,
				);
			});
		});

		When("I add a 4th scenario to the feature file", async () => {
			await fs.writeFile(
				"specs/features/auth/login.feature",
				`Feature: Login
  Scenario: User logs in
  Scenario: User logs out
  Scenario: User resets password
  Scenario: User enables 2FA
`,
			);
		});

		And('I run "udd detect-changes"', async () => {
			result = await runUdd("detect-changes");
		});

		Then('the change should be detected as "new-scenario"', () => {
			expect(result).toBeDefined();
			expect(result!.stdout).toContain("new-scenario");
		});

		And("the output should suggest adding a test for the new scenario", () => {
			expect(result).toBeDefined();
			expect(result!.stdout).toContain("test");
		});
	});

	Scenario("Scenario removed from feature", ({ Given, When, And, Then }) => {
		let result: { stdout: string; stderr: string } | undefined;

		Given("a feature has 3 scenarios with corresponding tests", async () => {
			await withTempDir(async () => {
				await runUdd("init --yes");
				await fs.mkdir("specs/features/auth", { recursive: true });
				await fs.writeFile(
					"specs/features/auth/login.feature",
					`Feature: Login
  Scenario: User logs in
  Scenario: User logs out
  Scenario: User resets password
`,
				);
				await fs.mkdir("tests/auth", { recursive: true });
				await fs.writeFile(
					"tests/auth/login.test.ts",
					`import { test, expect } from "vitest";
test("login", () => { expect(true).toBe(true); });
`,
				);
			});
		});

		When("I remove 1 scenario from the feature file", async () => {
			await fs.writeFile(
				"specs/features/auth/login.feature",
				`Feature: Login
  Scenario: User logs in
  Scenario: User logs out
`,
			);
		});

		And('I run "udd detect-changes"', async () => {
			result = await runUdd("detect-changes");
		});

		Then('the change should be detected as "removed-scenario"', () => {
			expect(result).toBeDefined();
			expect(result!.stdout).toContain("removed-scenario");
		});

		And("the output should warn about orphaned tests", () => {
			expect(result).toBeDefined();
			expect(result!.stdout).toContain("orphan");
		});
	});

	Scenario("Scenario modified in feature", ({ Given, When, And, Then }) => {
		let result: { stdout: string; stderr: string } | undefined;

		Given("a scenario has existing tests", async () => {
			await withTempDir(async () => {
				await runUdd("init --yes");
				await fs.mkdir("specs/features/auth", { recursive: true });
				await fs.writeFile(
					"specs/features/auth/login.feature",
					`Feature: Login
  Scenario: User logs in
    Given a user exists
    When they log in
    Then they should be authenticated
`,
				);
				await fs.mkdir("tests/auth", { recursive: true });
				await fs.writeFile(
					"tests/auth/login.test.ts",
					`import { test, expect } from "vitest";
test("login", () => { expect(true).toBe(true); });
`,
				);
			});
		});

		When("I modify the scenario steps in the feature file", async () => {
			await fs.writeFile(
				"specs/features/auth/login.feature",
				`Feature: Login
  Scenario: User logs in
    Given a registered user exists
    When they log in with valid credentials
    Then they should be authenticated
    And a session should be created
`,
			);
		});

		And('I run "udd detect-changes"', async () => {
			result = await runUdd("detect-changes");
		});

		Then('the change should be detected as "modified-scenario"', () => {
			expect(result).toBeDefined();
			expect(result!.stdout).toContain("modified-scenario");
		});

		And("the output should recommend reviewing the scenario tests", () => {
			expect(result).toBeDefined();
			expect(result!.stdout).toContain("review");
		});
	});

	Scenario("Ignore whitespace-only changes", ({ Given, When, And, Then }) => {
		let result: { stdout: string; stderr: string } | undefined;

		Given("a feature file exists", async () => {
			await withTempDir(async () => {
				await runUdd("init --yes");
				await fs.mkdir("specs/features/auth", { recursive: true });
				await fs.writeFile(
					"specs/features/auth/login.feature",
					`Feature: Login
  Scenario: User logs in
`,
				);
			});
		});

		When("I modify only whitespace or formatting", async () => {
			await fs.writeFile(
				"specs/features/auth/login.feature",
				`Feature: Login

  Scenario: User logs in

`,
			);
		});

		And('I run "udd detect-changes"', async () => {
			result = await runUdd("detect-changes");
		});

		Then("no changes should be detected", () => {
			expect(result).toBeDefined();
			expect(result!.stdout).toContain("No changes");
		});

		And("tests should not be flagged as stale", () => {
			expect(result).toBeDefined();
			expect(result!.stdout).not.toContain("stale");
		});
	});

	Scenario(
		"Compare feature file with last known state",
		({ Given, When, Then, And }) => {
			let result: { stdout: string; stderr: string } | undefined;

			Given("the manifest tracks feature file hashes", async () => {
				await withTempDir(async () => {
					await runUdd("init --yes");
					await fs.mkdir("specs/features/auth", { recursive: true });
					await fs.writeFile(
						"specs/features/auth/login.feature",
						`Feature: Login
  Scenario: User logs in
`,
					);
					await runUdd("sync");
				});
			});

			When('I run "udd detect-changes --since-last-sync"', async () => {
				result = await runUdd("detect-changes --since-last-sync");
			});

			Then(
				"only changes since the last manifest update should be reported",
				() => {
					expect(result).toBeDefined();
					expect(result!.stdout).toContain("No changes");
				},
			);

			And("previously detected changes should not be re-reported", () => {
				expect(result).toBeDefined();
				expect(result!.stdout).not.toContain("previously");
			});
		},
	);
});
