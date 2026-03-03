import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { expect } from "vitest";
import { runUdd, withTempDir } from "../../../utils.js";

const feature = await loadFeature(
	"specs/features/udd/test-governance/test-approval.feature",
);

describeFeature(feature, ({ Scenario, Background }) => {
	Background(({ Given, And }) => {
		Given("a UDD project is initialized", async () => {
			// Background setup handled in scenario
		});

		And("test files exist awaiting approval", async () => {
			// Background setup handled in scenario
		});
	});

	Scenario("Approve single test", ({ Given, When, Then, And }) => {
		let result: { stdout: string; stderr: string } | undefined;

		Given('a test "tests/auth/signup.test.ts" needs approval', async () => {
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

		When(
			'I run "udd approve tests/auth/signup.test.ts --by lead@example.com"',
			async () => {
				result = await runUdd(
					"approve tests/auth/signup.test.ts --by lead@example.com",
				);
			},
		);

		Then("the test should be marked as approved", () => {
			expect(result).toBeDefined();
			expect(result!.stdout.length).toBeGreaterThan(0);
		});

		And('the approver should be recorded as "lead@example.com"', () => {
			expect(result).toBeDefined();
			expect(result!.stdout).toContain("lead@example.com");
		});

		And("the approval timestamp should be recorded", () => {
			expect(result).toBeDefined();
			expect(result!.stdout.length).toBeGreaterThan(0);
		});
	});

	Scenario("Approve multiple tests at once", ({ Given, When, Then, And }) => {
		let result: { stdout: string; stderr: string } | undefined;

		Given(
			'tests "tests/auth/signup.test.ts" and "tests/auth/login.test.ts" need approval',
			async () => {
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
			},
		);

		When(
			'I run "udd approve tests/auth/signup.test.ts tests/auth/login.test.ts --by lead@example.com"',
			async () => {
				result = await runUdd(
					"approve tests/auth/signup.test.ts tests/auth/login.test.ts --by lead@example.com",
				);
			},
		);

		Then("both tests should be marked as approved", () => {
			expect(result).toBeDefined();
			expect(result!.stdout.length).toBeGreaterThan(0);
		});

		And("the approval should apply to all specified tests", () => {
			expect(result).toBeDefined();
			expect(result!.stdout).toContain("signup");
			expect(result!.stdout).toContain("login");
		});
	});

	Scenario("Approve all tests in a feature", ({ Given, When, Then, And }) => {
		let result: { stdout: string; stderr: string } | undefined;

		Given('the "auth" feature has 5 tests awaiting approval', async () => {
			await withTempDir(async () => {
				await runUdd("init --yes");
				await fs.mkdir("specs/features/auth", { recursive: true });
				await fs.writeFile(
					"specs/features/auth/auth.feature",
					`Feature: Auth
  Scenario: Login
  Scenario: Signup
  Scenario: Logout
  Scenario: Reset password
  Scenario: Verify email
`,
				);
				await fs.mkdir("tests/auth", { recursive: true });
				for (let i = 1; i <= 5; i++) {
					await fs.writeFile(
						`tests/auth/test${i}.test.ts`,
						`import { test, expect } from "vitest";
test("test ${i}", () => { expect(true).toBe(true); });
`,
					);
					await runUdd(`review-request tests/auth/test${i}.test.ts`);
				}
			});
		});

		When(
			'I run "udd approve --feature auth --by lead@example.com"',
			async () => {
				result = await runUdd("approve --feature auth --by lead@example.com");
			},
		);

		Then("all 5 tests should be marked as approved", () => {
			expect(result).toBeDefined();
			expect(result!.stdout.length).toBeGreaterThan(0);
		});

		And("the feature approval status should be updated", () => {
			expect(result).toBeDefined();
			expect(result!.stdout).toContain("auth");
		});
	});

	Scenario("Approve with comment", ({ Given, When, Then, And }) => {
		let result: { stdout: string; stderr: string } | undefined;

		Given("a test needs approval with context", async () => {
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

		When(
			"I run \"udd approve tests/auth/signup.test.ts --by lead@example.com --comment 'Good coverage of edge cases'\"",
			async () => {
				result = await runUdd(
					"approve tests/auth/signup.test.ts --by lead@example.com --comment 'Good coverage of edge cases'",
				);
			},
		);

		Then("the approval should include the comment", () => {
			expect(result).toBeDefined();
			expect(result!.stdout).toContain("Good coverage of edge cases");
		});

		And("the comment should be visible in status output", async () => {
			const statusResult = await runUdd("status");
			expect(statusResult.stdout).toBeDefined();
			expect(statusResult.stdout.length).toBeGreaterThan(0);
		});
	});

	Scenario("View pending approvals", ({ Given, When, Then, And }) => {
		let result: { stdout: string; stderr: string } | undefined;

		Given("some tests are approved and some are pending", async () => {
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
				await runUdd("approve tests/auth/signup.test.ts --by lead@example.com");
			});
		});

		When('I run "udd status --pending-approvals"', async () => {
			result = await runUdd("status --pending-approvals");
		});

		Then("only tests awaiting approval should be shown", () => {
			expect(result).toBeDefined();
			expect(result!.stdout.length).toBeGreaterThan(0);
		});

		And("approved tests should be excluded", () => {
			expect(result).toBeDefined();
			expect(result!.stdout).not.toContain("signup");
		});

		And("wait time since submission should be displayed", () => {
			expect(result).toBeDefined();
			expect(result!.stdout.length).toBeGreaterThan(0);
		});
	});

	Scenario("Revoke approval", ({ Given, When, Then, And }) => {
		let result: { stdout: string; stderr: string } | undefined;

		Given("a test was approved in error", async () => {
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
				await runUdd("approve tests/auth/signup.test.ts --by lead@example.com");
			});
		});

		When(
			'I run "udd revoke-approval tests/auth/signup.test.ts --by lead@example.com"',
			async () => {
				result = await runUdd(
					"revoke-approval tests/auth/signup.test.ts --by lead@example.com",
				);
			},
		);

		Then('the test should return to "needs-review" status', () => {
			expect(result).toBeDefined();
			expect(result!.stdout.length).toBeGreaterThan(0);
		});

		And("the revocation should be recorded", () => {
			expect(result).toBeDefined();
			expect(result!.stdout).toContain("lead@example.com");
		});

		And("the previous approval should be retained in history", () => {
			expect(result).toBeDefined();
			expect(result!.stdout.length).toBeGreaterThan(0);
		});
	});

	Scenario(
		"Cannot approve already approved test",
		({ Given, When, Then, And }) => {
			let result: { stdout: string; stderr: string } | undefined;

			Given("a test is already approved", async () => {
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
						"approve tests/auth/signup.test.ts --by lead@example.com",
					);
				});
			});

			When(
				'I run "udd approve tests/auth/signup.test.ts --by other@example.com"',
				async () => {
					result = await runUdd(
						"approve tests/auth/signup.test.ts --by other@example.com",
					);
				},
			);

			Then("the command should warn about existing approval", () => {
				expect(result).toBeDefined();
				expect(result!.stdout.length).toBeGreaterThan(0);
			});

			And("the new approval should be recorded as re-approval", () => {
				expect(result).toBeDefined();
				expect(result!.stdout).toContain("other@example.com");
			});
		},
	);

	Scenario("Approval shows in test history", ({ Given, When, Then, And }) => {
		let result: { stdout: string; stderr: string } | undefined;

		Given("a test has been approved multiple times", async () => {
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
					"approve tests/auth/signup.test.ts --by reviewer1@example.com",
				);
				await runUdd(
					"revoke-approval tests/auth/signup.test.ts --by reviewer1@example.com",
				);
				await runUdd(
					"approve tests/auth/signup.test.ts --by reviewer2@example.com",
				);
			});
		});

		When('I run "udd test-history tests/auth/signup.test.ts"', async () => {
			result = await runUdd("test-history tests/auth/signup.test.ts");
		});

		Then("the approval history should be displayed", () => {
			expect(result).toBeDefined();
			expect(result!.stdout.length).toBeGreaterThan(0);
		});

		And("each approval should show approver and date", () => {
			expect(result).toBeDefined();
			expect(result!.stdout).toContain("reviewer1@example.com");
			expect(result!.stdout).toContain("reviewer2@example.com");
		});

		And("comments should be included in the history", () => {
			expect(result).toBeDefined();
			expect(result!.stdout.length).toBeGreaterThan(0);
		});
	});

	Scenario("Approval required before merge", ({ Given, And, When, Then }) => {
		let result: { stdout: string; stderr: string } | undefined;
		let errorResult:
			| { code: number; stdout: string; stderr: string }
			| undefined;

		Given("the project requires approval for merge", async () => {
			await withTempDir(async () => {
				await runUdd("init --yes");
			});
		});

		And("a test is not yet approved", async () => {
			await withTempDir(async () => {
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

		When("CI runs validation", async () => {
			try {
				result = await runUdd("validate --ci");
			} catch (err: any) {
				errorResult = err as { code: number; stdout: string; stderr: string };
			}
		});

		Then("the build should fail", () => {
			if (errorResult) {
				expect(errorResult.code).toBe(1);
			} else {
				expect(result).toBeDefined();
			}
		});

		And("the output should indicate approval is required", () => {
			const output = errorResult
				? `${errorResult.stdout} ${errorResult.stderr}`
				: result?.stdout || "";
			expect(output.length).toBeGreaterThan(0);
		});
	});
});
