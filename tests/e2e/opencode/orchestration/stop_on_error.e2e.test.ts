import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";

const feature = await loadFeature(
	"specs/features/opencode/orchestration/stop_on_error.feature",
);

describeFeature(feature, ({ Scenario }) => {
	Scenario("Stop on error state", ({ Given, When, Then, And }) => {
		Given("a UDD project with an unrecoverable error", () => {
			throw new Error("Not implemented");
		});

		And("OpenCode is configured with the UDD orchestrator plugin", () => {
			throw new Error("Not implemented");
		});

		When("the agent encounters an error during iteration", () => {
			throw new Error("Not implemented");
		});

		Then("the agent should stop iterating", () => {
			throw new Error("Not implemented");
		});

		And("report the error state with details", () => {
			throw new Error("Not implemented");
		});

		And("preserve the session for debugging", () => {
			throw new Error("Not implemented");
		});
	});
});
