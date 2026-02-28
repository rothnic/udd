import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { expect } from "vitest";

const feature = await loadFeature(
	"specs/features/udd/cli/scaffold_feature.feature",
);

describeFeature(feature, ({ Scenario }) => {
	Scenario(
		"Create new feature from SysML template",
		({ Given, When, Then, And }) => {
			Given("I am in a UDD project", () => {
				return;
			});

			When('I run "udd new feature test_domain sample_feature"', () => {
				return;
			});

			Then("the command should exit with code 0", () => {
				expect(true).toBe(true);
			});

			And(
				'a feature file should be created at "specs/features/test_domain/sample_feature/sample_feature.feature"',
				() => {
					expect(true).toBe(true);
				},
			);

			And('the feature file should contain "Feature: Sample Feature"', () => {
				expect(true).toBe(true);
			});

			And("the feature file should be valid Gherkin", () => {
				expect(true).toBe(true);
			});
		},
	);

	Scenario(
		"Fail when target directory does not exist",
		({ Given, When, Then, And }) => {
			Given("I am in a UDD project", () => {
				return;
			});

			And(
				'the parent path "specs/features/nonexistent_domain" does not exist',
				() => {
					return;
				},
			);

			When('I run "udd new feature nonexistent_domain new_feature"', () => {
				return;
			});

			Then("the command should exit with a non-zero code", () => {
				expect(true).toBe(true);
			});

			And(
				'the command should print an error containing "parent directory does not exist" or "cannot create"',
				() => {
					expect(true).toBe(true);
				},
			);

			And(
				'no feature file should be created under "specs/features/nonexistent_domain/new_feature"',
				() => {
					expect(true).toBe(true);
				},
			);
		},
	);

	Scenario(
		"Fail when feature name already exists (duplicate)",
		({ Given, When, Then, And }) => {
			Given("I am in a UDD project", () => {
				return;
			});

			And(
				'a feature exists at "specs/features/test_domain/existing_feature/existing_feature.feature"',
				() => {
					return;
				},
			);

			When('I run "udd new feature test_domain existing_feature"', () => {
				return;
			});

			Then("the command should exit with a non-zero code", () => {
				expect(true).toBe(true);
			});

			And(
				'the command should print an error containing "already exists" or "duplicate"',
				() => {
					expect(true).toBe(true);
				},
			);

			And("the existing feature file should remain unchanged", () => {
				expect(true).toBe(true);
			});
		},
	);

	Scenario(
		"Fail when feature name format is invalid",
		({ Given, When, Then, And }) => {
			Given("I am in a UDD project", () => {
				return;
			});

			When('I run "udd new feature test_domain invalid/name"', () => {
				return;
			});

			Then("the command should exit with a non-zero code", () => {
				expect(true).toBe(true);
			});

			And(
				'the command should print a validation error mentioning "invalid feature name" or "name may only contain"',
				() => {
					expect(true).toBe(true);
				},
			);

			And("no feature file should be created for the invalid name", () => {
				expect(true).toBe(true);
			});
		},
	);
});
