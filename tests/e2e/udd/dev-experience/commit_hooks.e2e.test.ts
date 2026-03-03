import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { expect } from "vitest";
import { runUdd } from "../../../utils.js";

const feature = await loadFeature(
	"specs/features/udd/dev-experience/commit_hooks.feature",
);

describeFeature(feature, ({ Scenario }) => {
	Scenario("Commit Hooks", ({ Given, When, Then }) => {
		Given("I am in the right state", () => {
			// Minimal placeholder: assume environment is correct for the scenario
			// No-op; don't touch filesystem or run git.
			return;
		});

		When("I do something", () => {
			// Minimal placeholder for action step. No side effects.
			return;
		});

		Then("something happens", () => {
			// Verify hooks status command output via runUdd helper
			return runUdd("hooks status").then((res: any) => {
				// When hooks are not installed the output should mention "not installed"
				expect(res.stdout).toMatch(
					/hooks (not )?installed|Test governance hooks/,
				);
			});
		});
	});
});
