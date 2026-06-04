import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { expect } from "vitest";
import { buildUddCommand, execAsync } from "../../../utils.js";

const feature = await loadFeature(
	"specs/features/udd/recovery/diagnose_project_health.feature",
);

interface CommandResult {
	stdout: string;
	stderr: string;
	code?: number;
}

let previousCwd: string;
let projectDir: string;
let output: CommandResult;

async function cleanupProject() {
	if (!projectDir) return;
	process.chdir(previousCwd);
	await fs.rm(projectDir, { recursive: true, force: true });
	projectDir = "";
}

async function startProject() {
	await cleanupProject();
	previousCwd = process.cwd();
	projectDir = await fs.mkdtemp(path.join(os.tmpdir(), "udd-doctor-e2e-"));
	process.chdir(projectDir);
}

async function runUddInProject(args: string): Promise<CommandResult> {
	try {
		return await execAsync(buildUddCommand(args));
	} catch (error: unknown) {
		return error as CommandResult;
	}
}

function parsedJson<T extends Record<string, unknown>>(): T {
	return JSON.parse(output.stdout) as T;
}

function issueTypes(report: Record<string, unknown>): string[] {
	const issues = report.issues;
	expect(Array.isArray(issues)).toBe(true);
	return (issues as Array<{ type: string }>).map((issue) => issue.type);
}

function issueSeverities(
	report: Record<string, unknown>,
): Record<string, string> {
	const issues = report.issues;
	expect(Array.isArray(issues)).toBe(true);
	return Object.fromEntries(
		(issues as Array<{ type: string; severity: string }>).map((issue) => [
			issue.type,
			issue.severity,
		]),
	);
}

async function writeValidSourceProjectWithoutManifest() {
	await fs.mkdir(path.join(projectDir, "product/journeys"), {
		recursive: true,
	});
	await fs.mkdir(path.join(projectDir, "specs/features/example"), {
		recursive: true,
	});
	await fs.mkdir(path.join(projectDir, "specs/use-cases"), {
		recursive: true,
	});
	await fs.writeFile(
		path.join(projectDir, "product/journeys/example.md"),
		[
			"# Journey: Example",
			"",
			"**Actor:** User",
			"**Goal:** Capture optional discovery context",
			"",
			"## Steps",
			"",
			"1. Optional future step -> `specs/features/example/future.feature`",
			"",
		].join("\n"),
	);
	await fs.writeFile(
		path.join(projectDir, "specs/features/example/_feature.yml"),
		"id: example\nname: Example\nsummary: Example feature\nphase: 3\n",
	);
	await fs.writeFile(
		path.join(projectDir, "specs/features/example/current.feature"),
		"@phase:3\nFeature: Current example\n\n  Scenario: Current example\n    Given current behavior exists\n",
	);
	await fs.writeFile(
		path.join(projectDir, "specs/use-cases/example.yml"),
		[
			"id: example",
			"name: Example",
			"summary: Example source-controlled behavior",
			"phase: 3",
			"actors:",
			"  - user",
			"outcomes:",
			"  - description: Current behavior is linked from source-controlled specs",
			"    scenarios:",
			"      - current",
			"    scenario_paths:",
			"      - example/current",
			"",
		].join("\n"),
	);
}

describeFeature(feature, ({ Scenario }) => {
	Scenario(
		"Report real initialized project diagnostics",
		({ Given, When, Then, And }) => {
			Given(
				'a temporary project initialized with "udd init --yes"',
				async () => {
					await startProject();
					const init = await runUddInProject("init --yes");
					expect(init.stdout).toContain("UDD initialized");
				},
			);

			When('I run "udd doctor --json"', async () => {
				output = await runUddInProject("doctor --json");
			});

			Then('the JSON report should identify the project as "healthy"', () => {
				const report = parsedJson<{ status: string; healthy: boolean }>();
				expect(report.status).toBe("healthy");
				expect(report.healthy).toBe(true);
			});

			And('the report should include a "missing_scenario" issue', () => {
				expect(issueTypes(parsedJson())).toContain("missing_scenario");
			});

			And('the "missing_scenario" issue should be advisory', async () => {
				try {
					expect(issueSeverities(parsedJson()).missing_scenario).toBe("info");
				} finally {
					await cleanupProject();
				}
			});
		},
	);

	Scenario(
		"Report generated manifest absence as advisory",
		({ Given, When, Then, And }) => {
			Given(
				"a temporary project with valid source-controlled specs but no generated manifest",
				async () => {
					await startProject();
					await writeValidSourceProjectWithoutManifest();
				},
			);

			When('I run "udd doctor --json"', async () => {
				output = await runUddInProject("doctor --json");
			});

			Then('the JSON report should identify the project as "healthy"', () => {
				const report = parsedJson<{ status: string; healthy: boolean }>();
				expect(report.status).toBe("healthy");
				expect(report.healthy).toBe(true);
			});

			And('the report should include a "manifest_missing" issue', () => {
				expect(issueTypes(parsedJson())).toContain("manifest_missing");
			});

			And('the "manifest_missing" issue should be advisory', async () => {
				try {
					expect(issueSeverities(parsedJson()).manifest_missing).toBe("info");
				} finally {
					await cleanupProject();
				}
			});
		},
	);

	Scenario(
		"Expose health classification in status JSON",
		({ Given, When, Then, And }) => {
			Given(
				"a temporary project with valid source-controlled specs but no generated manifest",
				async () => {
					await startProject();
					await writeValidSourceProjectWithoutManifest();
				},
			);

			When('I run "udd status --json"', async () => {
				output = await runUddInProject("status --json");
			});

			Then(
				"the status JSON health summary should have zero critical issues",
				() => {
					const report = parsedJson<{
						health: { summary: { critical: number }; blocking_count: number };
					}>();
					expect(report.health.summary.critical).toBe(0);
					expect(report.health.blocking_count).toBe(0);
				},
			);

			And(
				"the status JSON should identify advisory discovery issues",
				async () => {
					try {
						const report = parsedJson<{
							health: { summary: { info: number }; advisory_count: number };
						}>();
						expect(report.health.summary.info).toBeGreaterThan(0);
						expect(report.health.advisory_count).toBeGreaterThan(0);
					} finally {
						await cleanupProject();
					}
				},
			);
		},
	);

	Scenario(
		"Keep legacy status doctor aligned with advisory health",
		({ Given, When, Then, And }) => {
			Given(
				"a temporary project with valid source-controlled specs but no generated manifest",
				async () => {
					await startProject();
					await writeValidSourceProjectWithoutManifest();
				},
			);

			When('I run "udd status --doctor"', async () => {
				output = await runUddInProject("status --doctor");
			});

			Then(
				"the status doctor output should identify the project as healthy",
				() => {
					expect(output.stdout).toContain("project is healthy");
					expect(output.stdout).toContain("advisory item(s)");
				},
			);

			And("the status doctor command should not fail", async () => {
				try {
					expect(output.code ?? 0).toBe(0);
				} finally {
					await cleanupProject();
				}
			});
		},
	);

	Scenario(
		"Report partial initialization diagnostics",
		({ Given, When, Then, And }) => {
			Given(
				'a temporary project with "specs/.udd" but no "product" directory',
				async () => {
					await startProject();
					await fs.mkdir(path.join(projectDir, "specs/.udd"), {
						recursive: true,
					});
					await fs.writeFile(
						path.join(projectDir, "specs/.udd/manifest.yml"),
						"journeys: {}\nscenarios: {}\n",
					);
				},
			);

			When('I run "udd health-check --json"', async () => {
				output = await runUddInProject("health-check --json");
			});

			Then("the JSON health report should be unhealthy", () => {
				const report = parsedJson<{ healthy: boolean; status: string }>();
				expect(report.healthy).toBe(false);
				expect(report.status).toBe("drift-detected");
			});

			And('the report should include a "product_missing" issue', async () => {
				try {
					expect(issueTypes(parsedJson())).toContain("product_missing");
				} finally {
					await cleanupProject();
				}
			});
		},
	);

	Scenario(
		"Report drifted journey diagnostics",
		({ Given, When, Then, And }) => {
			Given(
				"a temporary project with a stale journey manifest entry",
				async () => {
					await startProject();
					await fs.mkdir(path.join(projectDir, "product/journeys"), {
						recursive: true,
					});
					await fs.mkdir(path.join(projectDir, "specs/features/drift"), {
						recursive: true,
					});
					await fs.mkdir(path.join(projectDir, "specs/.udd"), {
						recursive: true,
					});
					await fs.writeFile(
						path.join(projectDir, "product/journeys/drift.md"),
						[
							"# Journey: Drift",
							"",
							"**Actor:** User",
							"**Goal:** Detect drift",
							"",
							"## Steps",
							"",
							"1. Detect stale journey -> `specs/features/drift/check.feature`",
							"",
						].join("\n"),
					);
					await fs.writeFile(
						path.join(projectDir, "specs/features/drift/check.feature"),
						"Feature: Check\n\n  Scenario: Check drift\n    Given drift exists\n",
					);
					await fs.writeFile(
						path.join(projectDir, "specs/.udd/manifest.yml"),
						[
							"journeys:",
							"  drift:",
							"    path: product/journeys/drift.md",
							"    hash: old-hash",
							"    scenarios:",
							"      - specs/features/drift/check.feature",
							"scenarios: {}",
							"",
						].join("\n"),
					);
				},
			);

			When('I run "udd doctor --json"', async () => {
				output = await runUddInProject("doctor --json");
			});

			Then('the JSON report should identify the project as "healthy"', () => {
				const report = parsedJson<{ status: string; healthy: boolean }>();
				expect(report.status).toBe("healthy");
				expect(report.healthy).toBe(true);
			});

			And('the report should include a "journey_stale" issue', () => {
				expect(issueTypes(parsedJson())).toContain("journey_stale");
			});

			And('the "journey_stale" issue should be advisory', async () => {
				try {
					expect(issueSeverities(parsedJson()).journey_stale).toBe("info");
				} finally {
					await cleanupProject();
				}
			});
		},
	);

	Scenario(
		"Report deleted files still referenced by the manifest",
		({ Given, When, Then, And }) => {
			Given(
				"a temporary project with manifest entries for deleted journey and scenario files",
				async () => {
					await startProject();
					await fs.mkdir(path.join(projectDir, "product/journeys"), {
						recursive: true,
					});
					await fs.mkdir(path.join(projectDir, "specs/.udd"), {
						recursive: true,
					});
					await fs.writeFile(
						path.join(projectDir, "specs/.udd/manifest.yml"),
						[
							"journeys:",
							"  deleted:",
							"    path: product/journeys/deleted.md",
							"    hash: deleted-hash",
							"    scenarios:",
							"      - specs/features/deleted/path.feature",
							"scenarios:",
							"  specs/features/deleted/path.feature:",
							"    hash: deleted-scenario-hash",
							"    test: tests/e2e/deleted/path.e2e.test.ts",
							"    status: pending",
							"",
						].join("\n"),
					);
				},
			);

			When('I run "udd health-check --json"', async () => {
				output = await runUddInProject("health-check --json");
			});

			Then("the JSON health report should be unhealthy", () => {
				const report = parsedJson<{ healthy: boolean; status: string }>();
				expect(report.healthy).toBe(false);
				expect(report.status).toBe("drift-detected");
			});

			And(
				'the report should include "missing_journey" and "missing_scenario" issues',
				async () => {
					try {
						const types = issueTypes(parsedJson());
						expect(types).toContain("missing_journey");
						expect(types).toContain("missing_scenario");
					} finally {
						await cleanupProject();
					}
				},
			);
		},
	);

	Scenario(
		"Report malformed manifest diagnostics",
		({ Given, When, Then, And }) => {
			Given(
				"a temporary project with manifest scenarios stored as a list",
				async () => {
					await startProject();
					await fs.mkdir(path.join(projectDir, "product/journeys"), {
						recursive: true,
					});
					await fs.mkdir(path.join(projectDir, "specs/.udd"), {
						recursive: true,
					});
					await fs.writeFile(
						path.join(projectDir, "specs/.udd/manifest.yml"),
						"journeys: {}\nscenarios: []\n",
					);
				},
			);

			When('I run "udd doctor --json"', async () => {
				output = await runUddInProject("doctor --json");
			});

			Then(
				'the JSON report should identify the project as "drift-detected"',
				() => {
					const report = parsedJson<{ status: string }>();
					expect(report.status).toBe("drift-detected");
				},
			);

			And('the report should include a "manifest_invalid" issue', async () => {
				try {
					expect(issueTypes(parsedJson())).toContain("manifest_invalid");
				} finally {
					await cleanupProject();
				}
			});
		},
	);

	Scenario(
		"Report null journey manifest entries without crashing",
		({ Given, When, Then, And }) => {
			Given(
				"a temporary project with a null journey manifest entry",
				async () => {
					await startProject();
					await fs.mkdir(path.join(projectDir, "product/journeys"), {
						recursive: true,
					});
					await fs.mkdir(path.join(projectDir, "specs/.udd"), {
						recursive: true,
					});
					await fs.writeFile(
						path.join(projectDir, "specs/.udd/manifest.yml"),
						"journeys:\n  missing: null\nscenarios: {}\n",
					);
				},
			);

			When('I run "udd health-check --json"', async () => {
				output = await runUddInProject("health-check --json");
			});

			Then("the JSON health report should be unhealthy", () => {
				const report = parsedJson<{ healthy: boolean }>();
				expect(report.healthy).toBe(false);
			});

			And('the report should include a "missing_journey" issue', async () => {
				try {
					expect(issueTypes(parsedJson())).toContain("missing_journey");
				} finally {
					await cleanupProject();
				}
			});
		},
	);

	Scenario(
		"Ignore punctuation after unquoted journey scenario paths",
		({ Given, When, Then, And }) => {
			Given(
				"a temporary project with an unquoted journey scenario path followed by punctuation",
				async () => {
					await startProject();
					await fs.mkdir(path.join(projectDir, "product/journeys"), {
						recursive: true,
					});
					await fs.mkdir(path.join(projectDir, "specs/features/punctuation"), {
						recursive: true,
					});
					await fs.mkdir(path.join(projectDir, "specs/.udd"), {
						recursive: true,
					});
					await fs.writeFile(
						path.join(projectDir, "product/journeys/punctuation.md"),
						[
							"# Journey: Punctuation",
							"",
							"1. Check punctuation -> specs/features/punctuation/check.feature.",
							"",
						].join("\n"),
					);
					await fs.writeFile(
						path.join(projectDir, "specs/features/punctuation/check.feature"),
						"Feature: Check\n\n  Scenario: Check punctuation\n    Given punctuation exists\n",
					);
					await fs.writeFile(
						path.join(projectDir, "specs/.udd/manifest.yml"),
						"journeys: {}\nscenarios: {}\n",
					);
				},
			);

			When('I run "udd doctor --json"', async () => {
				output = await runUddInProject("doctor --json");
			});

			Then('the JSON report should identify the project as "healthy"', () => {
				const report = parsedJson<{ status: string; healthy: boolean }>();
				expect(report.status).toBe("healthy");
				expect(report.healthy).toBe(true);
			});

			And(
				'the report should not include a "missing_scenario" issue',
				async () => {
					try {
						expect(issueTypes(parsedJson())).not.toContain("missing_scenario");
					} finally {
						await cleanupProject();
					}
				},
			);
		},
	);
});
