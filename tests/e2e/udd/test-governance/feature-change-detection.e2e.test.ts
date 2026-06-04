import fs from "node:fs/promises";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { expect } from "vitest";
import { runUdd, withTempDir } from "../../../utils.js";

const feature = await loadFeature(
	"specs/features/udd/test-governance/feature-change-detection.feature",
);

interface ImpactResult {
	affected: {
		use_cases: Array<Record<string, unknown>>;
		scenarios: Array<Record<string, unknown>>;
		tests: Array<Record<string, unknown>>;
		goals: Array<Record<string, unknown>>;
	};
	resolved: Array<Record<string, unknown>>;
	recommended_commands: string[];
	regression_markers: Array<Record<string, unknown>>;
}

// @feature udd/test-governance/feature-change-detection.feature
describeFeature(feature, ({ Background, Scenario }) => {
	Background(({ Given }) => {
		Given(
			"the UDD project has traceable use cases, scenarios, and tests",
			() => {
				// The repository fixture itself is the traceable project under test.
			},
		);
	});

	Scenario(
		"Recommend targeted verification for changed feature, use case, test, goal, and untraceable paths",
		({ When, Then }) => {
			let impact = {} as ImpactResult;

			When("I analyze impact for a changed feature file", async () => {
				impact = JSON.parse(
					(
						await runUdd(
							"impact specs/features/udd/recovery/plan_repair.feature --json",
						)
					).stdout,
				);
			});

			Then(
				"the impact output includes affected behavior and a targeted test command",
				() => {
					expect(impact.affected.scenarios).toContainEqual(
						expect.objectContaining({
							source: expect.objectContaining({
								path: "specs/features/udd/recovery/plan_repair.feature",
							}),
						}),
					);
					expect(impact.recommended_commands).toContainEqual(
						expect.stringContaining(
							"tests/e2e/udd/recovery/plan_repair.e2e.test.ts",
						),
					);
					expect(impact.regression_markers).toContainEqual(
						expect.objectContaining({
							type: "direct",
							path: "specs/features/udd/recovery/plan_repair.feature",
						}),
					);
				},
			);

			When("I analyze impact for a changed use case file", async () => {
				impact = JSON.parse(
					(await runUdd("impact specs/use-cases/recover_from_drift.yml --json"))
						.stdout,
				);
			});

			Then(
				"the impact output includes linked scenarios and test commands",
				() => {
					expect(impact.affected.use_cases).toContainEqual(
						expect.objectContaining({ id: "use_case:recover_from_drift" }),
					);
					expect(impact.affected.scenarios.length).toBeGreaterThanOrEqual(4);
					expect(impact.recommended_commands).toContainEqual(
						expect.stringContaining("tests/e2e/udd/recovery"),
					);
				},
			);

			When("I analyze impact for a changed test file", async () => {
				impact = JSON.parse(
					(
						await runUdd(
							"impact tests/e2e/udd/recovery/plan_repair.e2e.test.ts --json",
						)
					).stdout,
				);
			});

			Then(
				"the impact output traces back to the behavior contract it proves",
				() => {
					expect(impact.affected.tests).toContainEqual(
						expect.objectContaining({
							source: expect.objectContaining({
								path: "tests/e2e/udd/recovery/plan_repair.e2e.test.ts",
							}),
						}),
					);
					expect(impact.affected.scenarios).toContainEqual(
						expect.objectContaining({
							source: expect.objectContaining({
								path: "specs/features/udd/recovery/plan_repair.feature",
							}),
						}),
					);
				},
			);

			When("I analyze impact for a changed goal file", async () => {
				impact = JSON.parse(
					(
						await runUdd(
							"impact goals/017-change-impact-and-regression-upgrade.md --json",
						)
					).stdout,
				);
			});

			Then(
				"the impact output includes goal context and project-health commands",
				() => {
					expect(impact.resolved).toContainEqual(
						expect.objectContaining({
							type: "goal",
							source: expect.objectContaining({
								path: "goals/017-change-impact-and-regression-upgrade.md",
							}),
						}),
					);
					expect(impact.affected.goals).toContainEqual(
						expect.objectContaining({
							source: expect.objectContaining({
								path: "goals/017-change-impact-and-regression-upgrade.md",
							}),
						}),
					);
					expect(impact.recommended_commands).toEqual(
						expect.arrayContaining([
							"./bin/udd status --json",
							"./bin/udd lint",
						]),
					);
				},
			);

			When(
				"I analyze impact for an untraceable implementation file",
				async () => {
					impact = JSON.parse(
						(await runUdd("impact src/lib/trace-graph.ts --json")).stdout,
					);
				},
			);

			Then(
				"the impact output labels the path as untraceable with fallback validation",
				() => {
					expect(impact.regression_markers).toContainEqual(
						expect.objectContaining({
							type: "untraceable",
							path: "src/lib/trace-graph.ts",
						}),
					);
					expect(impact.recommended_commands).toContain("./bin/udd lint");
				},
			);

			When("I analyze impact for a scenario with linked proof", async () => {
				impact = JSON.parse(
					(
						await runUdd(
							"impact specs/features/udd/cli/codex_hooks.feature --json",
						)
					).stdout,
				);
			});

			Then("the impact output includes the linked test path", () => {
				expect(impact.regression_markers).toContainEqual(
					expect.objectContaining({
						type: "adjacent",
						path: "tests/e2e/udd/cli/codex_hooks.e2e.test.ts",
					}),
				);
				expect(impact.affected.tests).toContainEqual(
					expect.objectContaining({
						source: expect.objectContaining({
							path: "tests/e2e/udd/cli/codex_hooks.e2e.test.ts",
						}),
					}),
				);
				expect(impact.regression_markers).toContainEqual(
					expect.objectContaining({
						type: "direct",
						path: "specs/features/udd/cli/codex_hooks.feature",
					}),
				);
				expect(impact.recommended_commands).toContainEqual(
					expect.stringContaining("tests/e2e/udd/cli/codex_hooks.e2e.test.ts"),
				);
			});

			When("I analyze impact for a reference-product use case", async () => {
				impact = JSON.parse(
					(
						await runUdd(
							"impact examples/reference-products/task-board/specs/use-cases/capture_work.yml --json",
						)
					).stdout,
				);
			});

			Then(
				"the impact output includes reference-product scenarios and missing proof commands",
				() => {
					expect(impact.resolved).toContainEqual(
						expect.objectContaining({
							type: "use_case",
							source: expect.objectContaining({
								path: "examples/reference-products/task-board/specs/use-cases/capture_work.yml",
							}),
						}),
					);
					expect(impact.affected.scenarios).toContainEqual(
						expect.objectContaining({
							source: expect.objectContaining({
								path: "examples/reference-products/task-board/specs/features/task-board/capture/create_item.feature",
							}),
						}),
					);
					expect(impact.regression_markers).toContainEqual(
						expect.objectContaining({
							type: "missing_proof",
							path: "examples/reference-products/task-board/specs/features/task-board/capture/create_item.feature",
						}),
					);
					expect(impact.recommended_commands).toContainEqual(
						expect.stringContaining(
							"examples/reference-products/task-board/tests/e2e/task-board/capture/create_item.e2e.test.ts",
						),
					);
				},
			);

			When("I analyze impact for a scenario with missing proof", async () => {
				await withTempDir(async () => {
					await fs.mkdir("specs/use-cases", { recursive: true });
					await fs.mkdir("specs/features/demo", { recursive: true });
					await fs.writeFile(
						"specs/use-cases/demo.yml",
						[
							"id: demo",
							"name: Demo",
							"outcomes:",
							"  - description: Demo behavior is specified.",
							"    scenario_paths:",
							"      - demo/missing",
							"",
						].join("\n"),
					);
					await fs.writeFile(
						"specs/features/demo/missing.feature",
						[
							"Feature: Missing proof",
							"  Scenario: Missing proof",
							"    Given specified behavior has no linked proof",
							"",
						].join("\n"),
					);
					impact = JSON.parse(
						(await runUdd("impact specs/features/demo/missing.feature --json"))
							.stdout,
					);
				});
			});

			Then(
				"the impact output recommends the expected missing test path",
				() => {
					expect(impact.regression_markers).toContainEqual(
						expect.objectContaining({
							type: "missing_proof",
							path: "specs/features/demo/missing.feature",
						}),
					);
					expect(impact.recommended_commands).toContain(
						"npm test -- --run tests/e2e/demo/missing.e2e.test.ts",
					);
				},
			);
		},
	);
});
