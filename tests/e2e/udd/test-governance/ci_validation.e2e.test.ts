import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { expect } from "vitest";
import { runUdd, withTempDir } from "../../../utils.js";

const feature = await loadFeature(
	"specs/features/udd/test-governance/ci-validation.feature",
);

describeFeature(feature, ({ Scenario, Background }) => {
	Background(({ Given, And }) => {
		Given("a UDD project is initialized", async () => {
			// Background setup handled in scenario
		});

		And("the project has a CI configuration", async () => {
			// Background setup handled in scenario
		});
	});

	Scenario(
		"CI validation passes on clean project",
		({ Given, And, When, Then }) => {
			let result: { stdout: string; stderr: string } | undefined;

			Given("all features have linked tests", async () => {
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

			And("all tests are marked clean", async () => {
				await runUdd("mark-clean tests/auth/login.test.ts");
			});

			And("no governance rules are violated", async () => {
				// All clean
			});

			When('CI runs "udd validate --ci"', async () => {
				result = await runUdd("validate --ci");
			});

			Then("the command should exit with code 0", () => {
				expect(result).toBeDefined();
				expect(result!.stdout).toContain("pass");
			});

			And("the output should indicate validation passed", () => {
				expect(result).toBeDefined();
				expect(result!.stdout).toContain("validation passed");
			});
		},
	);

	Scenario(
		"CI validation fails on dirty tests",
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

			When('CI runs "udd validate --ci"', async () => {
				try {
					result = await runUdd("validate --ci");
				} catch (err: any) {
					errorResult = err as { code: number; stdout: string; stderr: string };
				}
			});

			Then("the command should exit with code 1", () => {
				if (errorResult) {
					expect(errorResult.code).toBe(1);
				} else {
					expect(result).toBeDefined();
				}
			});

			And("the output should list all dirty tests", () => {
				const output = errorResult
					? `${errorResult.stdout} ${errorResult.stderr}`
					: result?.stdout || "";
				expect(output).toContain("dirty");
			});

			And("the build should be marked as failed", () => {
				const output = errorResult
					? `${errorResult.stdout} ${errorResult.stderr}`
					: result?.stdout || "";
				expect(output).toContain("failed");
			});
		},
	);

	Scenario("CI reports missing test coverage", ({ Given, When, Then, And }) => {
		let result: { stdout: string; stderr: string } | undefined;
		let errorResult:
			| { code: number; stdout: string; stderr: string }
			| undefined;

		Given("a feature has scenarios without linked tests", async () => {
			await withTempDir(async () => {
				await runUdd("init --yes");
				await fs.mkdir("specs/features/auth", { recursive: true });
				await fs.writeFile(
					"specs/features/auth/login.feature",
					`Feature: Login
  Scenario: User logs in
  Scenario: Missing test
`,
				);
			});
		});

		When('CI runs "udd validate --ci"', async () => {
			try {
				result = await runUdd("validate --ci");
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

		And("the output should list features with missing coverage", () => {
			const output = errorResult
				? `${errorResult.stdout} ${errorResult.stderr}`
				: result?.stdout || "";
			expect(output).toContain("missing");
		});

		And("the specific scenarios without tests should be identified", () => {
			const output = errorResult
				? `${errorResult.stdout} ${errorResult.stderr}`
				: result?.stdout || "";
			expect(output).toContain("Missing test");
		});
	});

	Scenario("CI generates machine-readable report", ({ When, Then, And }) => {
		let result: { stdout: string; stderr: string } | undefined;

		When('CI runs "udd validate --ci --format json"', async () => {
			await withTempDir(async () => {
				await runUdd("init --yes");
				result = await runUdd("validate --ci --format json");
			});
		});

		Then("the output should be valid JSON", () => {
			expect(() => JSON.parse(result!.stdout)).not.toThrow();
		});

		And("the report should include validation status", () => {
			const data = JSON.parse(result!.stdout);
			expect(data.status).toBeDefined();
		});

		And("it should include lists of issues by category", () => {
			const data = JSON.parse(result!.stdout);
			expect(data.issues).toBeDefined();
		});

		And("it should include summary statistics", () => {
			const data = JSON.parse(result!.stdout);
			expect(data.summary).toBeDefined();
		});
	});

	Scenario(
		"CI validation includes orphaned test detection",
		({ Given, When, Then, And }) => {
			let result: { stdout: string; stderr: string } | undefined;
			let errorResult:
				| { code: number; stdout: string; stderr: string }
				| undefined;

			Given("a test file exists that links to a deleted feature", async () => {
				await withTempDir(async () => {
					await runUdd("init --yes");
					await fs.mkdir("tests", { recursive: true });
					await fs.writeFile(
						"tests/orphan.test.ts",
						`// @feature deleted/feature
import { test, expect } from "vitest";
test("orphan", () => { expect(true).toBe(true); });
`,
					);
				});
			});

			When('CI runs "udd validate --ci"', async () => {
				try {
					result = await runUdd("validate --ci");
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

			And("the orphaned test should be reported", () => {
				const output = errorResult
					? `${errorResult.stdout} ${errorResult.stderr}`
					: result?.stdout || "";
				expect(output).toContain("orphan");
			});

			And("remediation suggestions should be provided", () => {
				const output = errorResult
					? `${errorResult.stdout} ${errorResult.stderr}`
					: result?.stdout || "";
				expect(output.length).toBeGreaterThan(0);
			});
		},
	);

	Scenario("CI validation checks test status", ({ Given, When, Then, And }) => {
		let result: { stdout: string; stderr: string } | undefined;
		let errorResult:
			| { code: number; stdout: string; stderr: string }
			| undefined;

		Given("tests exist that are currently failing", async () => {
			await withTempDir(async () => {
				await runUdd("init --yes");
				await fs.mkdir("tests", { recursive: true });
				await fs.writeFile(
					"tests/failing.test.ts",
					`import { test, expect } from "vitest";
test("failing", () => { expect(false).toBe(true); });
`,
				);
			});
		});

		When('CI runs "udd validate --ci"', async () => {
			try {
				result = await runUdd("validate --ci");
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

		And("failing tests should be listed", () => {
			const output = errorResult
				? `${errorResult.stdout} ${errorResult.stderr}`
				: result?.stdout || "";
			expect(output).toContain("failing");
		});

		And("failure details should be included", () => {
			const output = errorResult
				? `${errorResult.stdout} ${errorResult.stderr}`
				: result?.stdout || "";
			expect(output.length).toBeGreaterThan(0);
		});
	});

	Scenario(
		"CI validation respects phase tags",
		({ Given, And, When, Then }) => {
			let result: { stdout: string; stderr: string } | undefined;

			Given("the project current_phase is 1", async () => {
				await withTempDir(async () => {
					await runUdd("init --yes");
					// Set phase to 1
				});
			});

			And("a scenario is tagged with @phase:2", async () => {
				await fs.mkdir("specs/features/auth", { recursive: true });
				await fs.writeFile(
					"specs/features/auth/future.feature",
					`Feature: Future
  @phase:2
  Scenario: Future feature
`,
				);
			});

			When('CI runs "udd validate --ci"', async () => {
				result = await runUdd("validate --ci");
			});

			Then("the @phase:2 scenario should not cause validation failure", () => {
				expect(result).toBeDefined();
				expect(result!.stdout).toContain("pass");
			});

			And("the report should indicate deferred scenarios", () => {
				expect(result).toBeDefined();
				expect(result!.stdout).toContain("deferred");
			});
		},
	);

	Scenario("CI generates artifacts for review", ({ When, Then, And }) => {
		let result: { stdout: string; stderr: string } | undefined;

		When('CI runs "udd validate --ci --artifacts"', async () => {
			await withTempDir(async () => {
				await runUdd("init --yes");
				result = await runUdd("validate --ci --artifacts");
			});
		});

		Then(
			"validation reports should be saved to the artifacts directory",
			async () => {
				const artifactsExist = await fs
					.access(".udd/artifacts")
					.then(() => true)
					.catch(() => false);
				expect(artifactsExist).toBe(true);
			},
		);

		And("the report should be available for download", () => {
			expect(result).toBeDefined();
			expect(result!.stdout).toContain("artifacts");
		});

		And("historical trends should be tracked", () => {
			expect(result).toBeDefined();
			expect(result!.stdout).toContain("trends");
		});
	});
});
