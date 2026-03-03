import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { expect } from "vitest";
import { runUdd } from "../../../../utils.js";

const feature = await loadFeature(
	"specs/features/udd/dev-experience/test_discovery/editor_status.feature",
);

describeFeature(feature, ({ Scenario }) => {
	Scenario("Editor Status", ({ Given, When, Then }) => {
		Given("I am in the right state", () => {
			// TODO: Implement
		});

		When("I do something", () => {
			// TODO: Implement
		});

		Then("something happens", () => {
			// Use the CLI to get test-discovery status and assert the output
			return runUdd("test-discovery status").then((res: any) => {
				// Output should mention detected editors or a neutral message
				expect(res.stdout).toMatch(
					/editor|VS Code|No editor detected|detected/i,
				);
			});
		});
	});
});
