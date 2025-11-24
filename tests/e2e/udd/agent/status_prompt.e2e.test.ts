import fs from "node:fs/promises";
import path from "node:path";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { expect } from "vitest";
import { rootDir } from "../../../utils.js";

const feature = await loadFeature(
	"specs/features/udd/agent/status_prompt.feature",
);

describeFeature(feature, ({ Scenario }) => {
	Scenario("Status Prompt", ({ Given, When, Then, And }) => {
		let promptContent: string;

		Given(
			'I have a prompt file ".github/prompts/status.prompt.md"',
			async () => {
				await fs.access(path.join(rootDir, ".github/prompts/status.prompt.md"));
			},
		);

		When("I read the prompt file", async () => {
			promptContent = await fs.readFile(
				path.join(rootDir, ".github/prompts/status.prompt.md"),
				"utf-8",
			);
		});

		Then('it should contain "udd status"', () => {
			expect(promptContent).toContain("udd status");
		});

		And('it should contain "command"', () => {
			expect(promptContent).toContain("command");
		});
	});
});
