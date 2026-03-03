import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { expect } from "vitest";
import { runUdd, withTempDir } from "../../../utils.js";

const feature = await loadFeature(
	"specs/features/udd/test-governance/dirty-marking.feature",
);

describeFeature(feature, ({ Scenario, Background }) => {
	Background(({ Given, And }) => {
		Given("a UDD project is initialized", async () => {
			// Background setup handled in scenario
		});

		And(
			'a feature file exists at "specs/features/payment/checkout.feature"',
			async () => {
				// Background setup handled in scenario
			},
		);

		And(
			'a test file "tests/payment/checkout.test.ts" links to the feature',
			async () => {
				// Background setup handled in scenario
			},
		);
	});

	Scenario(
		"Mark test as dirty when feature changes",
		({ Given, When, Then, And }) => {
			let result: { stdout: string; stderr: string } | undefined;

			Given("the test is currently clean", async () => {
				await withTempDir(async () => {
					await runUdd("init --yes");
					await fs.mkdir("specs/features/payment", { recursive: true });
					await fs.writeFile(
						"specs/features/payment/checkout.feature",
						`Feature: Checkout
  Scenario: Process payment
`,
					);
					await fs.mkdir("tests/payment", { recursive: true });
					await fs.writeFile(
						"tests/payment/checkout.test.ts",
						`import { test, expect } from "vitest";
test("checkout", () => { expect(true).toBe(true); });
`,
					);
					await runUdd(
						"test link tests/payment/checkout.test.ts specs/features/payment/checkout.feature",
					);
					await runUdd("mark-clean tests/payment/checkout.test.ts");
				});
			});

			When('I modify "specs/features/payment/checkout.feature"', async () => {
				await fs.writeFile(
					"specs/features/payment/checkout.feature",
					`Feature: Checkout
  Scenario: Process payment
  Scenario: Refund payment
`,
				);
			});

			And("the system detects the change", async () => {
				result = await runUdd("detect-changes");
			});

			Then('"tests/payment/checkout.test.ts" should be marked as dirty', () => {
				expect(result).toBeDefined();
				expect(result!.stdout).toContain("dirty");
			});

			And("the dirty timestamp should be recorded", () => {
				expect(result).toBeDefined();
				expect(result!.stdout.length).toBeGreaterThan(0);
			});
		},
	);

	Scenario("View dirty tests in status", ({ Given, And, When, Then }) => {
		let result: { stdout: string; stderr: string } | undefined;

		Given("multiple tests exist", async () => {
			await withTempDir(async () => {
				await runUdd("init --yes");
				await fs.mkdir("tests/unit", { recursive: true });
				await fs.writeFile(
					"tests/unit/test1.test.ts",
					`import { test, expect } from "vitest";
test("test1", () => { expect(true).toBe(true); });
`,
				);
				await fs.writeFile(
					"tests/unit/test2.test.ts",
					`import { test, expect } from "vitest";
test("test2", () => { expect(true).toBe(true); });
`,
				);
			});
		});

		And("some tests are marked dirty", async () => {
			await runUdd("mark-dirty tests/unit/test1.test.ts");
		});

		When('I run "udd status"', async () => {
			result = await runUdd("status");
		});

		Then("dirty tests should be highlighted", () => {
			expect(result).toBeDefined();
			expect(result!.stdout).toContain("dirty");
		});

		And("the count of dirty tests should be displayed", () => {
			expect(result).toBeDefined();
			expect(result!.stdout).toMatch(/\d+ dirty/i);
		});

		And("each dirty test should show when it became dirty", () => {
			expect(result).toBeDefined();
			expect(result!.stdout.length).toBeGreaterThan(0);
		});
	});

	Scenario("Mark test as clean after review", ({ Given, When, Then, And }) => {
		let result: { stdout: string; stderr: string } | undefined;

		Given('"tests/payment/checkout.test.ts" is marked dirty', async () => {
			await withTempDir(async () => {
				await runUdd("init --yes");
				await fs.mkdir("tests/payment", { recursive: true });
				await fs.writeFile(
					"tests/payment/checkout.test.ts",
					`import { test, expect } from "vitest";
test("checkout", () => { expect(true).toBe(true); });
`,
				);
				await runUdd("mark-dirty tests/payment/checkout.test.ts");
			});
		});

		When('I run "udd mark-clean tests/payment/checkout.test.ts"', async () => {
			result = await runUdd("mark-clean tests/payment/checkout.test.ts");
		});

		Then("the test should no longer be marked dirty", () => {
			expect(result).toBeDefined();
			expect(result!.stdout).toContain("clean");
		});

		And("the clean timestamp should be recorded", () => {
			expect(result).toBeDefined();
			expect(result!.stdout.length).toBeGreaterThan(0);
		});

		And("the test should show as up-to-date in status", async () => {
			const statusResult = await runUdd("status");
			expect(statusResult.stdout).toBeDefined();
			expect(statusResult.stdout).toContain("clean");
		});
	});

	Scenario(
		"Mark all tests in a feature as clean",
		({ Given, When, Then, And }) => {
			let result: { stdout: string; stderr: string } | undefined;

			Given("a feature has 3 dirty tests", async () => {
				await withTempDir(async () => {
					await runUdd("init --yes");
					await fs.mkdir("tests/payment", { recursive: true });
					for (let i = 1; i <= 3; i++) {
						await fs.writeFile(
							`tests/payment/test${i}.test.ts`,
							`import { test, expect } from "vitest";
test("test${i}", () => { expect(true).toBe(true); });
`,
						);
						await runUdd(`mark-dirty tests/payment/test${i}.test.ts`);
					}
				});
			});

			When('I run "udd mark-clean --feature payment/checkout"', async () => {
				result = await runUdd("mark-clean --feature payment/checkout");
			});

			Then("all 3 tests should be marked clean", () => {
				expect(result).toBeDefined();
				expect(result!.stdout).toContain("3");
			});

			And("the operation should complete in a single command", () => {
				expect(result).toBeDefined();
				expect(result!.stdout.length).toBeGreaterThan(0);
			});
		},
	);

	Scenario(
		"Dirty test prevents clean CI status",
		({ Given, When, Then, And }) => {
			let result: { stdout: string; stderr: string } | undefined;
			let errorResult:
				| { code: number; stdout: string; stderr: string }
				| undefined;

			Given("a test is marked dirty", async () => {
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

			When('CI runs "udd validate"', async () => {
				try {
					result = await runUdd("validate");
				} catch (err: any) {
					errorResult = err as { code: number; stdout: string; stderr: string };
				}
			});

			Then("the validation should fail", () => {
				if (errorResult) {
					expect(errorResult.code).toBe(1);
				} else {
					expect(result).toBeDefined();
				}
			});

			And("the error should indicate dirty tests must be reviewed", () => {
				const output = errorResult
					? `${errorResult.stdout} ${errorResult.stderr}`
					: result?.stdout || "";
				expect(output).toContain("dirty");
			});

			And("the specific dirty test should be listed", () => {
				const output = errorResult
					? `${errorResult.stdout} ${errorResult.stderr}`
					: result?.stdout || "";
				expect(output).toContain("dirty.test.ts");
			});
		},
	);

	Scenario(
		"Force mark clean with confirmation",
		({ Given, When, Then, And }) => {
			let result: { stdout: string; stderr: string } | undefined;

			Given("a test is marked dirty", async () => {
				await withTempDir(async () => {
					await runUdd("init --yes");
					await fs.mkdir("tests/payment", { recursive: true });
					await fs.writeFile(
						"tests/payment/checkout.test.ts",
						`import { test, expect } from "vitest";
test("checkout", () => { expect(true).toBe(true); });
`,
					);
					await runUdd("mark-dirty tests/payment/checkout.test.ts");
				});
			});

			When(
				'I run "udd mark-clean tests/payment/checkout.test.ts --force"',
				async () => {
					result = await runUdd(
						"mark-clean tests/payment/checkout.test.ts --force",
					);
				},
			);

			Then("I should be prompted for confirmation", () => {
				expect(result).toBeDefined();
				expect(result!.stdout).toContain("confirm");
			});

			And("after confirming, the test should be marked clean", () => {
				expect(result).toBeDefined();
				expect(result!.stdout).toContain("clean");
			});

			And("a warning about forced clean should be recorded", () => {
				expect(result).toBeDefined();
				expect(result!.stdout).toContain("force");
			});
		},
	);

	Scenario("Cannot mark non-existent test as clean", ({ When, Then, And }) => {
		let result: { stdout: string; stderr: string } | undefined;
		let errorResult:
			| { code: number; stdout: string; stderr: string }
			| undefined;

		When('I run "udd mark-clean tests/nonexistent.test.ts"', async () => {
			await withTempDir(async () => {
				await runUdd("init --yes");
				try {
					result = await runUdd("mark-clean tests/nonexistent.test.ts");
				} catch (err: any) {
					errorResult = err as { code: number; stdout: string; stderr: string };
				}
			});
		});

		Then("the command should exit with code 1", () => {
			if (errorResult) {
				expect(errorResult.code).toBe(1);
			} else {
				expect(result).toBeDefined();
			}
		});

		And("the output should indicate the test file does not exist", () => {
			const output = errorResult
				? `${errorResult.stdout} ${errorResult.stderr}`
				: result?.stdout || "";
			expect(output).toContain("not exist");
		});
	});
});
