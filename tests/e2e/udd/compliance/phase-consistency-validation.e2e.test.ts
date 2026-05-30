import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { expect } from "vitest";
import { runUdd } from "../../../utils.js";

const feature = await loadFeature(
	"specs/features/udd/compliance/phase-consistency-validation.feature",
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
	projectDir = await fs.mkdtemp(path.join(os.tmpdir(), "udd-phase-e2e-"));
	process.chdir(projectDir);
	await writeProject();
}

async function writeProject() {
	await fs.mkdir("specs/features/example", { recursive: true });
	await fs.writeFile(
		"specs/roadmap.yml",
		[
			"current_phase: opencode-integration",
			"phases:",
			"  - id: core-cli",
			"    name: Core CLI",
			"    number: 1",
			"    status: completed",
			"  - id: research-specs",
			"    name: Research Specs",
			"    number: 2",
			"    status: completed",
			"  - id: opencode-integration",
			"    name: Agent Integration",
			"    number: 3",
			"    status: active",
			"  - id: agent-intelligence",
			"    name: Agent Intelligence",
			"    number: 4",
			"    status: planned",
			"",
		].join("\n"),
	);
}

describeFeature(feature, ({ Scenario }) => {
	Scenario("Show current roadmap phase", ({ Given, When, Then }) => {
		let output: { stdout: string; stderr: string };

		Given("a UDD project with specs/roadmap.yml defining phases", async () => {
			await startProject();
		});

		When('I run "udd phase current"', async () => {
			output = await runUdd("phase current");
		});

		Then('the output should show "Phase 3: Agent Integration"', () => {
			try {
				expect(output.stdout).toContain("Phase 3: Agent Integration");
			} finally {
				void cleanupProject();
			}
		});
	});

	Scenario("Set current roadmap phase", ({ Given, When, Then, And }) => {
		let output: { stdout: string; stderr: string };

		Given("a UDD project with specs/roadmap.yml defining phases", async () => {
			await startProject();
		});

		When('I run "udd phase set 4"', async () => {
			output = await runUdd("phase set 4");
		});

		Then(
			'specs/roadmap.yml should set current_phase to "agent-intelligence"',
			async () => {
				const roadmap = await fs.readFile("specs/roadmap.yml", "utf-8");
				expect(roadmap).toContain("current_phase: agent-intelligence");
			},
		);

		And(
			'"udd phase current" should show "Phase 4: Agent Intelligence"',
			async () => {
				try {
					output = await runUdd("phase current");
					expect(output.stdout).toContain("Phase 4: Agent Intelligence");
				} finally {
					await cleanupProject();
				}
			},
		);
	});

	Scenario(
		"Warn on future phase feature tags",
		({ Given, And, When, Then }) => {
			let output: { stdout: string; stderr: string };

			Given("specs/roadmap.yml specifies current phase 3", async () => {
				await startProject();
			});

			And("a feature file is tagged @phase:4", async () => {
				await fs.writeFile(
					path.join("specs/features/example/future.feature"),
					"@phase:4\nFeature: Future\n\n  Scenario: Future work\n",
				);
			});

			When('I run "udd phase check"', async () => {
				output = await runUdd("phase check");
			});

			Then(
				'the output should warn "Phase 4 work detected but current phase is 3"',
				() => {
					expect(output.stdout).toContain(
						"Phase 4 work detected but current phase is 3",
					);
				},
			);

			And("the command should exit successfully", () => {
				try {
					expect(output.stderr).toBe("");
				} finally {
					void cleanupProject();
				}
			});
		},
	);

	Scenario(
		"Fail strict checks for invalid phase tags",
		({ Given, And, When, Then }) => {
			let error: { stdout: string; stderr: string; code: number } | undefined;

			Given("specs/roadmap.yml defines phases 1 through 4", async () => {
				await startProject();
			});

			And("a feature file is tagged @phase:0", async () => {
				await fs.writeFile(
					path.join("specs/features/example/invalid.feature"),
					"@phase:0\nFeature: Invalid\n\n  Scenario: Invalid phase\n",
				);
			});

			When('I run "udd phase check --strict"', async () => {
				try {
					await runUdd("phase check --strict");
				} catch (caught) {
					error = caught as { stdout: string; stderr: string; code: number };
				}
			});

			Then("the command should fail", () => {
				expect(error?.code).toBe(1);
			});

			And(
				'the output should explain "Feature phase tags must be positive integers"',
				() => {
					try {
						expect(error?.stdout).toContain(
							"Feature phase tags must be positive integers",
						);
					} finally {
						void cleanupProject();
					}
				},
			);
		},
	);
});
