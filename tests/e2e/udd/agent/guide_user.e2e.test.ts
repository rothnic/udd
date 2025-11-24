import fs from "node:fs/promises";
import path from "node:path";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { expect } from "vitest";
import { rootDir } from "../../../utils.js";

const feature = await loadFeature(
	"specs/features/udd/agent/guide_user.feature",
);

describeFeature(feature, ({ Scenario }) => {
	Scenario("Guide User through UDD process", ({ Given, When, Then, And }) => {
		let agentConfigContent: string;

		Given(
			'I have an agent configuration file ".github/agents/udd.agent.md"',
			async () => {
				await fs.access(path.join(rootDir, ".github/agents/udd.agent.md"));
			},
		);

		When("I read the agent configuration", async () => {
			agentConfigContent = await fs.readFile(
				path.join(rootDir, ".github/agents/udd.agent.md"),
				"utf-8",
			);
		});

		Then('it should contain "The UDD Workflow"', () => {
			expect(agentConfigContent).toContain("The UDD Workflow");
		});

		And('it should contain "Guide the user to the next step"', () => {
			expect(agentConfigContent).toContain("Guide the user to the next step");
		});
	});
});
