import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, expect, test } from "vitest";
import {
	getCurrentPhase,
	getPhaseFromFeature,
	getPhaseNames,
	setCurrentPhase,
	validatePhaseConsistency,
} from "../../src/lib/phase.js";

let projectDir: string;

beforeEach(async () => {
	projectDir = await fs.mkdtemp(path.join(os.tmpdir(), "udd-phase-test-"));
	await fs.mkdir(path.join(projectDir, "specs/features/example"), {
		recursive: true,
	});
	await fs.writeFile(
		path.join(projectDir, "specs/roadmap.yml"),
		[
			"current_phase: current",
			"phases:",
			"  - id: foundation",
			"    name: Foundation",
			"    number: 1",
			"    status: completed",
			"  - id: current",
			"    name: Current Work",
			"    number: 2",
			"    status: active",
			"  - id: future",
			"    name: Future Work",
			"    number: 3",
			"    status: planned",
			"",
		].join("\n"),
	);
});

afterEach(async () => {
	await fs.rm(projectDir, { recursive: true, force: true });
});

test("reads current phase and phase names from roadmap", () => {
	expect(getCurrentPhase(projectDir)).toBe(2);
	expect(getPhaseNames(projectDir)).toEqual({
		"1": "Foundation",
		"2": "Current Work",
		"3": "Future Work",
	});
});

test("updates roadmap current phase by phase number", async () => {
	const updated = setCurrentPhase(projectDir, 3);
	const content = await fs.readFile(
		path.join(projectDir, "specs/roadmap.yml"),
		"utf-8",
	);

	expect(updated.currentPhase).toBe(3);
	expect(content).toContain("current_phase: future");
	expect(content).toContain("status: active");
});

test("parses phase tags before the feature declaration only", () => {
	expect(getPhaseFromFeature("@phase:4\nFeature: Example\n")).toBe(4);
	expect(
		getPhaseFromFeature("Feature: Example\n\n  @phase:4\n"),
	).toBeUndefined();
});

test("warns for future phase tags and errors for invalid tags", async () => {
	await fs.writeFile(
		path.join(projectDir, "specs/features/example/future.feature"),
		"@phase:3\nFeature: Future\n\n  Scenario: Plan\n",
	);
	await fs.writeFile(
		path.join(projectDir, "specs/features/example/invalid.feature"),
		"@phase:0\nFeature: Invalid\n\n  Scenario: Reject\n",
	);

	const report = validatePhaseConsistency(projectDir);

	expect(report.currentPhase).toBe(2);
	expect(report.issues).toEqual(
		expect.arrayContaining([
			expect.objectContaining({
				level: "warning",
				file: "specs/features/example/future.feature",
			}),
			expect.objectContaining({
				level: "error",
				file: "specs/features/example/invalid.feature",
			}),
		]),
	);
});
