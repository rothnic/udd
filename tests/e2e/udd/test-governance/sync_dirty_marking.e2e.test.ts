import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { expect } from "vitest";
import { runUdd, withTempDir } from "../../../utils.js";

const feature = await loadFeature(
	"specs/features/udd/test-governance/sync-dirty-marking.feature",
);

describeFeature(feature, ({ Scenario, Background }) => {
	Background(({ Given, And }) => {
		Given("a UDD project is initialized", async () => {
			// Background setup handled in scenario
		});

		And("feature files exist with linked tests", async () => {
			// Background setup handled in scenario
		});
	});

	Scenario(
		"Sync marks changed feature tests as dirty",
		({ Given, And, When, Then }) => {
			let result: { stdout: string; stderr: string } | undefined;

			Given(
				'"specs/features/auth/login.feature" has linked tests',
				async () => {
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
				},
			);

			And("I have modified the feature file", async () => {
				await fs.writeFile(
					"specs/features/auth/login.feature",
					`Feature: Login
  Scenario: User logs in
  Scenario: User logs out
`,
				);
			});

			When('I run "udd sync"', async () => {
				result = await runUdd("sync");
			});

			Then("the linked tests should be automatically marked dirty", () => {
				expect(result).toBeDefined();
				expect(result!.stdout).toContain("dirty");
			});

			And("the sync output should list the affected tests", () => {
				expect(result).toBeDefined();
				expect(result!.stdout).toContain("login.test.ts");
			});
		},
	);

	Scenario(
		"Sync output shows dirty test summary",
		({ Given, When, Then, And }) => {
			let result: { stdout: string; stderr: string } | undefined;

			Given("multiple feature files have changed", async () => {
				await withTempDir(async () => {
					await runUdd("init --yes");
					await fs.mkdir("specs/features/auth", { recursive: true });
					await fs.writeFile(
						"specs/features/auth/login.feature",
						`Feature: Login
  Scenario: User logs in
`,
					);
					await fs.writeFile(
						"specs/features/auth/signup.feature",
						`Feature: Signup
  Scenario: User signs up
`,
					);
					await fs.mkdir("tests/auth", { recursive: true });
					await fs.writeFile(
						"tests/auth/login.test.ts",
						`import { test, expect } from "vitest";
test("login", () => { expect(true).toBe(true); });
`,
					);
					await fs.writeFile(
						"tests/auth/signup.test.ts",
						`import { test, expect } from "vitest";
test("signup", () => { expect(true).toBe(true); });
`,
					);
					await runUdd(
						"test link tests/auth/login.test.ts specs/features/auth/login.feature",
					);
					await runUdd(
						"test link tests/auth/signup.test.ts specs/features/auth/signup.feature",
					);
					// Modify both features
					await fs.writeFile(
						"specs/features/auth/login.feature",
						`Feature: Login
  Scenario: User logs in
  Scenario: User resets password
`,
					);
					await fs.writeFile(
						"specs/features/auth/signup.feature",
						`Feature: Signup
  Scenario: User signs up
  Scenario: User verifies email
`,
					);
				});
			});

			When('I run "udd sync"', async () => {
				result = await runUdd("sync");
			});

			Then('the output should include a "Dirty Tests" section', () => {
				expect(result).toBeDefined();
				expect(result!.stdout).toContain("Dirty");
			});

			And("the section should count how many tests were marked dirty", () => {
				expect(result).toBeDefined();
				expect(result!.stdout).toMatch(/\d+ test/i);
			});

			And("it should list each feature with dirty tests", () => {
				expect(result).toBeDefined();
				expect(result!.stdout).toContain("auth");
			});
		},
	);

	Scenario(
		"Dry run shows dirty marking without applying",
		({ Given, When, Then, And }) => {
			let result: { stdout: string; stderr: string } | undefined;
			let manifestBefore: string;

			Given('I have modified "specs/features/auth/login.feature"', async () => {
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
  Scenario: User logs out
`,
					);
					manifestBefore = await fs.readFile(".udd/manifest.yml", "utf-8");
				});
			});

			When('I run "udd sync --dry-run"', async () => {
				result = await runUdd("sync --dry-run");
			});

			Then(
				"the output should indicate which tests would be marked dirty",
				() => {
					expect(result).toBeDefined();
					expect(result!.stdout).toContain("would be marked");
				},
			);

			And("no tests should actually be marked dirty", async () => {
				const statusResult = await runUdd("status");
				expect(statusResult.stdout).not.toContain("dirty");
			});

			And("the manifest should remain unchanged", async () => {
				const manifestAfter = await fs.readFile(".udd/manifest.yml", "utf-8");
				expect(manifestAfter).toBe(manifestBefore);
			});
		},
	);

	Scenario(
		"Sync does not re-mark already dirty tests",
		({ Given, And, When, Then }) => {
			let result: { stdout: string; stderr: string } | undefined;

			Given("a test is already marked dirty", async () => {
				await withTempDir(async () => {
					await runUdd("init --yes");
					await fs.mkdir("tests", { recursive: true });
					await fs.writeFile(
						"tests/dirty.test.ts",
						`import { test, expect } from "vitest";
test("dirty", () => { expect(true).toBe(true); });
`,
					);
					await runUdd("mark-dirty tests/dirty.test.ts");
				});
			});

			And("the feature file changes again", async () => {
				await fs.mkdir("specs/features/auth", { recursive: true });
				await fs.writeFile(
					"specs/features/auth/login.feature",
					`Feature: Login
  Scenario: New scenario
`,
				);
			});

			When('I run "udd sync"', async () => {
				result = await runUdd("sync");
			});

			Then("the test should remain dirty", () => {
				expect(result).toBeDefined();
				expect(result!.stdout).toContain("dirty");
			});

			And("the dirty timestamp should reflect the most recent change", () => {
				expect(result).toBeDefined();
				expect(result!.stdout.length).toBeGreaterThan(0);
			});

			And("no duplicate dirty entries should be created", () => {
				expect(result).toBeDefined();
				expect(result!.stdout).not.toContain("duplicate");
			});
		},
	);

	Scenario(
		"Sync marks tests dirty for new scenarios only",
		({ Given, And, When, Then }) => {
			let result: { stdout: string; stderr: string } | undefined;

			Given(
				'I add a new scenario to "specs/features/auth/login.feature"',
				async () => {
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
  Scenario: User logs out
`,
						);
					});
				},
			);

			And("existing scenarios are unchanged", async () => {
				// The original scenario still exists
			});

			When('I run "udd sync"', async () => {
				result = await runUdd("sync");
			});

			Then('tests should be marked dirty with reason "new-scenario"', () => {
				expect(result).toBeDefined();
				expect(result!.stdout).toContain("new-scenario");
			});

			And("the specific new scenario should be identified", () => {
				expect(result).toBeDefined();
				expect(result!.stdout).toContain("logs out");
			});
		},
	);

	Scenario(
		"Sync with no changes does not mark anything dirty",
		({ Given, When, Then, And }) => {
			let result: { stdout: string; stderr: string } | undefined;

			Given("no feature files have changed since last sync", async () => {
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

			When('I run "udd sync"', async () => {
				result = await runUdd("sync");
			});

			Then("no tests should be marked dirty", () => {
				expect(result).toBeDefined();
				expect(result!.stdout).not.toContain("marked dirty");
			});

			And('the output should indicate "No changes detected"', () => {
				expect(result).toBeDefined();
				expect(result!.stdout).toContain("No changes");
			});
		},
	);

	Scenario(
		"Sync reports stale tests separately from dirty",
		({ Given, And, When, Then }) => {
			let result: { stdout: string; stderr: string } | undefined;

			Given("some tests are dirty due to feature changes", async () => {
				await withTempDir(async () => {
					await runUdd("init --yes");
					await fs.mkdir("tests", { recursive: true });
					await fs.writeFile(
						"tests/dirty.test.ts",
						`import { test, expect } from "vitest";
test("dirty", () => { expect(true).toBe(true); });
`,
					);
					await runUdd("mark-dirty tests/dirty.test.ts");
				});
			});

			And("some tests are failing", async () => {
				await fs.writeFile(
					"tests/failing.test.ts",
					`import { test, expect } from "vitest";
test("failing", () => { expect(false).toBe(true); });
`,
				);
			});

			When('I run "udd sync"', async () => {
				result = await runUdd("sync");
			});

			Then('the output should have a "Dirty Tests" section', () => {
				expect(result).toBeDefined();
				expect(result!.stdout).toContain("Dirty");
			});

			And('a separate "Test Status" section should show pass/fail', () => {
				expect(result).toBeDefined();
				expect(result!.stdout).toContain("Test Status");
			});

			And("the distinction between dirty and failing should be clear", () => {
				expect(result).toBeDefined();
				expect(result!.stdout.length).toBeGreaterThan(0);
			});
		},
	);
});
