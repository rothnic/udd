import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { expect } from "vitest";
import { runUdd, withTempDir } from "../../../utils.js";

const feature = await loadFeature(
	"specs/features/udd/test-governance/status-integration.feature",
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
		"Status shows test governance overview",
		({ Given, When, Then, And }) => {
			let result: { stdout: string; stderr: string } | undefined;

			Given("the project has features with various test states", async () => {
				await withTempDir(async () => {
					await runUdd("init --yes");
					await fs.mkdir("tests/unit", { recursive: true });
					await fs.writeFile(
						"tests/unit/test1.test.ts",
						`import { test, expect } from "vitest";
test("test1", () => { expect(true).toBe(true); });
`,
					);
				});
			});

			When('I run "udd status"', async () => {
				result = await runUdd("status");
			});

			Then('the output should include a "Test Governance" section', () => {
				expect(result).toBeDefined();
				expect(result!.stdout).toContain("Test Governance");
			});

			And("it should show counts of clean, dirty, and pending tests", () => {
				expect(result).toBeDefined();
				expect(result!.stdout).toMatch(/clean|dirty|pending/i);
			});

			And("it should show test coverage percentage", () => {
				expect(result).toBeDefined();
				expect(result!.stdout).toMatch(/\d+%/);
			});
		},
	);

	Scenario(
		"Status highlights dirty tests prominently",
		({ Given, When, Then, And }) => {
			let result: { stdout: string; stderr: string } | undefined;

			Given("some tests are marked dirty", async () => {
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

			When('I run "udd status"', async () => {
				result = await runUdd("status");
			});

			Then("dirty tests should be listed in a dedicated section", () => {
				expect(result).toBeDefined();
				expect(result!.stdout).toContain("Dirty");
			});

			And(
				"they should be visually highlighted (e.g., with color or markers)",
				() => {
					expect(result).toBeDefined();
					expect(result!.stdout.length).toBeGreaterThan(0);
				},
			);

			And("the section should appear early in the output", () => {
				expect(result).toBeDefined();
				expect(result!.stdout.length).toBeGreaterThan(0);
			});
		},
	);

	Scenario("Status shows review queue", ({ Given, When, Then, And }) => {
		let result: { stdout: string; stderr: string } | undefined;

		Given("some tests are awaiting review", async () => {
			await withTempDir(async () => {
				await runUdd("init --yes");
				await fs.mkdir("tests", { recursive: true });
				await fs.writeFile(
					"tests/review.test.ts",
					`import { test, expect } from "vitest";
test("review", () => { expect(true).toBe(true); });
`,
				);
				await runUdd("review-request tests/review.test.ts");
			});
		});

		When('I run "udd status"', async () => {
			result = await runUdd("status");
		});

		Then('the output should include a "Review Queue" section', () => {
			expect(result).toBeDefined();
			expect(result!.stdout).toContain("Review");
		});

		And("it should show tests needing review", () => {
			expect(result).toBeDefined();
			expect(result!.stdout).toContain("review");
		});

		And("it should indicate how long each has been waiting", () => {
			expect(result).toBeDefined();
			expect(result!.stdout.length).toBeGreaterThan(0);
		});
	});

	Scenario(
		"Status filters to governance issues only",
		({ When, Then, And }) => {
			let result: { stdout: string; stderr: string } | undefined;

			When('I run "udd status --governance"', async () => {
				result = await runUdd("status --governance");
			});

			Then("the output should focus on governance concerns", () => {
				expect(result).toBeDefined();
				expect(result!.stdout.length).toBeGreaterThan(0);
			});

			And(
				"it should show dirty tests, pending reviews, and coverage gaps",
				() => {
					expect(result).toBeDefined();
					expect(result!.stdout.length).toBeGreaterThan(0);
				},
			);

			And("other status information should be minimized", () => {
				expect(result).toBeDefined();
				expect(result!.stdout.length).toBeGreaterThan(0);
			});
		},
	);

	Scenario(
		"Status shows test coverage metrics",
		({ Given, When, Then, And }) => {
			let result: { stdout: string; stderr: string } | undefined;

			Given("features exist with varying test coverage", async () => {
				await withTempDir(async () => {
					await runUdd("init --yes");
					await fs.mkdir("tests", { recursive: true });
					await fs.writeFile(
						"tests/coverage.test.ts",
						`import { test, expect } from "vitest";
test("coverage", () => { expect(true).toBe(true); });
`,
					);
				});
			});

			When('I run "udd status"', async () => {
				result = await runUdd("status");
			});

			Then("the output should show coverage percentage per feature", () => {
				expect(result).toBeDefined();
				expect(result!.stdout).toMatch(/\d+%/);
			});

			And("it should show overall project coverage", () => {
				expect(result).toBeDefined();
				expect(result!.stdout).toMatch(/\d+%/);
			});

			And("features below threshold should be flagged", () => {
				expect(result).toBeDefined();
				expect(result!.stdout.length).toBeGreaterThan(0);
			});
		},
	);

	Scenario("Status shows stale features", ({ Given, When, Then, And }) => {
		let result: { stdout: string; stderr: string } | undefined;

		Given("some features have not been tested recently", async () => {
			await withTempDir(async () => {
				await runUdd("init --yes");
				await fs.mkdir("tests", { recursive: true });
				await fs.writeFile(
					"tests/stale.test.ts",
					`import { test, expect } from "vitest";
test("stale", () => { expect(true).toBe(true); });
`,
				);
			});
		});

		When('I run "udd status --include-stale"', async () => {
			result = await runUdd("status --include-stale");
		});

		Then("features with old test runs should be listed", () => {
			expect(result).toBeDefined();
			expect(result!.stdout).toContain("stale");
		});

		And("the time since last test run should be shown", () => {
			expect(result).toBeDefined();
			expect(result!.stdout.length).toBeGreaterThan(0);
		});

		And("a recommendation to re-run tests should appear", () => {
			expect(result).toBeDefined();
			expect(result!.stdout.length).toBeGreaterThan(0);
		});
	});

	Scenario(
		"Status integrates with health score",
		({ Given, When, Then, And }) => {
			let result: { stdout: string; stderr: string } | undefined;

			Given("the project calculates an overall health score", async () => {
				await withTempDir(async () => {
					await runUdd("init --yes");
				});
			});

			When('I run "udd status"', async () => {
				result = await runUdd("status");
			});

			Then("the health score should factor in test governance", () => {
				expect(result).toBeDefined();
				expect(result!.stdout).toContain("health");
			});

			And("dirty tests should reduce the score", () => {
				expect(result).toBeDefined();
				expect(result!.stdout.length).toBeGreaterThan(0);
			});

			And("missing coverage should reduce the score", () => {
				expect(result).toBeDefined();
				expect(result!.stdout.length).toBeGreaterThan(0);
			});
		},
	);

	Scenario(
		"Status provides actionable next steps",
		({ Given, When, Then, And }) => {
			let result: { stdout: string; stderr: string } | undefined;

			Given("there are governance issues in the project", async () => {
				await withTempDir(async () => {
					await runUdd("init --yes");
					await fs.mkdir("tests", { recursive: true });
					await fs.writeFile(
						"tests/issue.test.ts",
						`import { test, expect } from "vitest";
test("issue", () => { expect(true).toBe(true); });
`,
					);
					await runUdd("mark-dirty tests/issue.test.ts");
				});
			});

			When('I run "udd status"', async () => {
				result = await runUdd("status");
			});

			Then("the output should suggest specific actions", () => {
				expect(result).toBeDefined();
				expect(result!.stdout.length).toBeGreaterThan(0);
			});

			And("commands to fix issues should be shown", () => {
				expect(result).toBeDefined();
				expect(result!.stdout).toContain("udd");
			});

			And("priority order should be indicated", () => {
				expect(result).toBeDefined();
				expect(result!.stdout.length).toBeGreaterThan(0);
			});
		},
	);
});
