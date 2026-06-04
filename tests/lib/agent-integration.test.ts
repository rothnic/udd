import { expect, test } from "vitest";
import {
	buildAgentEvidencePackage,
	recommendNextAgentWork,
} from "../../src/lib/agent-integration.js";
import type { DiagnosticReport } from "../../src/lib/diagnostics.js";
import type { ProjectStatus } from "../../src/lib/status.js";

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
		changedFiles: ["specs/features/udd/recovery/plan_repair.feature"],
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
});
