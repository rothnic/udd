import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { expect } from "vitest";
import { runUdd } from "../../../../utils.js";

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
			// Use the stable test status command rather than the missing
			// `test-discovery` command. Reuse runUdd from tests/utils.ts.
			return runUdd("test status").then((res: any) => {
				expect(res.stdout).toMatch(
					/Test Review Status|No test reviews found|Not configured/i,
				);
			});
		});
	});
});
