import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { expect } from "vitest";
import { runUdd } from "../../../utils.js";

const feature = await loadFeature(
	"specs/features/opencode/tools/next_recommendation.feature",
);

describeFeature(feature, ({ Scenario }) => {
	Scenario(
		"Next command returns a structured recommendation",
		({ When, Then, And }) => {
			let payload: Record<string, unknown>;

			When(
				"the OpenCode adapter requests the next recommendation as JSON",
				async () => {
					const result = await runUdd("opencode next --json");
					payload = JSON.parse(result.stdout);
				},
			);

			Then(
				"the payload includes the recommended item, reason, suggested files, and blockers",
				() => {
					expect(payload).toEqual(
						expect.objectContaining({
							recommended: expect.any(String),
							reason: expect.any(String),
							suggested_files: expect.any(Array),
							blocking: expect.any(Array),
							generated_at: expect.any(String),
						}),
					);
				},
			);

			And(
				"the payload explains user impact, verification commands, and pause reasons",
				() => {
					expect(payload).toEqual(
						expect.objectContaining({
							user_impact: expect.any(String),
							blocks_work: expect.any(Boolean),
							verification_commands: expect.any(Array),
							pause_reasons: expect.any(Array),
						}),
					);
				},
			);

			And(
				"the recommendation is derived from current UDD status and diagnostics",
				() => {
					expect(payload.reason).not.toHaveLength(0);
					expect(payload.recommended).not.toBeUndefined();
				},
			);
		},
	);
});
