import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";

const feature = await loadFeature(
	"specs/features/my_area/my_feature/my_scenario.feature",
);

describeFeature(
	feature,
	({
		Scenario,
		BeforeAllScenarios,
		AfterAllScenarios,
		BeforeEachScenario,
		AfterEachScenario,
	}) => {
		BeforeAllScenarios(() => {});
		AfterAllScenarios(() => {});
		BeforeEachScenario(() => {});
		AfterEachScenario(() => {});

		Scenario(`My Scenario`, ({ Given, When, Then }) => {
			Given(`I am in the right state`, () => {});
			When(`I do something`, () => {});
			Then(`something happens`, () => {});
		});
	},
);
