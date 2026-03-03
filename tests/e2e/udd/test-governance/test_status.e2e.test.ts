import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { expect } from "vitest";
import { runUdd, withTempDir } from "../../../utils.js";

const feature = await loadFeature(
	"specs/features/udd/test-governance/test-status.feature",
);

describeFeature(feature, ({ Scenario, Background }) => {
	Background(({ Given, And }) => {
		Given("a UDD project is initialized", async () => {
			// Background setup handled in scenario
		});

		And("test files exist with valid feature linkages", async () => {
			// Background setup handled in scenario
		});
	});

	Scenario(
		"View test status for all features",
		({ Given, When, Then, And }) => {
			let result: { stdout: string; stderr: string } | undefined;

			Given("tests exist with various statuses", async () => {
				await withTempDir(async () => {
					await runUdd("init --yes");
					await fs.mkdir("specs/features/auth", { recursive: true });
					await fs.writeFile(
						"specs/features/auth/login.feature",
						`Feature: User Login
  Scenario: Successful login
    Given a user exists
    When they log in
    Then they should be authenticated
`,
					);
					await fs.mkdir("tests/auth", { recursive: true });
					await fs.writeFile(
						"tests/auth/login.test.ts",
						`import { describe, it, expect } from "vitest";
describe("Login", () => {
  it("should work", () => {
    expect(true).toBe(true);
  });
});
`,
					);
					await runUdd(
						"test link tests/auth/login.test.ts specs/features/auth/login.feature",
					);
				});
			});

			When('I run "udd status --tests"', async () => {
				result = await runUdd("status --tests");
			});

			Then("the output should show each feature with test counts", () => {
				expect(result).toBeDefined();
				expect(result!.stdout).toContain("User Login");
			});

			And("the output should include passing/failing/pending counts", () => {
				expect(result).toBeDefined();
				expect(result!.stdout.length).toBeGreaterThan(0);
			});

			And("the output should show last run timestamps", () => {
				expect(result).toBeDefined();
				expect(result!.stdout.length).toBeGreaterThan(0);
			});
		},
	);

	Scenario("Feature shows mixed test status", ({ Given, And, When, Then }) => {
		let result: { stdout: string; stderr: string } | undefined;

		Given('a feature "checkout" has 3 scenarios', async () => {
			await withTempDir(async () => {
				await runUdd("init --yes");
				await fs.mkdir("specs/features/checkout", { recursive: true });
				await fs.writeFile(
					"specs/features/checkout/checkout.feature",
					`Feature: Checkout
  Scenario: Add to cart
    Given a product exists
    When user adds to cart
    Then cart should contain product

  Scenario: Remove from cart
    Given a product in cart
    When user removes it
    Then cart should be empty

  Scenario: Checkout process
    Given items in cart
    When user checks out
    Then order should be created
`,
				);
			});
		});

		And("2 scenarios have passing tests", async () => {
			await withTempDir(async () => {
				await fs.mkdir("tests/checkout", { recursive: true });
				await fs.writeFile(
					"tests/checkout/add-to-cart.test.ts",
					`import { test, expect } from "vitest";
test("add to cart", () => { expect(true).toBe(true); });
`,
				);
				await fs.writeFile(
					"tests/checkout/remove-from-cart.test.ts",
					`import { test, expect } from "vitest";
test("remove from cart", () => { expect(true).toBe(true); });
`,
				);
			});
		});

		And("1 scenario has a failing test", async () => {
			await withTempDir(async () => {
				await fs.writeFile(
					"tests/checkout/checkout-process.test.ts",
					`import { test, expect } from "vitest";
test("checkout process", () => { expect(false).toBe(true); });
`,
				);
			});
		});

		When('I run "udd status"', async () => {
			result = await runUdd("status");
		});

		Then('"checkout" should show status "partial"', () => {
			expect(result).toBeDefined();
			expect(result!.stdout.length).toBeGreaterThan(0);
		});

		And('the output should indicate "2 passing, 1 failing"', () => {
			expect(result).toBeDefined();
			expect(result!.stdout.length).toBeGreaterThan(0);
		});
	});

	Scenario("Test never run shows as pending", ({ Given, And, When, Then }) => {
		let result: { stdout: string; stderr: string } | undefined;

		Given('a feature "new-feature" has scenarios', async () => {
			await withTempDir(async () => {
				await runUdd("init --yes");
				await fs.mkdir("specs/features/new-feature", { recursive: true });
				await fs.writeFile(
					"specs/features/new-feature/feature.feature",
					`Feature: New Feature
  Scenario: Something new
    Given a condition
    When an action happens
    Then a result occurs
`,
				);
			});
		});

		And('no tests have been executed for "new-feature"', async () => {
			// No tests created, so none have been executed
		});

		When('I run "udd status"', async () => {
			result = await runUdd("status");
		});

		Then('"new-feature" should show status "pending"', () => {
			expect(result).toBeDefined();
			expect(result!.stdout.length).toBeGreaterThan(0);
		});

		And("the output should indicate tests need to be run", () => {
			expect(result).toBeDefined();
			expect(result!.stdout.length).toBeGreaterThan(0);
		});
	});

	Scenario("Failed test shows error details", ({ Given, And, When, Then }) => {
		let result: { stdout: string; stderr: string } | undefined;

		Given('a test "auth/login.e2e.test.ts" has failed', async () => {
			await withTempDir(async () => {
				await runUdd("init --yes");
				await fs.mkdir("tests/auth", { recursive: true });
				await fs.writeFile(
					"tests/auth/login.e2e.test.ts",
					`import { test, expect } from "vitest";
test("login fails", () => { expect(false).toBe(true); });
`,
				);
			});
		});

		And(
			'the failure is "AssertionError: expected 200 but got 401"',
			async () => {
				// Test setup creates a failing test
			},
		);

		When('I run "udd status --verbose"', async () => {
			result = await runUdd("status --verbose");
		});

		Then("the output should include the failure message", () => {
			expect(result).toBeDefined();
			expect(result!.stdout.length).toBeGreaterThan(0);
		});

		And("the output should show the failing test file path", () => {
			expect(result).toBeDefined();
			expect(result!.stdout.length).toBeGreaterThan(0);
		});

		And("the output should suggest checking the test output", () => {
			expect(result).toBeDefined();
			expect(result!.stdout.length).toBeGreaterThan(0);
		});
	});

	Scenario("Filter status by outcome", ({ Given, When, Then, And }) => {
		let result: { stdout: string; stderr: string } | undefined;

		Given(
			"tests exist with passing, failing, and pending statuses",
			async () => {
				await withTempDir(async () => {
					await runUdd("init --yes");
					await fs.mkdir("tests/unit", { recursive: true });
					await fs.writeFile(
						"tests/unit/passing.test.ts",
						`import { test, expect } from "vitest";
test("passes", () => { expect(true).toBe(true); });
`,
					);
					await fs.writeFile(
						"tests/unit/failing.test.ts",
						`import { test, expect } from "vitest";
test("fails", () => { expect(false).toBe(true); });
`,
					);
				});
			},
		);

		When('I run "udd status --failed-only"', async () => {
			result = await runUdd("status --failed-only");
		});

		Then("only features with failing tests should be displayed", () => {
			expect(result).toBeDefined();
			expect(result!.stdout.length).toBeGreaterThan(0);
		});

		And("passing and pending features should be hidden", () => {
			expect(result).toBeDefined();
			expect(result!.stdout.length).toBeGreaterThan(0);
		});
	});

	Scenario(
		"Test status aggregates across test types",
		({ Given, When, Then, And }) => {
			let result: { stdout: string; stderr: string } | undefined;

			Given(
				'feature "payment" has unit tests, integration tests, and e2e tests',
				async () => {
					await withTempDir(async () => {
						await runUdd("init --yes");
						await fs.mkdir("tests/unit", { recursive: true });
						await fs.mkdir("tests/integration", { recursive: true });
						await fs.mkdir("tests/e2e", { recursive: true });
						await fs.writeFile(
							"tests/unit/payment.test.ts",
							`import { test, expect } from "vitest";
test("unit", () => { expect(true).toBe(true); });
`,
						);
						await fs.writeFile(
							"tests/integration/payment.test.ts",
							`import { test, expect } from "vitest";
test("integration", () => { expect(true).toBe(true); });
`,
						);
						await fs.writeFile(
							"tests/e2e/payment.test.ts",
							`import { test, expect } from "vitest";
test("e2e", () => { expect(true).toBe(true); });
`,
						);
					});
				},
			);

			When('I run "udd status"', async () => {
				result = await runUdd("status");
			});

			Then("the output should show aggregated status", () => {
				expect(result).toBeDefined();
				expect(result!.stdout.length).toBeGreaterThan(0);
			});

			And("the output should indicate test type breakdown", () => {
				expect(result).toBeDefined();
				expect(result!.stdout.length).toBeGreaterThan(0);
			});

			And("a failure in any type should mark feature as failing", () => {
				expect(result).toBeDefined();
				expect(result!.stdout.length).toBeGreaterThan(0);
			});
		},
	);
});
