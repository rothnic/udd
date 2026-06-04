import { expect, test } from "vitest";
import { recommendNextAgentWork } from "../../src/lib/agent-integration.js";
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
