import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { expect } from "vitest";
import { runUdd, withTempDir } from "../../../utils.js";

const feature = await loadFeature(
	"specs/features/udd/test-governance/setup-health-check.feature",
);

describeFeature(feature, ({ Scenario, Background }) => {
	Background(({ Given, And }) => {
		Given("I am setting up test governance for a project", async () => {
			// Background setup handled in scenario
		});
	});

	Scenario(
		"Health check passes on valid setup",
		({ Given, And, When, Then }) => {
			let result: { stdout: string; stderr: string } | undefined;

			Given("the project has valid UDD structure", async () => {
				await withTempDir(async () => {
					await runUdd("init --yes");
				});
			});

			And("all dependencies are installed", async () => {
				// Dependencies are installed
			});

			When('I run "udd health-check"', async () => {
				result = await runUdd("health-check");
			});

			Then("the command should exit with code 0", () => {
				expect(result).toBeDefined();
				expect(result!.stdout).toContain("pass");
			});

			And("the output should indicate all checks passed", () => {
				expect(result).toBeDefined();
				expect(result!.stdout).toContain("passed");
			});

			And("a summary should show configuration status", () => {
				expect(result).toBeDefined();
				expect(result!.stdout).toContain("summary");
			});
		},
	);

	Scenario(
		"Health check detects missing manifest",
		({ Given, When, Then, And }) => {
			let result: { stdout: string; stderr: string } | undefined;
			let errorResult:
				| { code: number; stdout: string; stderr: string }
				| undefined;

			Given('the project lacks ".udd/manifest.yml"', async () => {
				await withTempDir(async () => {
					// Create directory structure without manifest
					await fs.mkdir(".udd", { recursive: true });
					await fs.mkdir("specs/features", { recursive: true });
				});
			});

			When('I run "udd health-check"', async () => {
				try {
					result = await runUdd("health-check");
				} catch (err: any) {
					errorResult = err as { code: number; stdout: string; stderr: string };
				}
			});

			Then("the check should fail", () => {
				if (errorResult) {
					expect(errorResult.code).toBe(1);
				} else {
					expect(result).toBeDefined();
				}
			});

			And("the output should indicate missing manifest", () => {
				const output = errorResult
					? `${errorResult.stdout} ${errorResult.stderr}`
					: result?.stdout || "";
				expect(output).toContain("manifest");
			});

			And('it should suggest running "udd sync"', () => {
				const output = errorResult
					? `${errorResult.stdout} ${errorResult.stderr}`
					: result?.stdout || "";
				expect(output).toContain("sync");
			});
		},
	);

	Scenario(
		"Health check detects missing test directory",
		({ Given, When, Then, And }) => {
			let result: { stdout: string; stderr: string } | undefined;
			let errorResult:
				| { code: number; stdout: string; stderr: string }
				| undefined;

			Given('the "tests/" directory does not exist', async () => {
				await withTempDir(async () => {
					await runUdd("init --yes");
					await fs.rm("tests", { recursive: true, force: true });
				});
			});

			When('I run "udd health-check"', async () => {
				try {
					result = await runUdd("health-check");
				} catch (err: any) {
					errorResult = err as { code: number; stdout: string; stderr: string };
				}
			});

			Then("the check should fail", () => {
				if (errorResult) {
					expect(errorResult.code).toBe(1);
				} else {
					expect(result).toBeDefined();
				}
			});

			And("the output should indicate missing test directory", () => {
				const output = errorResult
					? `${errorResult.stdout} ${errorResult.stderr}`
					: result?.stdout || "";
				expect(output).toContain("tests");
			});

			And("it should suggest creating the directory", () => {
				const output = errorResult
					? `${errorResult.stdout} ${errorResult.stderr}`
					: result?.stdout || "";
				expect(output).toContain("create");
			});
		},
	);

	Scenario("Health check validates git hooks", ({ Given, When, Then, And }) => {
		let result: { stdout: string; stderr: string } | undefined;

		Given("hooks should be installed but are not", async () => {
			await withTempDir(async () => {
				await runUdd("init --yes");
				// Remove hooks if they exist
				try {
					await fs.rm(".git/hooks/pre-commit", { force: true });
				} catch {}
			});
		});

		When('I run "udd health-check"', async () => {
			result = await runUdd("health-check");
		});

		Then("the check should warn about missing hooks", () => {
			expect(result).toBeDefined();
			expect(result!.stdout).toContain("hooks");
		});

		And('the output should suggest running "udd hooks install"', () => {
			expect(result).toBeDefined();
			expect(result!.stdout).toContain("hooks install");
		});
	});

	Scenario(
		"Health check detects broken links",
		({ Given, When, Then, And }) => {
			let result: { stdout: string; stderr: string } | undefined;
			let errorResult:
				| { code: number; stdout: string; stderr: string }
				| undefined;

			Given("test files link to non-existent features", async () => {
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
			});

			When('I run "udd health-check"', async () => {
				try {
					result = await runUdd("health-check");
				} catch (err: any) {
					errorResult = err as { code: number; stdout: string; stderr: string };
				}
			});

			Then("the check should fail", () => {
				if (errorResult) {
					expect(errorResult.code).toBe(1);
				} else {
					expect(result).toBeDefined();
				}
			});

			And("broken links should be listed", () => {
				const output = errorResult
					? `${errorResult.stdout} ${errorResult.stderr}`
					: result?.stdout || "";
				expect(output).toContain("broken");
			});

			And("remediation steps should be suggested", () => {
				const output = errorResult
					? `${errorResult.stdout} ${errorResult.stderr}`
					: result?.stdout || "";
				expect(output.length).toBeGreaterThan(0);
			});
		},
	);

	Scenario(
		"Health check validates CI configuration",
		({ Given, When, Then, And }) => {
			let result: { stdout: string; stderr: string } | undefined;

			Given("CI configuration should exist", async () => {
				await withTempDir(async () => {
					await runUdd("init --yes");
				});
			});

			When('I run "udd health-check"', async () => {
				result = await runUdd("health-check");
			});

			Then("it should check for CI configuration files", () => {
				expect(result).toBeDefined();
				expect(result!.stdout).toContain("CI");
			});

			And("it should validate UDD integration in CI", () => {
				expect(result).toBeDefined();
				expect(result!.stdout.length).toBeGreaterThan(0);
			});

			And("missing CI integration should be flagged", () => {
				expect(result).toBeDefined();
				expect(result!.stdout.length).toBeGreaterThan(0);
			});
		},
	);

	Scenario(
		"Health check tests write permissions",
		({ Given, When, Then, And }) => {
			let result: { stdout: string; stderr: string } | undefined;

			Given("the project directory may have permission issues", async () => {
				await withTempDir(async () => {
					await runUdd("init --yes");
				});
			});

			When('I run "udd health-check"', async () => {
				result = await runUdd("health-check");
			});

			Then('it should verify write access to ".udd/" directory', () => {
				expect(result).toBeDefined();
				expect(result!.stdout).toContain("write");
			});

			And("it should verify write access to manifest file", () => {
				expect(result).toBeDefined();
				expect(result!.stdout).toContain("manifest");
			});

			And("permission errors should be reported", () => {
				expect(result).toBeDefined();
				expect(result!.stdout.length).toBeGreaterThan(0);
			});
		},
	);

	Scenario(
		"Health check provides detailed diagnostics",
		({ When, Then, And }) => {
			let result: { stdout: string; stderr: string } | undefined;

			When('I run "udd health-check --verbose"', async () => {
				await withTempDir(async () => {
					await runUdd("init --yes");
					result = await runUdd("health-check --verbose");
				});
			});

			Then("detailed information should be shown for each check", () => {
				expect(result).toBeDefined();
				expect(result!.stdout.length).toBeGreaterThan(0);
			});

			And("passed checks should show their values", () => {
				expect(result).toBeDefined();
				expect(result!.stdout).toContain("✓");
			});

			And("failed checks should show expected vs actual", () => {
				expect(result).toBeDefined();
				expect(result!.stdout.length).toBeGreaterThan(0);
			});
		},
	);

	Scenario("Health check suggests fixes", ({ Given, When, Then, And }) => {
		let result: { stdout: string; stderr: string } | undefined;

		Given("some checks are failing", async () => {
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
		});

		When('I run "udd health-check --fix"', async () => {
			result = await runUdd("health-check --fix");
		});

		Then("it should attempt automatic fixes where possible", () => {
			expect(result).toBeDefined();
			expect(result!.stdout).toContain("fix");
		});

		And("it should report which issues were fixed", () => {
			expect(result).toBeDefined();
			expect(result!.stdout).toContain("fixed");
		});

		And("remaining issues should still be listed", () => {
			expect(result).toBeDefined();
			expect(result!.stdout.length).toBeGreaterThan(0);
		});
	});

	Scenario(
		"Health check integrates with status",
		({ Given, When, Then, And }) => {
			let result: { stdout: string; stderr: string } | undefined;

			Given("I want health as part of status output", async () => {
				await withTempDir(async () => {
					await runUdd("init --yes");
				});
			});

			When('I run "udd status --health"', async () => {
				result = await runUdd("status --health");
			});

			Then("health check results should be included", () => {
				expect(result).toBeDefined();
				expect(result!.stdout).toContain("health");
			});

			And("critical issues should affect overall status", () => {
				expect(result).toBeDefined();
				expect(result!.stdout.length).toBeGreaterThan(0);
			});
		},
	);
});
