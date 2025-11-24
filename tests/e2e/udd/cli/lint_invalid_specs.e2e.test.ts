import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { expect } from "vitest";

const feature = await loadFeature(
	"specs/features/udd/cli/lint_invalid_specs.feature",
);

describeFeature(feature, ({ Scenario }) => {
	Scenario("Lint Invalid Specs", ({ Given, When, Then }) => {
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
