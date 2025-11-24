import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { expect } from "vitest";
import { runUdd } from "../../../../utils.js";

const feature = await loadFeature(
	"specs/features/udd/cli/wip_support/status_shows_wip.feature",
);

describeFeature(feature, ({ Scenario }) => {
	Scenario(
		"Status command shows deferred items separately",
		({ Given, When, Then, And }) => {
			let statusOutput: { stdout: string; stderr: string };

			Given(
				"I have outcomes with @phase:N scenarios where N > current_phase",
				() => {
					// The manage_wip use case has warn_on_large_changeset which is @phase:2
					// and current_phase is 1
				},
			);

			When('I run "udd status"', async () => {
				statusOutput = await runUdd("status");
			});

			Then("deferred outcomes should show with a blue diamond icon", () => {
				// The output should contain the blue diamond (◇) for deferred outcomes
				// The exact outcome text may vary, but deferred outcomes show with ◇
				expect(statusOutput.stdout).toContain("◇");
				expect(statusOutput.stdout).toMatch(/◇.*deferred/i);
			});

			And(
				"deferred outcomes should not be counted in unsatisfied totals",
				() => {
					// Health summary should separate deferred from failures
					expect(statusOutput.stdout).toMatch(
						/outcome.*deferred.*future phase/i,
					);
				},
			);
		},
	);
});
