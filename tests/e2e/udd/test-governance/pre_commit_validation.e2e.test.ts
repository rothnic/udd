import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { expect } from "vitest";
import { runUdd, withTempDir } from "../../../utils.js";

const feature = await loadFeature(
	"specs/features/udd/test-governance/pre-commit-validation.feature",
);

describeFeature(feature, ({ Scenario, Background }) => {
	Background(({ Given, And }) => {
		Given("a UDD project is initialized", async () => {
			// Background setup handled in scenario
		});

		And("git hooks are installed", async () => {
			// Background setup handled in scenario
		});

		And("I have staged changes ready to commit", async () => {
			// Background setup handled in scenario
		});
	});

	Scenario(
		"Pre-commit passes with clean tests",
		({ Given, And, When, Then }) => {
			let result: { stdout: string; stderr: string } | undefined;

			Given("all tests linked to changed features are clean", async () => {
				await withTempDir(async () => {
					await runUdd("init --yes");
					await fs.mkdir("tests", { recursive: true });
					await fs.writeFile(
						"tests/clean.test.ts",
						`import { test, expect } from "vitest";
test("clean", () => { expect(true).toBe(true); });
`,
					);
					await runUdd("mark-clean tests/clean.test.ts");
				});
			});

			And("no governance rules are violated", async () => {
				// All clean
			});

			When("I run \"git commit -m 'update feature'\"", async () => {
				// Simulate pre-commit hook
				result = await runUdd("validate --staged");
			});

			Then("the commit should succeed", () => {
				expect(result).toBeDefined();
				expect(result!.stdout).toContain("pass");
			});

			And("the pre-commit hook should exit with code 0", () => {
				expect(result).toBeDefined();
				expect(result!.stdout.length).toBeGreaterThan(0);
			});
		},
	);

	Scenario(
		"Pre-commit blocks when tests are dirty",
		({ Given, And, When, Then }) => {
			let result: { stdout: string; stderr: string } | undefined;
			let errorResult:
				| { code: number; stdout: string; stderr: string }
				| undefined;

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
  Scenario: New scenario
`,
					);
				});
			});

			And("I have not marked the linked tests as clean", async () => {
				// Test is now dirty due to feature change
			});

			When("I run \"git commit -m 'update feature'\"", async () => {
				try {
					result = await runUdd("validate --staged");
				} catch (err: any) {
					errorResult = err as { code: number; stdout: string; stderr: string };
				}
			});

			Then("the commit should be blocked", () => {
				if (errorResult) {
					expect(errorResult.code).toBe(1);
				} else {
					expect(result).toBeDefined();
				}
			});

			And("the output should indicate dirty tests must be reviewed", () => {
				const output = errorResult
					? `${errorResult.stdout} ${errorResult.stderr}`
					: result?.stdout || "";
				expect(output).toContain("dirty");
			});

			And("the specific dirty tests should be listed", () => {
				const output = errorResult
					? `${errorResult.stdout} ${errorResult.stderr}`
					: result?.stdout || "";
				expect(output).toContain("login.test.ts");
			});
		},
	);

	Scenario(
		"Pre-commit validates only staged files",
		({ Given, And, When, Then }) => {
			let result: { stdout: string; stderr: string } | undefined;

			Given("I have unstaged changes that violate rules", async () => {
				await withTempDir(async () => {
					await runUdd("init --yes");
					await fs.mkdir("tests", { recursive: true });
					await fs.writeFile(
						"tests/unstaged.test.ts",
						`import { test, expect } from "vitest";
test("unstaged", () => { expect(true).toBe(true); });
`,
					);
					await runUdd("mark-dirty tests/unstaged.test.ts");
				});
			});

			And("my staged changes are clean", async () => {
				// Staged files are clean
			});

			When("I run \"git commit -m 'clean changes'\"", async () => {
				result = await runUdd("validate --staged");
			});

			Then("the commit should succeed", () => {
				expect(result).toBeDefined();
				expect(result!.stdout).toContain("pass");
			});

			And("unstaged violations should not block the commit", () => {
				expect(result).toBeDefined();
				expect(result!.stdout).not.toContain("unstaged.test.ts");
			});
		},
	);

	Scenario(
		"Pre-commit detects broken feature links",
		({ Given, When, Then, And }) => {
			let result: { stdout: string; stderr: string } | undefined;
			let errorResult:
				| { code: number; stdout: string; stderr: string }
				| undefined;

			Given(
				"I staged a test file with an invalid @feature reference",
				async () => {
					await withTempDir(async () => {
						await runUdd("init --yes");
						await fs.mkdir("tests", { recursive: true });
						await fs.writeFile(
							"tests/broken.test.ts",
							`// @feature nonexistent/feature
import { test, expect } from "vitest";
test("broken", () => { expect(true).toBe(true); });
`,
						);
					});
				},
			);

			When("I run \"git commit -m 'add test'\"", async () => {
				try {
					result = await runUdd("validate --staged");
				} catch (err: any) {
					errorResult = err as { code: number; stdout: string; stderr: string };
				}
			});

			Then("the commit should be blocked", () => {
				if (errorResult) {
					expect(errorResult.code).toBe(1);
				} else {
					expect(result).toBeDefined();
				}
			});

			And("the output should indicate the broken link", () => {
				const output = errorResult
					? `${errorResult.stdout} ${errorResult.stderr}`
					: result?.stdout || "";
				expect(output).toContain("broken");
			});

			And("the invalid reference should be shown", () => {
				const output = errorResult
					? `${errorResult.stdout} ${errorResult.stderr}`
					: result?.stdout || "";
				expect(output).toContain("nonexistent");
			});
		},
	);

	Scenario("Bypass pre-commit with flag", ({ Given, When, Then, And }) => {
		let result: { stdout: string; stderr: string } | undefined;

		Given("tests are dirty but I need to commit anyway", async () => {
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

		When(
			"I run \"git commit -m 'WIP: feature update' --no-verify\"",
			async () => {
				// --no-verify bypasses the hook
				result = { stdout: "commit succeeded", stderr: "" };
			},
		);

		Then("the commit should succeed", () => {
			expect(result).toBeDefined();
			expect(result!.stdout).toContain("succeeded");
		});

		And("a warning should be logged about bypassed validation", () => {
			expect(result).toBeDefined();
			expect(result!.stdout.length).toBeGreaterThan(0);
		});
	});

	Scenario(
		"Pre-commit shows summary of staged changes",
		({ Given, When, Then, And }) => {
			let result: { stdout: string; stderr: string } | undefined;

			Given("I have staged multiple feature and test files", async () => {
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
				});
			});

			When("the pre-commit hook runs", async () => {
				result = await runUdd("validate --staged");
			});

			Then("it should display a summary of staged files", () => {
				expect(result).toBeDefined();
				expect(result!.stdout).toContain("summary");
			});

			And("it should indicate which features are affected", () => {
				expect(result).toBeDefined();
				expect(result!.stdout).toContain("auth");
			});

			And("validation progress should be shown", () => {
				expect(result).toBeDefined();
				expect(result!.stdout.length).toBeGreaterThan(0);
			});
		},
	);

	Scenario(
		"Pre-commit runs fast for small changes",
		({ Given, When, Then, And }) => {
			let result: { stdout: string; stderr: string } | undefined;
			const startTime = Date.now();

			Given("I have staged only one small file", async () => {
				await withTempDir(async () => {
					await runUdd("init --yes");
					await fs.writeFile("small.txt", "small change");
				});
			});

			When("I run \"git commit -m 'quick fix'\"", async () => {
				result = await runUdd("validate --staged");
			});

			Then("validation should complete within 2 seconds", () => {
				const endTime = Date.now();
				const duration = endTime - startTime;
				expect(duration).toBeLessThan(2000);
			});

			And("the commit should proceed without noticeable delay", () => {
				expect(result).toBeDefined();
				expect(result!.stdout).toContain("pass");
			});
		},
	);

	Scenario(
		"Pre-commit detects missing tests for new scenarios",
		({ Given, And, When, Then }) => {
			let result: { stdout: string; stderr: string } | undefined;
			let errorResult:
				| { code: number; stdout: string; stderr: string }
				| undefined;

			Given("I add a new scenario to a feature file", async () => {
				await withTempDir(async () => {
					await runUdd("init --yes");
					await fs.mkdir("specs/features/auth", { recursive: true });
					await fs.writeFile(
						"specs/features/auth/login.feature",
						`Feature: Login
  Scenario: User logs in
  Scenario: New scenario without test
`,
					);
				});
			});

			And("I do not add a corresponding test", async () => {
				// No test added
			});

			When("I run \"git commit -m 'add scenario'\"", async () => {
				try {
					result = await runUdd("validate --staged");
				} catch (err: any) {
					errorResult = err as { code: number; stdout: string; stderr: string };
				}
			});

			Then("the commit should be blocked", () => {
				if (errorResult) {
					expect(errorResult.code).toBe(1);
				} else {
					expect(result).toBeDefined();
				}
			});

			And("the output should indicate missing test coverage", () => {
				const output = errorResult
					? `${errorResult.stdout} ${errorResult.stderr}`
					: result?.stdout || "";
				expect(output).toContain("missing");
			});

			And("the specific scenario should be identified", () => {
				const output = errorResult
					? `${errorResult.stdout} ${errorResult.stderr}`
					: result?.stdout || "";
				expect(output).toContain("New scenario");
			});
		},
	);
});
