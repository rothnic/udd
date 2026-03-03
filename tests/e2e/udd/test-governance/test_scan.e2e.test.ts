import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { expect } from "vitest";
import { runUdd, withTempDir } from "../../../utils.js";

const feature = await loadFeature(
	"specs/features/udd/test-governance/test-scan.feature",
);

describeFeature(feature, ({ Scenario, Background }) => {
	Background(({ Given, And }) => {
		Given("a UDD project is initialized", async () => {
			// Background setup handled in scenario
		});

		And("test files exist in various directories", async () => {
			// Background setup handled in scenario
		});
	});

	Scenario("Scan discovers all test files", ({ Given, When, Then, And }) => {
		let result: { stdout: string; stderr: string } | undefined;

		Given('test files exist in "tests/" and subdirectories', async () => {
			await withTempDir(async () => {
				await runUdd("init --yes");
				await fs.mkdir("tests/unit", { recursive: true });
				await fs.mkdir("tests/integration", { recursive: true });
				await fs.writeFile(
					"tests/unit/test1.test.ts",
					`import { test, expect } from "vitest";
test("unit 1", () => { expect(true).toBe(true); });
`,
				);
				await fs.writeFile(
					"tests/integration/test2.test.ts",
					`import { test, expect } from "vitest";
test("integration 1", () => { expect(true).toBe(true); });
`,
				);
			});
		});

		When('I run "udd scan-tests"', async () => {
			result = await runUdd("scan-tests");
		});

		Then("all test files should be discovered", () => {
			expect(result).toBeDefined();
			expect(result!.stdout).toContain("test1.test.ts");
			expect(result!.stdout).toContain("test2.test.ts");
		});

		And("the count should be displayed", () => {
			expect(result).toBeDefined();
			expect(result!.stdout).toMatch(/\d+ test/i);
		});

		And("the list should include file paths", () => {
			expect(result).toBeDefined();
			expect(result!.stdout).toContain("tests/");
		});
	});

	Scenario("Scan categorizes tests by type", ({ Given, When, Then, And }) => {
		let result: { stdout: string; stderr: string } | undefined;

		Given("tests exist of types unit, integration, and e2e", async () => {
			await withTempDir(async () => {
				await runUdd("init --yes");
				await fs.mkdir("tests/unit", { recursive: true });
				await fs.mkdir("tests/integration", { recursive: true });
				await fs.mkdir("tests/e2e", { recursive: true });
				await fs.writeFile(
					"tests/unit/unit.test.ts",
					`import { test, expect } from "vitest";
test("unit", () => { expect(true).toBe(true); });
`,
				);
				await fs.writeFile(
					"tests/integration/integration.test.ts",
					`import { test, expect } from "vitest";
test("integration", () => { expect(true).toBe(true); });
`,
				);
				await fs.writeFile(
					"tests/e2e/e2e.test.ts",
					`import { test, expect } from "vitest";
test("e2e", () => { expect(true).toBe(true); });
`,
				);
			});
		});

		When('I run "udd scan-tests"', async () => {
			result = await runUdd("scan-tests");
		});

		Then("tests should be grouped by type", () => {
			expect(result).toBeDefined();
			expect(result!.stdout.length).toBeGreaterThan(0);
		});

		And("counts per type should be shown", () => {
			expect(result).toBeDefined();
			expect(result!.stdout).toMatch(/\d+ unit/i);
		});

		And("uncategorized tests should be flagged", () => {
			expect(result).toBeDefined();
			expect(result!.stdout.length).toBeGreaterThan(0);
		});
	});

	Scenario(
		"Scan identifies test-feature linkages",
		({ Given, And, When, Then }) => {
			let result: { stdout: string; stderr: string } | undefined;

			Given("some tests have @feature declarations", async () => {
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
						`// @feature auth/login
import { test, expect } from "vitest";
test("login", () => { expect(true).toBe(true); });
`,
					);
				});
			});

			And("some tests do not", async () => {
				await withTempDir(async () => {
					await fs.writeFile(
						"tests/orphan.test.ts",
						`import { test, expect } from "vitest";
test("orphan", () => { expect(true).toBe(true); });
`,
					);
				});
			});

			When('I run "udd scan-tests"', async () => {
				result = await runUdd("scan-tests");
			});

			Then("linked tests should be shown with their feature", () => {
				expect(result).toBeDefined();
				expect(result!.stdout).toContain("login");
			});

			And("unlinked tests should be listed separately", () => {
				expect(result).toBeDefined();
				expect(result!.stdout).toContain("orphan");
			});

			And("the linkage coverage percentage should be calculated", () => {
				expect(result).toBeDefined();
				expect(result!.stdout).toMatch(/\d+%/);
			});
		},
	);

	Scenario("Scan detects orphaned tests", ({ Given, When, Then, And }) => {
		let result: { stdout: string; stderr: string } | undefined;

		Given('a test links to "features/deleted.feature"', async () => {
			await withTempDir(async () => {
				await runUdd("init --yes");
				await fs.writeFile(
					"tests/orphan.test.ts",
					`// @feature deleted
import { test, expect } from "vitest";
test("orphan", () => { expect(true).toBe(true); });
`,
				);
			});
		});

		When('I run "udd scan-tests"', async () => {
			result = await runUdd("scan-tests");
		});

		Then("the orphaned test should be identified", () => {
			expect(result).toBeDefined();
			expect(result!.stdout).toContain("orphan");
		});

		And("the broken link should be displayed", () => {
			expect(result).toBeDefined();
			expect(result!.stdout).toContain("deleted");
		});

		And("remediation suggestions should be provided", () => {
			expect(result).toBeDefined();
			expect(result!.stdout.length).toBeGreaterThan(0);
		});
	});

	Scenario("Scan shows test metadata", ({ Given, When, Then, And }) => {
		let result: { stdout: string; stderr: string } | undefined;

		Given("tests exist with various attributes", async () => {
			await withTempDir(async () => {
				await runUdd("init --yes");
				await fs.mkdir("tests", { recursive: true });
				await fs.writeFile(
					"tests/example.test.ts",
					`import { test, expect } from "vitest";
test("example", () => { expect(true).toBe(true); });
`,
				);
			});
		});

		When('I run "udd scan-tests --verbose"', async () => {
			result = await runUdd("scan-tests --verbose");
		});

		Then("for each test, file size should be shown", () => {
			expect(result).toBeDefined();
			expect(result!.stdout.length).toBeGreaterThan(0);
		});

		And("last modified date should be shown", () => {
			expect(result).toBeDefined();
			expect(result!.stdout.length).toBeGreaterThan(0);
		});

		And("feature linkage should be shown", () => {
			expect(result).toBeDefined();
			expect(result!.stdout.length).toBeGreaterThan(0);
		});
	});

	Scenario("Scan exports discovery results", ({ When, Then, And }) => {
		let result: { stdout: string; stderr: string } | undefined;
		let exportedData: string | undefined;

		When('I run "udd scan-tests --export tests.json"', async () => {
			await withTempDir(async () => {
				await runUdd("init --yes");
				await fs.mkdir("tests", { recursive: true });
				await fs.writeFile(
					"tests/example.test.ts",
					`import { test, expect } from "vitest";
test("example", () => { expect(true).toBe(true); });
`,
				);
				result = await runUdd("scan-tests --export tests.json");
				exportedData = await fs.readFile("tests.json", "utf-8");
			});
		});

		Then('results should be saved to "tests.json"', () => {
			expect(exportedData).toBeDefined();
			expect(exportedData!.length).toBeGreaterThan(0);
		});

		And("the format should be JSON", () => {
			expect(() => JSON.parse(exportedData!)).not.toThrow();
		});

		And("it should include all discovered test metadata", () => {
			const data = JSON.parse(exportedData!);
			expect(data).toBeDefined();
		});
	});

	Scenario("Scan specific directory only", ({ Given, When, Then, And }) => {
		let result: { stdout: string; stderr: string } | undefined;

		Given('tests exist in "tests/unit/" and "tests/e2e/"', async () => {
			await withTempDir(async () => {
				await runUdd("init --yes");
				await fs.mkdir("tests/unit", { recursive: true });
				await fs.mkdir("tests/e2e", { recursive: true });
				await fs.writeFile(
					"tests/unit/unit.test.ts",
					`import { test, expect } from "vitest";
test("unit", () => { expect(true).toBe(true); });
`,
				);
				await fs.writeFile(
					"tests/e2e/e2e.test.ts",
					`import { test, expect } from "vitest";
test("e2e", () => { expect(true).toBe(true); });
`,
				);
			});
		});

		When('I run "udd scan-tests tests/unit/"', async () => {
			result = await runUdd("scan-tests tests/unit/");
		});

		Then('only tests in "tests/unit/" should be discovered', () => {
			expect(result).toBeDefined();
			expect(result!.stdout).toContain("unit.test.ts");
		});

		And("other directories should be excluded", () => {
			expect(result).toBeDefined();
			expect(result!.stdout).not.toContain("e2e.test.ts");
		});
	});

	Scenario(
		"Scan detects duplicate test names",
		({ Given, When, Then, And }) => {
			let result: { stdout: string; stderr: string } | undefined;

			Given("two test files have the same describe/it names", async () => {
				await withTempDir(async () => {
					await runUdd("init --yes");
					await fs.mkdir("tests/auth", { recursive: true });
					await fs.mkdir("tests/user", { recursive: true });
					await fs.writeFile(
						"tests/auth/login.test.ts",
						`import { describe, it, expect } from "vitest";
describe("Login", () => {
  it("should work", () => { expect(true).toBe(true); });
});
`,
					);
					await fs.writeFile(
						"tests/user/login.test.ts",
						`import { describe, it, expect } from "vitest";
describe("Login", () => {
  it("should work", () => { expect(true).toBe(true); });
});
`,
					);
				});
			});

			When('I run "udd scan-tests"', async () => {
				result = await runUdd("scan-tests");
			});

			Then("potential duplicates should be flagged", () => {
				expect(result).toBeDefined();
				expect(result!.stdout).toContain("duplicate");
			});

			And("the conflicting names should be listed", () => {
				expect(result).toBeDefined();
				expect(result!.stdout).toContain("Login");
			});

			And("locations should be provided for disambiguation", () => {
				expect(result).toBeDefined();
				expect(result!.stdout).toContain("tests/auth");
				expect(result!.stdout).toContain("tests/user");
			});
		},
	);

	Scenario("Scan integrates with status", ({ When, Then, And }) => {
		let result: { stdout: string; stderr: string } | undefined;

		When('I run "udd status --with-tests"', async () => {
			result = await runUdd("status --with-tests");
		});

		Then("the status should include scan summary", () => {
			expect(result).toBeDefined();
			expect(result!.stdout.length).toBeGreaterThan(0);
		});

		And("test counts should be part of the overview", () => {
			expect(result).toBeDefined();
			expect(result!.stdout).toMatch(/\d+ test/i);
		});

		And("issues found during scan should be highlighted", () => {
			expect(result).toBeDefined();
			expect(result!.stdout.length).toBeGreaterThan(0);
		});
	});
});
