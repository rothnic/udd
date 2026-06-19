import fs from "node:fs/promises";
import path from "node:path";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { expect } from "vitest";
import { rootDir } from "../../../../utils.js";

const feature = await loadFeature(
	"specs/features/udd/agent/wip_support/agent_wip_awareness.feature",
);

describeFeature(feature, ({ Scenario }) => {
	Scenario(
		"Agent understands deferred scenarios are intentionally deferred",
		({ Given, When, Then, And }) => {
			let promptContent = "";

			Given("the iterate prompt defines phase accountability", async () => {
				promptContent = await fs.readFile(
					path.join(rootDir, ".github/prompts/iterate.prompt.md"),
					"utf-8",
				);
			});

			When("the agent analyzes project status", () => {
				expect(promptContent).toContain("udd status");
			});

			Then(
				"the agent should recognize deferred work as planned for future phases",
				() => {
					expect(promptContent).toContain("Deferred Items");
					expect(promptContent).toContain("future phases");
				},
			);

			And(
				"the agent should prioritize current-phase blockers before future-phase work",
				() => {
					expect(promptContent).toContain("Current phase has blockers");
					expect(promptContent).toContain("Focus on clearing blockers");
				},
			);
		},
	);
});
