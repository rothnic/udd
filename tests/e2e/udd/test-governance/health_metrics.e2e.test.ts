import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { expect } from "vitest";
import { runUdd, withTempDir } from "../../../utils.js";

const feature = await loadFeature(
	"specs/features/udd/test-governance/health-metrics.feature",
);

describeFeature(feature, ({ Scenario, Background }) => {
	Background(({ Given, And }) => {
		Given("a UDD project is initialized", async () => {
			// Background setup handled in scenario
		});

		And("test data exists for metric calculation", async () => {
			// Background setup handled in scenario
		});
	});

	Scenario(
		"Calculate test coverage percentage",
		({ Given, And, When, Then }) => {
			let result: { stdout: string; stderr: string } | undefined;

			Given("10 features have scenarios defined", async () => {
				await withTempDir(async () => {
					await runUdd("init --yes");
					await fs.mkdir("specs/features", { recursive: true });
					for (let i = 1; i <= 10; i++) {
						await fs.writeFile(
							`specs/features/feature${i}.feature`,
							`Feature: Feature ${i}
  Scenario: Scenario ${i}
`,
						);
					}
				});
			});

			And("8 features have linked tests", async () => {
				await withTempDir(async () => {
					await fs.mkdir("tests", { recursive: true });
					for (let i = 1; i <= 8; i++) {
						await fs.writeFile(
							`tests/feature${i}.test.ts`,
							`import { test, expect } from "vitest";
test("feature ${i}", () => { expect(true).toBe(true); });
`,
						);
					}
				});
			});

			When('I run "udd metrics coverage"', async () => {
				result = await runUdd("metrics coverage");
			});

			Then("the coverage percentage should be 80%", () => {
				expect(result).toBeDefined();
				expect(result!.stdout).toContain("80");
			});

			And("the metric should be displayed with precision to 1 decimal", () => {
				expect(result).toBeDefined();
				expect(result!.stdout).toMatch(/\d+\.\d%/);
			});
		},
	);

	Scenario("Calculate dirty test ratio", ({ Given, And, When, Then }) => {
		let result: { stdout: string; stderr: string } | undefined;

		Given("50 tests exist in the project", async () => {
			await withTempDir(async () => {
				await runUdd("init --yes");
				await fs.mkdir("tests", { recursive: true });
				for (let i = 1; i <= 50; i++) {
					await fs.writeFile(
						`tests/test${i}.test.ts`,
						`import { test, expect } from "vitest";
test("test ${i}", () => { expect(true).toBe(true); });
`,
					);
				}
			});
		});

		And("5 tests are marked dirty", async () => {
			for (let i = 1; i <= 5; i++) {
				await runUdd(`mark-dirty tests/test${i}.test.ts`);
			}
		});

		When('I run "udd metrics dirty-ratio"', async () => {
			result = await runUdd("metrics dirty-ratio");
		});

		Then("the dirty ratio should be 10%", () => {
			expect(result).toBeDefined();
			expect(result!.stdout).toContain("10");
		});

		And("the output should show both count and percentage", () => {
			expect(result).toBeDefined();
			expect(result!.stdout).toMatch(/5.*50/);
			expect(result!.stdout).toMatch(/10%/);
		});
	});

	Scenario(
		"Calculate average review wait time",
		({ Given, When, Then, And }) => {
			let result: { stdout: string; stderr: string } | undefined;

			Given("tests exist with various review wait times", async () => {
				await withTempDir(async () => {
					await runUdd("init --yes");
					await fs.mkdir("tests", { recursive: true });
					await fs.writeFile(
						"tests/test1.test.ts",
						`import { test, expect } from "vitest";
test("test1", () => { expect(true).toBe(true); });
`,
					);
					await runUdd("review-request tests/test1.test.ts");
				});
			});

			When('I run "udd metrics review-wait-time"', async () => {
				result = await runUdd("metrics review-wait-time");
			});

			Then("the average wait time should be calculated", () => {
				expect(result).toBeDefined();
				expect(result!.stdout.length).toBeGreaterThan(0);
			});

			And("the median wait time should also be shown", () => {
				expect(result).toBeDefined();
				expect(result!.stdout).toContain("median");
			});

			And("the calculation should exclude already-approved tests", () => {
				expect(result).toBeDefined();
				expect(result!.stdout.length).toBeGreaterThan(0);
			});
		},
	);

	Scenario("Calculate test flakiness score", ({ Given, When, Then, And }) => {
		let result: { stdout: string; stderr: string } | undefined;

		Given("tests have run history with pass/fail data", async () => {
			await withTempDir(async () => {
				await runUdd("init --yes");
				await fs.mkdir("tests", { recursive: true });
				await fs.writeFile(
					"tests/flaky.test.ts",
					`import { test, expect } from "vitest";
test("flaky", () => { expect(true).toBe(true); });
`,
				);
			});
		});

		When('I run "udd metrics flakiness"', async () => {
			result = await runUdd("metrics flakiness");
		});

		Then("each test should have a flakiness score", () => {
			expect(result).toBeDefined();
			expect(result!.stdout.length).toBeGreaterThan(0);
		});

		And("flaky tests (inconsistent results) should be identified", () => {
			expect(result).toBeDefined();
			expect(result!.stdout).toContain("flaky");
		});

		And("the score should range from 0 (stable) to 100 (unreliable)", () => {
			expect(result).toBeDefined();
			expect(result!.stdout).toMatch(/\d+/);
		});
	});

	Scenario(
		"Calculate test execution time trends",
		({ Given, When, Then, And }) => {
			let result: { stdout: string; stderr: string } | undefined;

			Given("tests have execution time history", async () => {
				await withTempDir(async () => {
					await runUdd("init --yes");
					await fs.mkdir("tests", { recursive: true });
					await fs.writeFile(
						"tests/slow.test.ts",
						`import { test, expect } from "vitest";
test("slow", () => { expect(true).toBe(true); });
`,
					);
				});
			});

			When('I run "udd metrics execution-time"', async () => {
				result = await runUdd("metrics execution-time");
			});

			Then("average execution time should be shown", () => {
				expect(result).toBeDefined();
				expect(result!.stdout).toContain("average");
			});

			And("trends (improving/degrading) should be indicated", () => {
				expect(result).toBeDefined();
				expect(result!.stdout.length).toBeGreaterThan(0);
			});

			And("outliers (sudden spikes) should be flagged", () => {
				expect(result).toBeDefined();
				expect(result!.stdout).toContain("outlier");
			});
		},
	);

	Scenario("View all metrics summary", ({ When, Then, And }) => {
		let result: { stdout: string; stderr: string } | undefined;

		When('I run "udd metrics"', async () => {
			result = await runUdd("metrics");
		});

		Then("a summary of all metrics should be displayed", () => {
			expect(result).toBeDefined();
			expect(result!.stdout.length).toBeGreaterThan(0);
		});

		And("each metric should have its current value", () => {
			expect(result).toBeDefined();
			expect(result!.stdout.length).toBeGreaterThan(0);
		});

		And("trends should be shown where applicable", () => {
			expect(result).toBeDefined();
			expect(result!.stdout.length).toBeGreaterThan(0);
		});

		And("threshold violations should be highlighted", () => {
			expect(result).toBeDefined();
			expect(result!.stdout.length).toBeGreaterThan(0);
		});
	});

	Scenario(
		"Metrics respect date range filter",
		({ Given, When, Then, And }) => {
			let result: { stdout: string; stderr: string } | undefined;

			Given("historical metric data exists", async () => {
				await withTempDir(async () => {
					await runUdd("init --yes");
				});
			});

			When(
				'I run "udd metrics --since 2024-01-01 --until 2024-02-01"',
				async () => {
					result = await runUdd(
						"metrics --since 2024-01-01 --until 2024-02-01",
					);
				},
			);

			Then("only data within the date range should be considered", () => {
				expect(result).toBeDefined();
				expect(result!.stdout.length).toBeGreaterThan(0);
			});

			And("the metrics should reflect the filtered period", () => {
				expect(result).toBeDefined();
				expect(result!.stdout.length).toBeGreaterThan(0);
			});
		},
	);

	Scenario("Export metrics to file", ({ When, Then, And }) => {
		let result: { stdout: string; stderr: string } | undefined;
		let exportedData: string | undefined;

		When('I run "udd metrics --export metrics.json"', async () => {
			await withTempDir(async () => {
				await runUdd("init --yes");
				result = await runUdd("metrics --export metrics.json");
				exportedData = await fs.readFile("metrics.json", "utf-8");
			});
		});

		Then('metrics should be saved to "metrics.json"', () => {
			expect(exportedData).toBeDefined();
			expect(exportedData!.length).toBeGreaterThan(0);
		});

		And("the file should be in JSON format", () => {
			expect(() => JSON.parse(exportedData!)).not.toThrow();
		});

		And("it should include timestamp and all calculated values", () => {
			const data = JSON.parse(exportedData!);
			expect(data).toBeDefined();
			expect(data.timestamp).toBeDefined();
		});
	});

	Scenario("Compare metrics between periods", ({ Given, When, Then, And }) => {
		let result: { stdout: string; stderr: string } | undefined;

		Given("historical data exists for multiple periods", async () => {
			await withTempDir(async () => {
				await runUdd("init --yes");
			});
		});

		When('I run "udd metrics --compare --periods 4"', async () => {
			result = await runUdd("metrics --compare --periods 4");
		});

		Then("metrics for the last 4 periods should be compared", () => {
			expect(result).toBeDefined();
			expect(result!.stdout).toContain("4");
		});

		And("trends should be calculated and displayed", () => {
			expect(result).toBeDefined();
			expect(result!.stdout.length).toBeGreaterThan(0);
		});

		And("significant changes should be highlighted", () => {
			expect(result).toBeDefined();
			expect(result!.stdout.length).toBeGreaterThan(0);
		});
	});
});
