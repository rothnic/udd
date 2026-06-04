import fs from "node:fs/promises";
import { expect, test } from "vitest";
import {
	buildAgentEvidencePackage,
	recommendNextAgentWork,
} from "../../src/lib/agent-integration.js";
import type { DiagnosticReport } from "../../src/lib/diagnostics.js";
import type { ProjectStatus } from "../../src/lib/status.js";
import { withTempDir } from "../utils.js";

test("agent next work treats warning diagnostics as blockers", () => {
	const status: ProjectStatus = {
		git: {
			branch: "test",
			clean: true,
			modified: 0,
			staged: 0,
			untracked: 0,
		},
		current_phase: 3,
		phases: { "3": "Agent Integration" },
		active_features: ["udd/example"],
		features: {
			"udd/example": {
				path: "udd/example",
				scenarios: {
					current: {
						e2e: "stale",
						isDeferred: false,
						phase: 3,
					},
				},
				requirements: {},
			},
		},
		use_cases: {},
		orphaned_scenarios: [],
		journeys: {},
		hasProductDir: true,
	};
	const report: DiagnosticReport = {
		status: "drift-detected",
		healthy: false,
		lastCheck: "2026-06-03T00:00:00.000Z",
		summary: {
			critical: 0,
			warning: 1,
			info: 0,
			total: 1,
		},
		conditions: [],
		issues: [
			{
				id: "warning:orphan_scenario:specs/features/orphan.feature",
				severity: "warning",
				type: "orphan_scenario",
				file: "specs/features/orphan.feature",
				message: "Scenario is not referenced by source-of-truth artifacts.",
				recommendation: "Link the scenario to a use case outcome or remove it.",
			},
		],
	};

	const next = recommendNextAgentWork(
		status,
		report,
		new Date("2026-06-03T00:00:00.000Z"),
	);

	expect(next.recommended).toBe("specs/features/orphan.feature");
	expect(next.blocking).toHaveLength(1);
	expect(next.blocking[0]).toMatchObject({
		severity: "warning",
		type: "orphan_scenario",
	});
});

test("agent next work ranks user-visible stale scenarios above generated-state cleanup", () => {
	const status: ProjectStatus = {
		git: {
			branch: "test",
			clean: true,
			modified: 0,
			staged: 0,
			untracked: 0,
		},
		current_phase: 3,
		phases: { "3": "Agent Integration" },
		active_features: ["udd/example"],
		features: {
			"udd/example": {
				path: "udd/example",
				scenarios: {
					current: {
						e2e: "stale",
						isDeferred: false,
						phase: 3,
					},
				},
				requirements: {},
			},
		},
		use_cases: {},
		orphaned_scenarios: [],
		journeys: {},
		hasProductDir: true,
	};
	const report: DiagnosticReport = {
		status: "drift-detected",
		healthy: false,
		lastCheck: "2026-06-03T00:00:00.000Z",
		summary: {
			critical: 0,
			warning: 1,
			info: 0,
			total: 1,
		},
		conditions: [],
		issues: [
			{
				id: "warning:journey_stale:product/journeys/example.md",
				severity: "warning",
				type: "journey_stale",
				file: "product/journeys/example.md",
				message: "Journey has changed since generated metadata was written.",
				recommendation: "Run 'udd sync' if optional journey context matters.",
			},
		],
	};

	const next = recommendNextAgentWork(
		status,
		report,
		new Date("2026-06-03T00:00:00.000Z"),
	);

	expect(next.recommended).toBe("udd/example/current");
	expect(next.user_impact).toContain("current behavior");
	expect(next.verification_commands).toContain(
		"npm test -- --run tests/e2e/udd/example/current.e2e.test.ts",
	);
	expect(next.blocking).toContainEqual(
		expect.objectContaining({ type: "journey_stale" }),
	);
});

test("agent next work emits pause reason for missing executable proof", () => {
	const status: ProjectStatus = {
		git: {
			branch: "test",
			clean: true,
			modified: 0,
			staged: 0,
			untracked: 0,
		},
		current_phase: 3,
		phases: { "3": "Agent Integration" },
		active_features: ["udd/example"],
		features: {
			"udd/example": {
				path: "udd/example",
				scenarios: {
					current: {
						e2e: "missing",
						isDeferred: false,
						phase: 3,
					},
				},
				requirements: {},
			},
		},
		use_cases: {},
		orphaned_scenarios: [],
		journeys: {},
		hasProductDir: true,
	};
	const report: DiagnosticReport = {
		status: "healthy",
		healthy: true,
		lastCheck: "2026-06-03T00:00:00.000Z",
		summary: {
			critical: 0,
			warning: 0,
			info: 0,
			total: 0,
		},
		conditions: [],
		issues: [],
	};

	const next = recommendNextAgentWork(
		status,
		report,
		new Date("2026-06-03T00:00:00.000Z"),
	);

	expect(next.blocks_work).toBe(true);
	expect(next.pause_reasons).toContainEqual(
		expect.objectContaining({
			type: "unverified_test_claim",
			source: "specs/features/udd/example/current.feature",
		}),
	);
});

test("agent evidence includes changed-file impact recommendations", async () => {
	const status: ProjectStatus = {
		git: {
			branch: "test",
			clean: false,
			modified: 1,
			staged: 0,
			untracked: 0,
		},
		current_phase: 3,
		phases: { "3": "Agent Integration" },
		active_features: [],
		features: {},
		use_cases: {},
		orphaned_scenarios: [],
		journeys: {},
		hasProductDir: true,
	};
	const report: DiagnosticReport = {
		status: "healthy",
		healthy: true,
		lastCheck: "2026-06-03T00:00:00.000Z",
		summary: {
			critical: 0,
			warning: 0,
			info: 0,
			total: 0,
		},
		conditions: [],
		issues: [],
	};

	const evidence = await buildAgentEvidencePackage(status, report, {
		changedFiles: [
			"specs/features/udd/recovery/plan_repair.feature",
			"src/lib/agent-integration.ts",
			"docs\\agent-operator-contract.md",
		],
		verification: [
			{ command: "./bin/udd status", status: "passed" },
			{ command: "npm test -- --run", status: "not_run" },
		],
		now: new Date("2026-06-03T00:00:00.000Z"),
	});

	expect(evidence.changed_file_impacts).toContainEqual(
		expect.objectContaining({
			path: "specs/features/udd/recovery/plan_repair.feature",
			recommended_commands: expect.arrayContaining([
				expect.stringContaining(
					"tests/e2e/udd/recovery/plan_repair.e2e.test.ts",
				),
			]),
		}),
	);
	expect(evidence.changed_file_impacts).toContainEqual(
		expect.objectContaining({
			path: "src/lib/agent-integration.ts",
			recommended_commands: expect.arrayContaining([
				expect.stringContaining("tests/lib/agent-integration.test.ts"),
			]),
		}),
	);
	expect(evidence.changed_file_impacts).toContainEqual(
		expect.objectContaining({
			path: "docs\\agent-operator-contract.md",
			recommended_commands: expect.arrayContaining([
				expect.stringContaining(
					"tests/e2e/opencode/tools/agent_handoff_evidence.e2e.test.ts",
				),
			]),
		}),
	);
	expect(evidence.handoff.verification_commands).toContain("./bin/udd status");
	expect(evidence.handoff.verification_commands).not.toContain(
		"npm test -- --run",
	);
});

test("agent evidence uses one canonical governance next action", async () => {
	const status: ProjectStatus = {
		git: {
			branch: "test",
			clean: true,
			modified: 0,
			staged: 0,
			untracked: 0,
		},
		current_phase: 3,
		phases: { "3": "Agent Integration" },
		active_features: [],
		features: {},
		use_cases: {},
		orphaned_scenarios: [],
		journeys: {},
		hasProductDir: true,
	};
	const report: DiagnosticReport = {
		status: "healthy",
		healthy: true,
		lastCheck: "2026-06-04T00:00:00.000Z",
		summary: {
			critical: 0,
			warning: 0,
			info: 0,
			total: 0,
		},
		conditions: [],
		issues: [],
	};

	await withTempDir(async () => {
		await fs.mkdir("specs/features/foo", { recursive: true });
		await fs.writeFile(
			"specs/features/foo/bar.feature",
			"Feature: Bar\n\n  Scenario: Bar\n    Given bar exists\n",
		);
		await fs.mkdir("tests/foo", { recursive: true });
		await fs.writeFile(
			"tests/foo/bar.e2e.test.ts",
			`// @fea${"ture"} foo/bar.feature
import { expect, test } from "vitest";
test("bar", () => {
  expect(true).toBe(true);
});
`,
		);

		const evidence = await buildAgentEvidencePackage(status, report, {
			goalPath: "goals/015-test-governance-upgrade.md",
			now: new Date("2026-06-04T00:00:00.000Z"),
		});
		const firstGovernanceFinding =
			evidence.test_governance.blocking_findings[0];

		expect(firstGovernanceFinding).toBeDefined();
		expect(evidence.test_governance.next_action).toBe(
			firstGovernanceFinding.message,
		);
		expect(evidence.handoff.next_action).toBe(
			evidence.test_governance.next_action,
		);
	});
});

test("agent evidence prioritizes critical pause reasons over governance findings", async () => {
	const status: ProjectStatus = {
		git: {
			branch: "test",
			clean: true,
			modified: 0,
			staged: 0,
			untracked: 0,
		},
		current_phase: 3,
		phases: { "3": "Agent Integration" },
		active_features: [],
		features: {},
		use_cases: {},
		orphaned_scenarios: [],
		journeys: {},
		hasProductDir: false,
	};
	const report: DiagnosticReport = {
		status: "uninitialized",
		healthy: false,
		lastCheck: "2026-06-04T00:00:00.000Z",
		summary: {
			critical: 1,
			warning: 0,
			info: 0,
			total: 1,
		},
		conditions: [],
		issues: [
			{
				id: "critical:product_missing:product",
				severity: "critical",
				type: "product_missing",
				file: "product",
				message: "Product directory is missing.",
				recommendation: "Run `udd init` or restore product/.",
			},
		],
	};

	await withTempDir(async () => {
		await fs.mkdir("specs/features/foo", { recursive: true });
		await fs.writeFile(
			"specs/features/foo/bar.feature",
			"Feature: Bar\n\n  Scenario: Bar\n    Given bar exists\n",
		);
		await fs.mkdir("tests/foo", { recursive: true });
		await fs.writeFile(
			"tests/foo/bar.e2e.test.ts",
			`// @fea${"ture"} foo/bar.feature
import { expect, test } from "vitest";
test("bar", () => {
  expect(true).toBe(true);
});
`,
		);

		const evidence = await buildAgentEvidencePackage(status, report, {
			goalPath: "goals/015-test-governance-upgrade.md",
			now: new Date("2026-06-04T00:00:00.000Z"),
		});

		expect(evidence.test_governance.next_action).toContain("Stub assertions");
		expect(evidence.handoff.next_action).toBe(
			"Run `udd init` or restore product/.",
		);
	});
});
