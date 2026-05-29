import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, expect, test } from "vitest";
import {
	loadUseCaseScenarioPaths,
	resolveJourneyReference,
} from "../../src/lib/trace.js";

let projectDir: string;

beforeEach(async () => {
	projectDir = await fs.mkdtemp(path.join(os.tmpdir(), "udd-trace-test-"));
	await fs.mkdir(path.join(projectDir, "specs/use-cases"), { recursive: true });
});

afterEach(async () => {
	await fs.rm(projectDir, { recursive: true, force: true });
});

test("loads scenario paths from use-case ids", async () => {
	await fs.writeFile(
		path.join(projectDir, "specs/use-cases/capture_ideas.yml"),
		[
			"id: capture_ideas",
			"name: Capture Ideas",
			"outcomes:",
			"  - description: Ideas can be added",
			"    scenarios:",
			"      - udd/cli/inbox/add_item_via_cli",
			"",
		].join("\n"),
	);

	const useCaseScenarios = await loadUseCaseScenarioPaths(projectDir);

	expect(resolveJourneyReference("capture_ideas", useCaseScenarios)).toEqual([
		"specs/features/udd/cli/inbox/add_item_via_cli.feature",
	]);
	expect(
		resolveJourneyReference(
			"specs/use-cases/capture_ideas.yml",
			useCaseScenarios,
		),
	).toEqual(["specs/features/udd/cli/inbox/add_item_via_cli.feature"]);
});

test("prefers scenario paths over scenario ids when both are present", async () => {
	await fs.writeFile(
		path.join(projectDir, "specs/use-cases/mixed_refs.yml"),
		[
			"id: mixed_refs",
			"name: Mixed References",
			"outcomes:",
			"  - description: Canonical paths win",
			"    scenario_paths:",
			"      - udd/compliance/traceability_validation",
			"    scenarios:",
			"      - traceability_validation",
			"scenario_paths:",
			"  - udd/compliance/phase-consistency-validation",
			"scenarios:",
			"  - phase-consistency-validation",
			"",
		].join("\n"),
	);

	const useCaseScenarios = await loadUseCaseScenarioPaths(projectDir);

	expect(resolveJourneyReference("mixed_refs", useCaseScenarios)).toEqual([
		"specs/features/udd/compliance/traceability_validation.feature",
		"specs/features/udd/compliance/phase-consistency-validation.feature",
	]);
});

test("keeps direct scenario references backward compatible", async () => {
	const useCaseScenarios = await loadUseCaseScenarioPaths(projectDir);

	expect(
		resolveJourneyReference(
			"specs/features/udd/cli/inbox/add_item_via_cli.feature",
			useCaseScenarios,
		),
	).toEqual(["specs/features/udd/cli/inbox/add_item_via_cli.feature"]);
});

test("returns no scenarios for unresolved use-case references", async () => {
	const useCaseScenarios = await loadUseCaseScenarioPaths(projectDir);

	expect(resolveJourneyReference("missing_use_case", useCaseScenarios)).toEqual(
		[],
	);
});
