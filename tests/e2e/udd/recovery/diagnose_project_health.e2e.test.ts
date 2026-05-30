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

			Then(
				'the JSON report should identify the project as "drift-detected"',
				() => {
					const report = parsedJson<{ status: string; healthy: boolean }>();
					expect(report.status).toBe("drift-detected");
					expect(report.healthy).toBe(false);
				},
			);

			And('the report should include a "missing_scenario" issue', async () => {
				try {
					expect(issueTypes(parsedJson())).toContain("missing_scenario");
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

			Then(
				'the JSON report should identify the project as "drift-detected"',
				() => {
					const report = parsedJson<{ status: string }>();
					expect(report.status).toBe("drift-detected");
				},
			);

			And('the report should include a "journey_stale" issue', async () => {
				try {
					expect(issueTypes(parsedJson())).toContain("journey_stale");
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
});
