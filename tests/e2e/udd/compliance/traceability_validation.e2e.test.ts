import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { expect } from "vitest";
import {
	loadUseCaseScenarioPaths,
	resolveJourneyReference,
} from "../../../../src/lib/trace.js";
import { runUdd } from "../../../utils.js";

const feature = await loadFeature(
	"specs/features/udd/compliance/traceability_validation.feature",
);

let previousCwd: string;
let projectDir: string;

async function cleanupProject() {
	if (!projectDir) return;
	process.chdir(previousCwd);
	await fs.rm(projectDir, { recursive: true, force: true });
	projectDir = "";
}

async function startProject() {
	await cleanupProject();
	previousCwd = process.cwd();
	projectDir = await fs.mkdtemp(path.join(os.tmpdir(), "udd-trace-e2e-"));
	process.chdir(projectDir);
	await writeTraceProject();
}

async function writeTraceProject() {
	await fs.mkdir("product/journeys", { recursive: true });
	await fs.mkdir("specs/use-cases", { recursive: true });
	await fs.mkdir("specs/features/udd/cli/inbox", { recursive: true });
	await fs.writeFile(
		"specs/use-cases/capture_ideas.yml",
		[
			"id: capture_ideas",
			"name: Capture Ideas",
			"outcomes:",
			"  - description: Ideas can be added",
			"    scenario_paths:",
			"      - udd/cli/inbox/add_item_via_cli",
			"",
		].join("\n"),
	);
	await fs.writeFile(
		"specs/features/udd/cli/inbox/add_item_via_cli.feature",
		"Feature: Add item via CLI\n\n  Scenario: Add inbox item\n",
	);
	await fs.writeFile(
		"product/journeys/capture-ideas.md",
		[
			"# Journey: Capture Ideas",
			"",
			"**Actor:** Developer",
			"**Goal:** Save a raw idea",
			"",
			"## Steps",
			"",
			"1. Capture a raw idea → `capture_ideas`",
			"",
		].join("\n"),
	);
}

async function writeUnresolvedTraceProject() {
	await fs.mkdir("product/journeys", { recursive: true });
	await fs.mkdir("specs/use-cases", { recursive: true });
	await fs.writeFile(
		"product/journeys/unresolved.md",
		[
			"# Journey: Unresolved",
			"",
			"**Actor:** Developer",
			"**Goal:** Avoid malformed sync output",
			"",
			"## Steps",
			"",
			"1. Reference missing use case → `missing_use_case`",
			"",
		].join("\n"),
	);
}

describeFeature(feature, ({ Scenario }) => {
	Scenario("Resolve journey use-case references", ({ Given, When, Then }) => {
		let resolved: string[] = [];

		Given("a use case links to a scenario path", async () => {
			await startProject();
		});

		When("a journey step references that use case id", async () => {
			const useCaseScenarios = await loadUseCaseScenarioPaths(process.cwd());
			resolved = resolveJourneyReference("capture_ideas", useCaseScenarios);
		});

		Then(
			"traceability should resolve the reference to the scenario feature file",
			() => {
				try {
					expect(resolved).toEqual([
						"specs/features/udd/cli/inbox/add_item_via_cli.feature",
					]);
				} finally {
					void cleanupProject();
				}
			},
		);
	});

	Scenario(
		"Sync manifest stores resolved scenario paths",
		({ Given, When, Then }) => {
			let manifest: string;

			Given("a journey step references a use case id", async () => {
				await startProject();
			});

			When('I run "udd sync --auto"', async () => {
				await runUdd("sync --auto");
				manifest = await fs.readFile("specs/.udd/manifest.yml", "utf-8");
			});

			Then(
				"the manifest should list the resolved scenario feature path",
				() => {
					try {
						expect(manifest).toContain(
							"specs/features/udd/cli/inbox/add_item_via_cli.feature",
						);
					} finally {
						void cleanupProject();
					}
				},
			);
		},
	);

	Scenario(
		"Skip unresolved journey references",
		({ Given, When, Then, And }) => {
			let stderr: string;

			Given("a journey step references an unknown use case id", async () => {
				await cleanupProject();
				previousCwd = process.cwd();
				projectDir = await fs.mkdtemp(path.join(os.tmpdir(), "udd-trace-e2e-"));
				process.chdir(projectDir);
				await writeUnresolvedTraceProject();
			});

			When('I run "udd sync --auto"', async () => {
				const result = await runUdd("sync --auto");
				stderr = result.stderr;
			});

			Then("sync should warn about the unresolved reference", () => {
				expect(stderr).toContain(
					"Could not resolve journey reference 'missing_use_case'",
				);
			});

			And("it should not create an extensionless scenario file", async () => {
				try {
					await expect(fs.access("missing_use_case")).rejects.toThrow();
				} finally {
					await cleanupProject();
				}
			});
		},
	);
});
