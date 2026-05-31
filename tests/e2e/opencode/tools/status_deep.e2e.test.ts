import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { expect } from "vitest";
import { runUdd } from "../../../utils.js";

const feature = await loadFeature(
	"specs/features/opencode/tools/status_deep.feature",
);

describeFeature(feature, ({ Scenario }) => {
	Scenario(
		"Status command returns shared project status JSON",
		({ When, Then, And }) => {
			let payload: Record<string, unknown>;

			When("the OpenCode adapter requests deep status as JSON", async () => {
				const result = await runUdd("opencode status --json");
				payload = JSON.parse(result.stdout);
			});

			Then(
				"the payload includes project identity, phase, git state, health, and scenario totals",
				() => {
					expect(payload.project).toMatchObject({ name: "udd" });
					expect(payload.phase).toMatchObject({
						current: 3,
						name: "Agent Integration",
					});
					expect(payload.git).toEqual(
						expect.objectContaining({
							branch: expect.any(String),
							clean: expect.any(Boolean),
						}),
					);
					expect(payload.health).toEqual(
						expect.objectContaining({
							status: expect.any(String),
							summary: expect.any(Object),
						}),
					);
					expect(payload.scenarios).toEqual(
						expect.objectContaining({
							total: expect.any(Number),
							passing: expect.any(Number),
							failing: expect.any(Number),
							missing: expect.any(Number),
							stale: expect.any(Number),
						}),
					);
				},
			);

			And(
				"the payload does not define Codex hook or goal-command behavior",
				() => {
					const serialized = JSON.stringify(payload);
					expect(serialized).not.toContain("install-codex");
					expect(serialized).not.toContain("/goal");
				},
			);
		},
	);
});
