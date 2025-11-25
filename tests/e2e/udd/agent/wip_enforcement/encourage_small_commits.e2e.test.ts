import * as fs from "node:fs";
import * as path from "node:path";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { expect } from "vitest";

const feature = await loadFeature(
	"specs/features/udd/agent/wip_enforcement/encourage_small_commits.feature",
);

describeFeature(feature, ({ Scenario }) => {
	Scenario("Encourage Small Commits", ({ Given, When, Then, And }) => {
		let promptContent: string;

		Given("the iterate prompt defines commit guidelines", () => {
			const promptPath = path.join(
				process.cwd(),
				".github/prompts/iterate.prompt.md",
			);
			promptContent = fs.readFileSync(promptPath, "utf-8");
			// The prompt should have commit guidelines
			expect(promptContent).toContain("Auto-Commit Strategy");
		});

		When("the agent makes changes", () => {
			// Agent behavior - the prompt defines when to commit
			expect(promptContent).toContain("Commit early and often");
		});

		Then("the agent should commit in small logical chunks", () => {
			// The prompt should specify logical grouping
			expect(promptContent).toContain("group changes logically");
		});

		And("the agent should use meaningful commit prefixes", () => {
			// The prompt should define commit prefixes
			expect(promptContent).toContain("Commit message prefixes");
			expect(promptContent).toContain("spec:");
			expect(promptContent).toContain("feat:");
			expect(promptContent).toContain("test:");
			expect(promptContent).toContain("chore:");
		});
	});
});
