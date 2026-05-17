import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { expect } from "vitest";
import { runUdd } from "../../../utils.js";

const feature = await loadFeature(
	"specs/features/opencode/tools/status_deep.feature",
);

describeFeature(feature, ({ Background, Scenario }) => {
	Background(({ Given, And }) => {
		Given("I am in the repository root", () => {
			// no-op; scenarios run in temp dirs when needed
		});

		And("UDD is initialized", () => {
			// no-op; scenarios call udd init inside temp dirs
		});
	});
	Scenario(
		"Status command shows overall project health overview (human readable)",
		({ Given, When, Then, And }) => {
			let statusOutput: string;
			let runResult: { stdout: Buffer | string; stderr: Buffer | string };

			Given(
				"a codebase with multiple journeys, scenarios, and tests",
				async () => {
					const tempDir = await mkdtemp(path.join(os.tmpdir(), "udd-test-"));
					await runUdd("init --yes", { cwd: tempDir });
				},
			);

			When('I run "udd opencode status"', async () => {
				runResult = await runUdd("opencode status");
				statusOutput = runResult.stdout.toString();
			});

			Then("the command should exit with code 0", async () => {
				expect(statusOutput).toBeDefined();
			});

			And('the output should contain "OpenCode Agent Status"', async () => {
				expect(statusOutput).toContain("OpenCode Agent Status");
			});

			And(
				'the output should contain a high-level health summary such as "Healthy" or "Issues detected"',
				async () => {
					expect(statusOutput).toMatch(
						/Healthy|Issues detected|Critical issues/,
					);
				},
			);

			And(
				'the output should contain a summary section named "Project Health Overview"',
				async () => {
					expect(statusOutput).toContain("Project Health Overview");
				},
			);

			And(
				'the output should contain lines like "Journeys: 12, Scenarios: 34, Tests: 78"',
				async () => {
					expect(statusOutput).toMatch(/Journeys:\s*\d+, Scenarios:\s*\d+/);
				},
			);
		},
	);

	Scenario(
		"Status command lists all journeys and their completion status",
		({ Given, When, Then, And }) => {
			let statusOutput: string;
			let runResult: { stdout: string; stderr: string };

			Given("product/journeys contains the following journeys:", async () => {
				const tempDir = await mkdtemp(path.join(os.tmpdir(), "udd-test-"));
				await runUdd("init --yes", { cwd: tempDir });
				// create journeys with statuses
				await mkdir(path.join(tempDir, "product/journeys"), {
					recursive: true,
				});
				await writeFile(
					path.join(tempDir, "product/journeys/onboarding.md"),
					"---\nstatus: complete\n---\nOnboarding journey\n",
				);
				await writeFile(
					path.join(tempDir, "product/journeys/export_data.md"),
					"---\nstatus: in_progress\n---\nExport data journey\n",
				);
				// deliberately do not create billing_migration.md to mark as missing
			});

			When('I run "udd opencode status"', async () => {
				runResult = await runUdd("opencode status");
				statusOutput = runResult.stdout;
			});

			Then("the command should exit with code 0", async () => {
				expect(statusOutput).toBeDefined();
			});

			And(
				'the output should include a section "Journeys" with each journey and its status',
				async () => {
					expect(statusOutput).toContain("Journeys");
					expect(statusOutput).toContain("onboarding — complete");
					expect(statusOutput).toContain("export_data — in_progress");
					expect(statusOutput).toContain("billing_migration — missing");
				},
			);

			And('the output should contain "onboarding — complete"', async () => {
				expect(statusOutput).toContain("onboarding — complete");
			});

			And('the output should contain "export_data — in_progress"', async () => {
				expect(statusOutput).toContain("export_data — in_progress");
			});

			And(
				'the output should contain "billing_migration — missing"',
				async () => {
					expect(statusOutput).toContain("billing_migration — missing");
				},
			);
		},
	);

	Scenario(
		"Status command shows current phase from specs/roadmap.yml",
		({ Given, When, Then, And }) => {
			let statusOutput: string;
			let runResult: { stdout: string; stderr: string };

			Given(
				'specs/roadmap.yml declares the current phase as "Phase 3 - Agent Integration"',
				async () => {
					const tempDir = await mkdtemp(path.join(os.tmpdir(), "udd-test-"));
					await runUdd("init --yes", { cwd: tempDir });
					await mkdir(path.join(tempDir, "specs"), { recursive: true });
					await writeFile(
						path.join(tempDir, "specs/roadmap.yml"),
						[
							"current_phase: opencode-integration",
							"phases:",
							"  - id: opencode-integration",
							"    number: 3",
							'    name: "Agent Integration"',
							"",
						].join("\n"),
					);
				},
			);

			When('I run "udd opencode status"', async () => {
				runResult = await runUdd("opencode status");
				statusOutput = runResult.stdout;
			});

			Then("the command should exit with code 0", async () => {
				expect(statusOutput).toBeDefined();
			});

			And(
				'the output should contain "Current Phase: Phase 3 - Agent Integration"',
				async () => {
					expect(statusOutput).toContain(
						"Current Phase: Phase 3 - Agent Integration",
					);
				},
			);
		},
	);

	Scenario(
		"Status command identifies blocking issues",
		({ Given, When, Then, And }) => {
			let statusOutput: string;
			let runResult: { stdout: string; stderr: string };

			Given("there are two blocking issues in the repository:", async () => {
				const tempDir = await mkdtemp(path.join(os.tmpdir(), "udd-test-"));
				await runUdd("init --yes", { cwd: tempDir });
				// Create a failing test file and a missing journey file placeholder
				await mkdir(path.join(tempDir, "tests/e2e"), { recursive: true });
				await writeFile(
					path.join(tempDir, "tests/e2e/authentication.e2e.test.ts"),
					"test('dummy', () => { throw new Error('fail') })\n",
				);
				// create product/journeys directory but omit billing_migration.md to simulate missing
				await runUdd("opencode new journey billing_migration", {
					cwd: tempDir,
				}).catch(() => {});
			});

			When('I run "udd opencode status"', async () => {
				runResult = await runUdd("opencode status");
				statusOutput = runResult.stdout;
			});

			Then("the command should exit with code 0", async () => {
				expect(statusOutput).toBeDefined();
			});

			And('the output should contain a section "Blocking Issues"', async () => {
				expect(statusOutput).toContain("Blocking Issues");
			});

			And(
				"the output should list each blocking issue with type and summary",
				async () => {
					expect(statusOutput).toMatch(/test_fail|missing/);
				},
			);

			And(
				'the output should contain "tests/e2e/authentication.e2e.test.ts" and "product/journeys/billing_migration.md"',
				async () => {
					expect(statusOutput).toContain(
						"tests/e2e/authentication.e2e.test.ts",
					);
					expect(statusOutput).toContain(
						"product/journeys/billing_migration.md",
					);
				},
			);
		},
	);

	Scenario(
		"Status command shows test coverage metrics",
		({ Given, When, Then, And }) => {
			let statusOutput: string;
			let runResult: { stdout: string; stderr: string };

			Given(
				"the test runner reports coverage metrics: statements: 87%, branches: 72%, functions: 90%, lines: 86%",
				async () => {
					const tempDir = await mkdtemp(path.join(os.tmpdir(), "udd-test-"));
					await runUdd("init --yes", { cwd: tempDir });
					// create a fake coverage report file
					await mkdir(path.join(tempDir, "coverage"), { recursive: true });
					await writeFile(
						path.join(tempDir, "coverage/coverage-summary.json"),
						JSON.stringify(
							{
								total: {
									statements: { pct: 87 },
									branches: { pct: 72 },
									functions: { pct: 90 },
									lines: { pct: 86 },
								},
							},
							null,
							2,
						),
					);
				},
			);

			When('I run "udd opencode status"', async () => {
				runResult = await runUdd("opencode status");
				statusOutput = runResult.stdout;
			});

			Then("the command should exit with code 0", async () => {
				expect(statusOutput).toBeDefined();
			});

			And('the output should contain a section "Test Coverage"', async () => {
				expect(statusOutput).toContain("Test Coverage");
			});

			And(
				'the output should contain "Statements: 87%" and "Branches: 72%" and "Lines: 86%"',
				async () => {
					expect(statusOutput).toContain("Statements: 87%");
					expect(statusOutput).toContain("Branches: 72%");
					expect(statusOutput).toContain("Lines: 86%");
				},
			);
		},
	);

	Scenario(
		"Status command outputs structured JSON for agents when --json is passed",
		({ Given, When, Then, And }) => {
			let statusOutput: string;
			let runResult: { stdout: string; stderr: string };

			Given("the repository has journeys, scenarios, and tests", async () => {
				const tempDir = await mkdtemp(path.join(os.tmpdir(), "udd-test-"));
				await runUdd("init --yes", { cwd: tempDir });
			});

			When('I run "udd opencode status --json"', async () => {
				runResult = await runUdd("opencode status --json");
				statusOutput = runResult.stdout;
			});

			Then("the command should exit with code 0", async () => {
				expect(statusOutput).toBeDefined();
			});

			And("the output should be valid JSON", async () => {
				const json = JSON.parse(statusOutput);
				expect(json).toBeDefined();
			});

			And(
				'the JSON should include keys: "project", "phase", "journeys", "issues", "coverage"',
				async () => {
					const json = JSON.parse(statusOutput);
					expect(json.project).toBeDefined();
					expect(json.phase).toBeDefined();
					expect(json.journeys).toBeDefined();
					expect(json.issues).toBeDefined();
					expect(json.coverage).toBeDefined();
				},
			);

			And(
				'the JSON "phase" value should equal the current phase from specs/roadmap.yml',
				async () => {
					await mkdir(path.join(process.cwd(), "specs"), { recursive: true });
					await writeFile(
						path.join(process.cwd(), "specs/roadmap.yml"),
						[
							"current_phase: opencode-integration",
							"phases:",
							"  - id: opencode-integration",
							"    number: 3",
							'    name: "Agent Integration"',
							"",
						].join("\n"),
					);
					const json = JSON.parse(statusOutput);
					expect(json.phase).toBe("Phase 3 - Agent Integration");
				},
			);

			And(
				'the JSON "journeys" should be an array of objects with "name" and "status"',
				async () => {
					const json = JSON.parse(statusOutput);
					expect(Array.isArray(json.journeys)).toBe(true);
					if (json.journeys.length > 0) {
						expect(json.journeys[0].name).toBeDefined();
						expect(json.journeys[0].status).toBeDefined();
					}
				},
			);
		},
	);

	Scenario(
		"JSON output includes machine-friendly issue objects with severity and file",
		({ Given, When, Then, And }) => {
			let statusOutput: string;
			let runResult: { stdout: string; stderr: string };

			Given("there is one blocking issue: missing manifest file", async () => {
				const tempDir = await mkdtemp(path.join(os.tmpdir(), "udd-test-"));
				await runUdd("init --yes", { cwd: tempDir });
				// simulate missing manifest by not creating it
			});

			When('I run "udd opencode status --json"', async () => {
				runResult = await runUdd("opencode status --json");
				statusOutput = runResult.stdout;
			});

			Then("the command should exit with code 0", async () => {
				expect(statusOutput).toBeDefined();
			});

			And("the output should be valid JSON", async () => {
				const json = JSON.parse(statusOutput);
				expect(json).toBeDefined();
			});

			And('the JSON "issues" array should contain an object:', async () => {
				const json = JSON.parse(statusOutput);
				expect(Array.isArray(json.issues)).toBe(true);
				const issue = (
					json.issues as Array<{
						file?: string;
						type?: string;
						severity?: string;
					}>
				).find(
					(i) =>
						i.file === "specs/.udd/manifest.yml" || i.type === "missing_file",
				);
				expect(issue).toBeDefined();
				expect(
					issue.severity === "blocking" || issue.type === "missing_file",
				).toBeTruthy();
			});
		},
	);
});
