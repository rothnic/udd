import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { expect } from "vitest";

const feature = await loadFeature(
	"specs/features/my_area/my_feature/my_scenario.feature",
);

describeFeature(feature, ({ Scenario }) => {
	Scenario("My Scenario", ({ Given, When, Then }) => {
		Given("I am in the right state", () => {
			// TODO: Implement
		});

		When("I do something", () => {
			// TODO: Implement
		});

		Then("something happens", () => {
			// TODO: Implement
			expect(true).toBe(true);
		});
	});
});
