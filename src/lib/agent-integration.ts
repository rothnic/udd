import type { ProjectStatus } from "./status.js";

export interface AgentDriftIssue {
	id: string;
	severity: "critical" | "warning" | "info";
	type: string;
	file: string;
	message: string;
	autoFixable: boolean;
	requiresUserInput?: boolean;
}

export interface AgentDriftState {
	status: "clean" | "drift-detected";
	lastCheck?: string;
	summary: {
		critical: number;
		warning: number;
		info: number;
		total: number;
	};
	issues: AgentDriftIssue[];
}

export interface AgentProjectSnapshot {
	project: {
		name: string;
		root: string;
	};
	phase: {
		current: number;
		name: string;
		all: Record<string, string>;
	};
	journeys: Array<{
		name: string;
		display_name: string;
		actor: string;
		goal: string;
		status: "incomplete" | "stale" | "complete";
		scenario_count: number;
		scenarios_missing: number;
		scenarios_passing: number;
		is_stale: boolean;
	}>;
	scenarios: ScenarioTotals;
	issues: Array<{
		id: string;
		severity: AgentDriftIssue["severity"];
		type: AgentDriftIssue["type"];
		file: string;
		message: string;
		auto_fixable: boolean;
	}>;
	health: {
		status: AgentDriftState["status"];
		summary: AgentDriftState["summary"];
	};
	generated_at: string;
}

export interface ScenarioTotals {
	total: number;
	passing: number;
	failing: number;
	missing: number;
	stale: number;
}

export interface GoalCommandContract {
	command: "/goal <goal-file>";
	requiredFields: string[];
	executionSteps: string[];
	prSummaryFields: string[];
}

export function getScenarioTotals(status: ProjectStatus): ScenarioTotals {
	const scenarios = Object.values(status.features).flatMap((feature) =>
		Object.values(feature.scenarios),
	);

	return {
		total: scenarios.length,
		passing: scenarios.filter((scenario) => scenario.e2e === "passing").length,
		failing: scenarios.filter((scenario) => scenario.e2e === "failing").length,
		missing: scenarios.filter((scenario) => scenario.e2e === "missing").length,
		stale: scenarios.filter((scenario) => scenario.e2e === "stale").length,
	};
}

export function summarizeIssuesBySeverity(issues: AgentDriftIssue[]): {
	critical: number;
	warning: number;
	info: number;
} {
	return {
		critical: issues.filter((issue) => issue.severity === "critical").length,
		warning: issues.filter((issue) => issue.severity === "warning").length,
		info: issues.filter((issue) => issue.severity === "info").length,
	};
}

export function buildAgentEditPlan(
	suggestedFiles: Array<{ path: string; action: string }>,
): Array<{ path: string; action: string }> {
	return suggestedFiles.map((file) => ({
		path: file.path,
		action: file.action,
	}));
}

export function getAgentHealthLabel(
	_status: ProjectStatus,
	drift: AgentDriftState,
): "Healthy" | "Issues detected" | "Critical issues" {
	if (drift.issues.length === 0) return "Healthy";
	if (drift.summary.critical === 0) return "Issues detected";
	return "Critical issues";
}

export function describeProjectState(status: ProjectStatus): string {
	return `Phase ${status.current_phase}, ${Object.keys(status.journeys).length} journeys`;
}

export function buildAgentProjectSnapshot(
	status: ProjectStatus,
	drift: AgentDriftState,
	root = process.cwd(),
	now = new Date(),
): AgentProjectSnapshot {
	return {
		project: {
			name: root.split("/").pop() || "unknown",
			root,
		},
		phase: {
			current: status.current_phase,
			name: status.phases[status.current_phase.toString()] || "Unknown",
			all: status.phases,
		},
		journeys: Object.entries(status.journeys).map(([key, journey]) => ({
			name: key,
			display_name: journey.name,
			actor: journey.actor,
			goal: journey.goal,
			status:
				journey.scenariosMissing > 0
					? "incomplete"
					: journey.isStale
						? "stale"
						: "complete",
			scenario_count: journey.scenarioCount,
			scenarios_missing: journey.scenariosMissing,
			scenarios_passing: journey.scenariosPassing,
			is_stale: journey.isStale,
		})),
		scenarios: getScenarioTotals(status),
		issues: drift.issues.map((issue) => ({
			id: issue.id,
			severity: issue.severity,
			type: issue.type,
			file: issue.file,
			message: issue.message,
			auto_fixable: issue.autoFixable,
		})),
		health: {
			status: drift.status,
			summary: drift.summary,
		},
		generated_at: now.toISOString(),
	};
}

export function getGoalCommandContract(): GoalCommandContract {
	return {
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
		prSummaryFields: [
			"objective",
			"files changed",
			"checks run and results",
			"cleanup findings",
			"deferred work",
		],
	};
}
