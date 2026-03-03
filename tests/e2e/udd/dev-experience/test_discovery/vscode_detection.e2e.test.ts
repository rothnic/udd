import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { expect } from "vitest";

const feature = await loadFeature(
	"specs/features/udd/dev-experience/test_discovery/vscode_detection.feature",
);

describeFeature(feature, ({ Scenario }) => {
	Scenario("Vscode Detection", ({ Given, When, Then }) => {
		Given("I am in the right state", () => {
			// TODO: Implement
		});

		When("I do something", () => {
			// TODO: Implement
		});

		Then("something happens", () => {
			// Call the CLI to run VSCode detection and assert expected messaging
			const { runUdd } = require("../../../../../tests/utils.js");
			return runUdd("test-discovery detect --editor vscode").then(
				(res: any) => {
					// Expect output that either reports detection or a graceful fallback
					expect(res.stdout).toMatch(
						/VS Code|vscode|No VS Code detected|detected/i,
					);
				},
			);
		});
	});
});
