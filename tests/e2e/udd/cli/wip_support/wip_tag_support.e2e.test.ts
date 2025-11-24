import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { expect } from "vitest";
import { runUdd } from "../../../../utils.js";

const feature = await loadFeature(
	"specs/features/udd/cli/wip_support/wip_tag_support.feature",
);

describeFeature(feature, ({ Scenario }) => {
	Scenario(
		"Scenarios tagged @phase:N are deferred when N > current_phase",
		({ Given, When, Then, And }) => {
			let statusOutput: { stdout: string; stderr: string };

			Given("I have a scenario file with the @phase:2 tag", () => {
				// The warn_on_large_changeset.feature already has @phase:2 tag
				// This is already true in the workspace
			});

			And("the project current_phase is 1", () => {
				// VISION.md has current_phase: 1
				// This is already true in the workspace
			});

			When('I run "udd status"', async () => {
				statusOutput = await runUdd("status");
			});

			Then(
				"the health summary should not count deferred scenarios as failures",
				() => {
					// Should show "◇ X outcome(s) deferred to future phase" not "✗ X outcomes unsatisfied"
					expect(statusOutput.stdout).toContain("deferred");
					expect(statusOutput.stdout).toContain("future phase");
				},
			);

			And(
				'the scenario should show status "deferred" in feature details',
				() => {
					// Output shows "deferred [phase:2]" format for phase-tagged scenarios
					// Strip ANSI codes and check for deferred status
					const stripped = statusOutput.stdout.replace(
						// biome-ignore lint/suspicious/noControlCharactersInRegex: Stripping ANSI codes
						/\x1b\[[0-9;]*m/g,
						"",
					);
					expect(stripped).toContain("deferred");
					expect(stripped).toContain("[phase:2]");
				},
			);
		},
	);
});
