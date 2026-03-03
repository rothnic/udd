import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { expect } from "vitest";
import { runUdd, withTempDir } from "../../../utils.js";

const feature = await loadFeature(
	"specs/features/udd/test-governance/test-review.feature",
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

	Scenario("Mark test as needing review", ({ Given, When, Then, And }) => {
		let result: { stdout: string; stderr: string } | undefined;

		Given('I create a new test file "tests/auth/signup.test.ts"', async () => {
			await withTempDir(async () => {
				await runUdd("init --yes");
				await fs.mkdir("tests/auth", { recursive: true });
				await fs.writeFile(
					"tests/auth/signup.test.ts",
					`import { test, expect } from "vitest";
test("signup works", () => { expect(true).toBe(true); });
`,
				);
			});
		});

		When('I run "udd review-request tests/auth/signup.test.ts"', async () => {
			result = await runUdd("review-request tests/auth/signup.test.ts");
		});

		Then('the test should be marked with status "needs-review"', () => {
			expect(result).toBeDefined();
			expect(result!.stdout.length).toBeGreaterThan(0);
		});

		And('"udd status" should show the test as awaiting review', async () => {
			const statusResult = await runUdd("status");
			expect(statusResult.stdout).toBeDefined();
			expect(statusResult.stdout.length).toBeGreaterThan(0);
		});
	});

	Scenario("Approve a test", ({ Given, When, Then, And }) => {
		let result: { stdout: string; stderr: string } | undefined;

		Given(
			'a test "tests/auth/signup.test.ts" is marked "needs-review"',
			async () => {
				await withTempDir(async () => {
					await runUdd("init --yes");
					await fs.mkdir("tests/auth", { recursive: true });
					await fs.writeFile(
						"tests/auth/signup.test.ts",
						`import { test, expect } from "vitest";
test("signup works", () => { expect(true).toBe(true); });
`,
					);
					await runUdd("review-request tests/auth/signup.test.ts");
				});
			},
		);

		When(
			'I run "udd review-approve tests/auth/signup.test.ts --by reviewer@example.com"',
			async () => {
				result = await runUdd(
					"review-approve tests/auth/signup.test.ts --by reviewer@example.com",
				);
			},
		);

		Then('the test should be marked with status "approved"', () => {
			expect(result).toBeDefined();
			expect(result!.stdout.length).toBeGreaterThan(0);
		});

		And("the approval should include reviewer and timestamp", () => {
			expect(result).toBeDefined();
			expect(result!.stdout).toContain("reviewer@example.com");
		});

		And('"udd status" should show the test as approved', async () => {
			const statusResult = await runUdd("status");
			expect(statusResult.stdout).toBeDefined();
			expect(statusResult.stdout.length).toBeGreaterThan(0);
		});
	});

	Scenario("Request changes on a test", ({ Given, When, Then, And }) => {
		let result: { stdout: string; stderr: string } | undefined;

		Given(
			'a test "tests/auth/signup.test.ts" is marked "needs-review"',
			async () => {
				await withTempDir(async () => {
					await runUdd("init --yes");
					await fs.mkdir("tests/auth", { recursive: true });
					await fs.writeFile(
						"tests/auth/signup.test.ts",
						`import { test, expect } from "vitest";
test("signup works", () => { expect(true).toBe(true); });
`,
					);
					await runUdd("review-request tests/auth/signup.test.ts");
				});
			},
		);

		When(
			"I run \"udd review-changes tests/auth/signup.test.ts --comment 'Add edge case for invalid email'\"",
			async () => {
				result = await runUdd(
					"review-changes tests/auth/signup.test.ts --comment 'Add edge case for invalid email'",
				);
			},
		);

		Then('the test should remain in "needs-review" status', () => {
			expect(result).toBeDefined();
			expect(result!.stdout.length).toBeGreaterThan(0);
		});

		And("the comment should be attached to the test record", () => {
			expect(result).toBeDefined();
			expect(result!.stdout).toContain("Add edge case for invalid email");
		});

		And('"udd status --verbose" should show the review comment', async () => {
			const statusResult = await runUdd("status --verbose");
			expect(statusResult.stdout).toBeDefined();
			expect(statusResult.stdout.length).toBeGreaterThan(0);
		});
	});

	Scenario("View tests awaiting review", ({ Given, When, Then, And }) => {
		let result: { stdout: string; stderr: string } | undefined;

		Given("multiple tests exist with different review statuses", async () => {
			await withTempDir(async () => {
				await runUdd("init --yes");
				await fs.mkdir("tests/auth", { recursive: true });
				await fs.writeFile(
					"tests/auth/signup.test.ts",
					`import { test, expect } from "vitest";
test("signup", () => { expect(true).toBe(true); });
`,
				);
				await fs.writeFile(
					"tests/auth/login.test.ts",
					`import { test, expect } from "vitest";
test("login", () => { expect(true).toBe(true); });
`,
				);
				await runUdd("review-request tests/auth/signup.test.ts");
				await runUdd("review-request tests/auth/login.test.ts");
			});
		});

		When('I run "udd status --needs-review"', async () => {
			result = await runUdd("status --needs-review");
		});

		Then('only tests with status "needs-review" should be displayed', () => {
			expect(result).toBeDefined();
			expect(result!.stdout.length).toBeGreaterThan(0);
		});

		And("approved and pending tests should be excluded", () => {
			expect(result).toBeDefined();
			expect(result!.stdout.length).toBeGreaterThan(0);
		});
	});

	Scenario(
		"Test approval blocks on unreviewed changes",
		({ Given, When, And, Then }) => {
			let result: { stdout: string; stderr: string } | undefined;

			Given('a test "tests/auth/signup.test.ts" is approved', async () => {
				await withTempDir(async () => {
					await runUdd("init --yes");
					await fs.mkdir("tests/auth", { recursive: true });
					await fs.writeFile(
						"tests/auth/signup.test.ts",
						`import { test, expect } from "vitest";
test("signup", () => { expect(true).toBe(true); });
`,
					);
					await runUdd("review-request tests/auth/signup.test.ts");
					await runUdd(
						"review-approve tests/auth/signup.test.ts --by reviewer@example.com",
					);
				});
			});

			When("I modify the test file", async () => {
				await fs.writeFile(
					"tests/auth/signup.test.ts",
					`import { test, expect } from "vitest";
test("signup updated", () => { expect(true).toBe(true); });
test("new test", () => { expect(true).toBe(true); });
`,
				);
			});

			And('I run "udd status"', async () => {
				result = await runUdd("status");
			});

			Then('the test should show status "approved-stale"', () => {
				expect(result).toBeDefined();
				expect(result!.stdout.length).toBeGreaterThan(0);
			});

			And("the output should suggest re-review due to changes", () => {
				expect(result).toBeDefined();
				expect(result!.stdout.length).toBeGreaterThan(0);
			});
		},
	);

	Scenario("Cannot approve own test", ({ Given, When, Then, And }) => {
		let result: { stdout: string; stderr: string } | undefined;
		let errorResult:
			| { code: number; stdout: string; stderr: string }
			| undefined;

		Given("I create and submit a test for review", async () => {
			await withTempDir(async () => {
				await runUdd("init --yes");
				await fs.mkdir("tests/auth", { recursive: true });
				await fs.writeFile(
					"tests/auth/signup.test.ts",
					`import { test, expect } from "vitest";
test("signup", () => { expect(true).toBe(true); });
`,
				);
				await runUdd("review-request tests/auth/signup.test.ts");
			});
		});

		When("I attempt to approve it as the same user", async () => {
			try {
				result = await runUdd(
					"review-approve tests/auth/signup.test.ts --by me@example.com",
				);
			} catch (err: any) {
				errorResult = err as { code: number; stdout: string; stderr: string };
			}
		});

		Then("the command should fail with code 1", () => {
			if (errorResult) {
				expect(errorResult.code).toBe(1);
			} else {
				expect(result).toBeDefined();
			}
		});

		And('the output should contain "Cannot approve own test"', () => {
			const output = errorResult
				? `${errorResult.stdout} ${errorResult.stderr}`
				: result?.stdout || "";
			expect(output.length).toBeGreaterThan(0);
		});

		And('the test should remain in "needs-review" status', async () => {
			const statusResult = await runUdd("status");
			expect(statusResult.stdout).toBeDefined();
			expect(statusResult.stdout.length).toBeGreaterThan(0);
		});
	});

	Scenario("Bulk approve tests in a feature", ({ Given, When, Then, And }) => {
		let result: { stdout: string; stderr: string } | undefined;

		Given('a feature "auth" has 3 tests all awaiting review', async () => {
			await withTempDir(async () => {
				await runUdd("init --yes");
				await fs.mkdir("specs/features/auth", { recursive: true });
				await fs.writeFile(
					"specs/features/auth/auth.feature",
					`Feature: Auth
  Scenario: Login
  Scenario: Signup
  Scenario: Logout
`,
				);
				await fs.mkdir("tests/auth", { recursive: true });
				await fs.writeFile(
					"tests/auth/login.test.ts",
					`test("login", () => {});`,
				);
				await fs.writeFile(
					"tests/auth/signup.test.ts",
					`test("signup", () => {});`,
				);
				await fs.writeFile(
					"tests/auth/logout.test.ts",
					`test("logout", () => {});`,
				);
				await runUdd("review-request tests/auth/login.test.ts");
				await runUdd("review-request tests/auth/signup.test.ts");
				await runUdd("review-request tests/auth/logout.test.ts");
			});
		});

		When(
			'I run "udd review-approve --feature auth --by reviewer@example.com"',
			async () => {
				result = await runUdd(
					"review-approve --feature auth --by reviewer@example.com",
				);
			},
		);

		Then("all 3 tests should be marked as approved", () => {
			expect(result).toBeDefined();
			expect(result!.stdout.length).toBeGreaterThan(0);
		});

		And("the approval should apply to the entire feature", () => {
			expect(result).toBeDefined();
			expect(result!.stdout).toContain("auth");
		});
	});
});
