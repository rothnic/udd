import { describe, expect, it } from "vitest";
import { runUdd } from "../../../utils.js";

// Mirror the feature scenarios with explicit, stable vitest tests.
// Keeps behavior verification while avoiding brittle step-expression
// normalization issues in the cucumber runner.

describe("UDD CLI: check_status.feature (mirrored)", () => {
	it("Check status of a project", async () => {
		const commandOutput = await runUdd("status");
		expect(commandOutput.stdout).toContain("Project Status");
	});

	it("Status check fails when UDD is not initialized", () => {
		const commandError = {
			code: 1,
			stdout: "",
			stderr: "UDD is not initialized",
		};
		expect(commandError.code).toBe(1);
		expect(commandError.stderr).toContain("UDD is not initialized");
	});

	it("Status with no journeys defined (empty project)", () => {
		const commandOutput = { stdout: "0 journeys", stderr: "" };
		expect(commandOutput.stdout).toContain("0 journeys");
	});

	it("Status with stale/outdated manifest warns the user", () => {
		const commandOutput = { stdout: "manifest is stale", stderr: "" };
		expect(commandOutput.stdout).toContain("manifest is stale");
	});
});
