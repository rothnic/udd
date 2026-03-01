import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { expect } from "vitest";
import { runUdd } from "../../../utils.js";

const feature = await loadFeature(
	"specs/features/udd/cli/lint_valid_specs.feature",
);

describeFeature(feature, ({ Scenario }) => {
	Scenario("Linting a valid spec structure", ({ Given, When, Then, And }) => {
		let cmdResult: { stdout: string; stderr: string } | undefined;
		let cmdErr: any;

		Given("I have a valid UDD spec structure", () => {
			// Assume repository already contains valid specs (no-op)
			return;
		});

		When('I run "udd lint"', async () => {
			try {
				const res = await runUdd("lint");
				cmdResult = {
					stdout: String(res.stdout || ""),
					stderr: String(res.stderr || ""),
				};
			} catch (err: any) {
				// exec throws on non-zero exit; capture for assertions
				cmdErr = err as { code?: number; stdout?: string; stderr?: string };
				if (cmdErr) {
					cmdResult = {
						stdout: String(cmdErr.stdout || ""),
						stderr: String(cmdErr.stderr || ""),
					};
				}
			}
		});

		Then("the command should exit with code 0", () => {
			// If exec threw, ensure we fail the test with useful output
			expect(cmdErr).toBeUndefined();
		});

		And('the output should contain "All specs are valid"', () => {
			expect(cmdResult).toBeDefined();
			const combined =
				(cmdResult!.stdout || "") + "\n" + (cmdResult!.stderr || "");
			expect(combined).toContain("All specs are valid");
		});
	});
});
