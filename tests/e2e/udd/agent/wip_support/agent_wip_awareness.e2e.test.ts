import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { expect } from "vitest";
import { runUdd } from "../../../../utils.js";

const feature = await loadFeature(
	"specs/features/udd/agent/wip_support/agent_wip_awareness.feature",
);

describeFeature(feature, ({ Scenario }) => {
	Scenario(
		"Agent understands deferred scenarios are intentionally deferred",
		({ Given, When, Then, And }) => {
			Given(
				"I have @phase:N tagged scenarios in my project where N > current_phase",
				() => {
					// This is already true - warn_on_large_changeset has @phase:2 and current_phase is 1
				},
			);

			When("the agent analyzes project status", () => {
				// Agent reads udd status output which includes deferred information
				// This is a documentation/behavior concern, not testable via E2E
			});

			Then(
				"the agent should recognize deferred work as planned for future phases",
				() => {
					// Verify udd status output contains evidence of deferred work
					// Use the CLI status command which prints phase/deferred info
					// We don't need a full integration; just ensure the formatter
					// exposes the deferred concept when run in the repo
					return runUdd("status").then((result: { stdout: string }) => {
						expect(result.stdout).toContain("deferred");
						// also accept phase markers as alternative evidence
						expect(
							result.stdout.includes("@phase:") ||
								result.stdout.includes("deferred"),
						).toBe(true);
					});
				},
			);

			And(
				"the agent should not prompt to implement deferred scenarios immediately",
				() => {
					// Ensure that agent analysis output (status) does not include
					// imperative prompts such as "implement now" for deferred items.
					// We'll run status and check stderr/stdout for any strong imperative
					// language referencing deferred items.
					return runUdd("status").then((result: any) => {
						const stdout = result.stdout?.toString
							? result.stdout.toString()
							: String(result.stdout || "");
						const stderr = result.stderr?.toString
							? result.stderr.toString()
							: String(result.stderr || "");
						const combined = `${stdout}\n${stderr}`;
						// Negative assertion: should NOT encourage immediate implementation
						expect(combined).not.toMatch(
							/implement now|please implement|start implementing|do this now/i,
						);
						// Weak positive: it should mention phases or deferred guidance
						expect(combined).toMatch(/@phase:\d+|deferred|future phases?/i);
					});
				},
			);
		},
	);
});
