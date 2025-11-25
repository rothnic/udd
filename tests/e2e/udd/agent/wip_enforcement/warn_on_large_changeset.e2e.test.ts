import * as fs from "node:fs";
import * as path from "node:path";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { expect } from "vitest";

const feature = await loadFeature(
	"specs/features/udd/agent/wip_enforcement/warn_on_large_changeset.feature",
);

describeFeature(feature, ({ Scenario }) => {
	Scenario("Warn On Large Changeset", ({ Given, When, Then, And }) => {
		let promptContent: string;

		Given("the iterate prompt defines WIP limits", () => {
			const promptPath = path.join(
				process.cwd(),
				".github/prompts/iterate.prompt.md",
			);
			promptContent = fs.readFileSync(promptPath, "utf-8");
			// The prompt should mention git status and uncommitted changes
			expect(promptContent).toContain("uncommitted");
		});

		When("the agent runs the iteration checklist", () => {
			// Agent behavior - verified by prompt content defining the checklist
			expect(promptContent).toContain("Iteration Checklist");
		});

		Then(
			"the agent should warn if uncommitted changes exceed the threshold",
			() => {
				// The prompt should define what to do with uncommitted changes
				expect(promptContent).toContain("git status");
				expect(promptContent).toContain("Commit them now");
			},
		);

		And("the agent should encourage committing in logical chunks", () => {
			// The prompt should encourage small, logical commits
			expect(promptContent).toContain("logical chunks");
			expect(promptContent).toContain("Small Commits");
		});
	});
});
