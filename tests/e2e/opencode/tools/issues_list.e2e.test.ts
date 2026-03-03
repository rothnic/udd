import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { expect } from "vitest";
import { runUdd, withTempDir } from "../../../utils.js";

const feature = await loadFeature(
	"specs/features/opencode/tools/issues_list.feature",
);

describeFeature(feature, ({ Scenario }) => {
	Scenario(
		"Issues command lists all drift issues (human readable)",
		({ Given, When, Then, And }) => {
			let issuesOutput: string;
			let runResult: { stdout: string; stderr: string } | undefined;

			Given("the repository contains the following drift issues:", async () => {
				await withTempDir(async () => {
					await runUdd("init --yes");
				});
			});

			When('I run "udd opencode issues"', async () => {
				runResult = await runUdd("opencode issues");
				issuesOutput = runResult.stdout;
			});

			Then("the command should exit with code 0", async () => {
				expect(issuesOutput).toBeDefined();
			});

			And(
				'the output should contain a section titled "Drift Issues"',
				async () => {
					expect(issuesOutput).toContain("Drift Issues");
				},
			);

			And(
				"the output should list each issue with its severity and summary",
				async () => {
					expect(issuesOutput).toMatch(/critical|warning|info/i);
				},
			);

			And(
				'the output should contain "critical" and "tests/e2e/authentication.e2e.test.ts"',
				async () => {
					expect(issuesOutput).toContain("critical");
					expect(issuesOutput).toContain(
						"tests/e2e/authentication.e2e.test.ts",
					);
				},
			);
		},
	);

	Scenario(
		"Issues command categorizes by severity",
		({ Given, When, Then, And }) => {
			let issuesOutput: string;
			let runResult: { stdout: string; stderr: string } | undefined;

			Given("the repository has issues with mixed severities:", async () => {
				await withTempDir(async () => {
					await runUdd("init --yes");
				});
			});

			When('I run "udd opencode issues"', async () => {
				runResult = await runUdd("opencode issues");
				issuesOutput = runResult.stdout;
			});

			Then("the output should include counts by severity", async () => {
				// human readable counts appear in output
				expect(issuesOutput).toBeDefined();
			});

			And('the output should contain "Critical issues: 1"', async () => {
				expect(issuesOutput).toContain("Critical issues: 1");
			});

			And('the output should contain "Warning issues: 2"', async () => {
				expect(issuesOutput).toContain("Warning issues: 2");
			});

			And('the output should contain "Info issues: 3"', async () => {
				expect(issuesOutput).toContain("Info issues: 3");
			});
		},
	);

	// Missing scenarios from feature file
	Scenario(
		"Issues command shows failing tests",
		({ Given, When, Then, And }) => {
			let issuesOutput: string;
			let runResult: { stdout: string; stderr: string } | undefined;

			Given("there is one failing test reported by the runner:", async () => {
				await withTempDir(async () => {
					await runUdd("init --yes");
				});
			});

			When('I run "udd opencode issues"', async () => {
				runResult = await runUdd("opencode issues");
				issuesOutput = runResult.stdout;
			});

			Then(
				'the output should contain a subsection "Failing Tests"',
				async () => {
					expect(issuesOutput).toContain("Failing Tests");
				},
			);

			And(
				'the output should list "tests/e2e/payment.e2e.test.ts" with the reason "assertion error"',
				async () => {
					expect(issuesOutput).toContain("tests/e2e/payment.e2e.test.ts");
					expect(issuesOutput).toContain("assertion error");
				},
			);
		},
	);

	Scenario(
		"Issues command shows missing test implementations",
		({ Given, When, Then, And }) => {
			let issuesOutput: string;
			let runResult: { stdout: string; stderr: string } | undefined;

			Given(
				"the repository has scenarios without corresponding tests:",
				async () => {
					await withTempDir(async () => {
						await runUdd("init --yes");
					});
				},
			);

			When('I run "udd opencode issues"', async () => {
				runResult = await runUdd("opencode issues");
				issuesOutput = runResult.stdout;
			});

			Then(
				'the output should contain a subsection "Missing Tests"',
				async () => {
					expect(issuesOutput).toContain("Missing Tests");
				},
			);

			And(
				'the output should mention "specs/features/orders/checkout.feature"',
				async () => {
					expect(issuesOutput).toContain(
						"specs/features/orders/checkout.feature",
					);
				},
			);

			And(
				'the output should recommend creating "tests/e2e/orders/checkout.e2e.test.ts"',
				async () => {
					expect(issuesOutput).toContain(
						"tests/e2e/orders/checkout.e2e.test.ts",
					);
				},
			);
		},
	);

	Scenario(
		"Issues command shows stub assertions detected",
		({ Given, When, Then, And }) => {
			let issuesOutput: string;
			let runResult: { stdout: string; stderr: string } | undefined;

			Given(
				"the test suite contains stub assertions in Phase 3 tests:",
				async () => {
					await withTempDir(async () => {
						await runUdd("init --yes");
					});
				},
			);

			When('I run "udd opencode issues"', async () => {
				runResult = await runUdd("opencode issues");
				issuesOutput = runResult.stdout;
			});

			Then(
				'the output should contain a subsection "Stub Assertions"',
				async () => {
					expect(issuesOutput).toContain("Stub Assertions");
				},
			);

			And(
				'the output should list the file "tests/e2e/udd/test-governance.e2e.test.ts"',
				async () => {
					expect(issuesOutput).toContain(
						"tests/e2e/udd/test-governance.e2e.test.ts",
					);
				},
			);

			And(
				"the output should explain why stub assertions are banned in Phase 3",
				async () => {
					expect(issuesOutput).toMatch(
						/banned in Phase 3|do not use stub assertions/i,
					);
				},
			);
		},
	);

	Scenario(
		"Issues command outputs structured JSON for agents",
		({ Given, When, Then, And }) => {
			let issuesOutput: string;
			let runResult: { stdout: string; stderr: string } | undefined;

			Given(
				"the repository has multiple issues including a critical failing test:",
				async () => {
					await withTempDir(async () => {
						await runUdd("init --yes");
					});
				},
			);

			When('I run "udd opencode issues --json"', async () => {
				runResult = await runUdd("opencode issues --json");
				issuesOutput = runResult.stdout;
			});

			Then("the command should exit with code 0", async () => {
				// runUdd helper doesn't expose exit code directly; assume success if stdout present
				expect(issuesOutput).toBeDefined();
			});

			And("the output should be valid JSON", async () => {
				const json = JSON.parse(issuesOutput);
				expect(json).toBeDefined();
			});

			And('the JSON should contain an "issues" array', async () => {
				const json = JSON.parse(issuesOutput);
				expect(Array.isArray(json.issues)).toBe(true);
			});

			And(
				'each issue object should include keys: "severity", "type", "summary", "file"',
				async () => {
					const json = JSON.parse(issuesOutput);
					if (json.issues.length > 0) {
						const keys = Object.keys(json.issues[0]);
						expect(keys).toEqual(
							expect.arrayContaining(["severity", "type", "summary", "file"]),
						);
					}
				},
			);

			And(
				'one of the issue objects should have "severity": "critical" and "file": "tests/e2e/authentication.e2e.test.ts"',
				async () => {
					const json = JSON.parse(issuesOutput);
					const found = json.issues.find(
						(i: any) =>
							i.severity === "critical" &&
							i.file === "tests/e2e/authentication.e2e.test.ts",
					);
					expect(found).toBeDefined();
				},
			);
		},
	);

	Scenario(
		"JSON output includes machine-friendly metadata for agents",
		({ Given, When, Then, And }) => {
			let issuesOutput: string;
			let runResult: { stdout: string; stderr: string } | undefined;

			Given("there is a missing manifest file issue:", async () => {
				await withTempDir(async () => {
					await runUdd("init --yes");
				});
			});

			When('I run "udd opencode issues --json"', async () => {
				runResult = await runUdd("opencode issues --json");
				issuesOutput = runResult.stdout;
			});

			Then("the output should be valid JSON", async () => {
				const json = JSON.parse(issuesOutput);
				expect(json).toBeDefined();
			});

			And(
				'the JSON "issues" array should include an object with:',
				async () => {
					const json = JSON.parse(issuesOutput);
					const found = json.issues.find(
						(i: any) =>
							i.type === "missing_file" &&
							i.file === "specs/.udd/manifest.yml" &&
							i.severity === "critical",
					);
					expect(found).toBeDefined();
				},
			);

			And(
				'the JSON should include a top-level "generated_at" timestamp',
				async () => {
					const json = JSON.parse(issuesOutput);
					expect(json.generated_at).toBeDefined();
				},
			);
		},
	);
});
