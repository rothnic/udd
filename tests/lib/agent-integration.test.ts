import { expect, test } from "vitest";
import {
	type AgentDriftState,
	buildAgentEditPlan,
	buildAgentProjectSnapshot,
	getAgentHealthLabel,
	getGoalCommandContract,
} from "../../src/lib/agent-integration.js";
import type { ProjectStatus } from "../../src/lib/status.js";

const status: ProjectStatus = {
	git: {
		branch: "codex/example",
		clean: true,
		modified: 0,
		staged: 0,
		untracked: 0,
	},
	current_phase: 3,
	phases: {
		"3": "Agent Integration",
	},
	active_features: ["opencode/tools"],
	features: {
		"opencode/tools": {
			scenarios: {
				status_deep: {
					e2e: "passing",
					isDeferred: false,
				},
				next_recommendation: {
					e2e: "missing",
					isDeferred: false,
				},
			},
			requirements: {},
		},
	},
	use_cases: {},
	orphaned_scenarios: [],
	journeys: {
		"agent-customization": {
			name: "Agent Customization",
			actor: "Developer",
			goal: "Use shared UDD integration utilities",
			scenarioCount: 2,
			scenariosMissing: 0,
			scenariosPassing: 2,
			scenariosFailing: 0,
			hash: "abc123",
			isStale: false,
		},
	},
	hasProductDir: true,
};

const drift: AgentDriftState = {
	status: "clean",
	lastCheck: "2026-05-17T00:00:00.000Z",
	summary: {
		critical: 0,
		warning: 0,
		info: 0,
		total: 0,
	},
	issues: [],
};

test("builds a vendor-neutral agent project snapshot", () => {
	const snapshot = buildAgentProjectSnapshot(
		status,
		drift,
		"/workspace/udd",
		new Date("2026-05-17T00:00:00.000Z"),
	);

	expect(snapshot.project.name).toBe("udd");
	expect(snapshot.phase.name).toBe("Agent Integration");
	expect(snapshot.journeys[0]).toMatchObject({
		name: "agent-customization",
		status: "complete",
		scenario_count: 2,
	});
	expect(snapshot.scenarios).toMatchObject({
		total: 2,
		passing: 1,
		missing: 1,
	});
	expect(snapshot.generated_at).toBe("2026-05-17T00:00:00.000Z");
});

test("reports agent health from drift state", () => {
	expect(getAgentHealthLabel(status, drift)).toBe("Healthy");

	expect(
		getAgentHealthLabel(status, {
			...drift,
			status: "drift-detected",
			summary: {
				critical: 1,
				warning: 0,
				info: 0,
				total: 1,
			},
			issues: [
				{
					id: "issue-1",
					severity: "critical",
					type: "manifest_missing",
					file: "specs/.udd/manifest.yml",
					message: "Manifest missing",
					autoFixable: true,
					requiresUserInput: false,
				},
			],
		}),
	).toBe("Critical issues");
});

test("keeps goal command contract integration neutral", () => {
	expect(getGoalCommandContract()).toMatchObject({
		command: "/goal <goal-file>",
		requiredFields: [
			"objective",
			"explicit checks",
			"measurables",
			"verification commands",
			"PR notes",
		],
		executionSteps: [
			"read goal file",
			"check current repo state",
			"build prompt-to-artifact checklist",
			"execute only that goal",
			"run explicit checks",
			"create one focused branch and PR",
			"produce PR-ready evidence summary",
			"wait for PR comments",
			"address comments relevant to the goal",
			"perform independent review",
		],
	});

	expect(
		buildAgentEditPlan([{ path: "goals/example.md", action: "read" }]),
	).toEqual([{ path: "goals/example.md", action: "read" }]);
});
