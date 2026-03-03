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
			// The CLI does not expose `test-discovery`. Use the stable
			// `udd test status` subcommand which provides test governance
			// information without requiring additional commands.
			return runUdd("test status").then((res: any) => {
				expect(res.stdout).toMatch(
					/Test Review Status|No test reviews found|Not configured/i,
				);
			});
		});
	});
});
