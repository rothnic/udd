import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { expect } from "vitest";

const feature = await loadFeature(
	"specs/features/udd/dev-experience/code_formatting.feature",
);

describeFeature(feature, ({ Scenario }) => {
	Scenario("Code Formatting", ({ Given, When, Then }) => {
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
