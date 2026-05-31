import path from "node:path";
import type { DiagnosticIssue, DiagnosticReport } from "./diagnostics.js";
import type { FeatureStatus, ProjectStatus, ScenarioStatus } from "./status.js";

export interface ScenarioTotals {
	total: number;
	passing: number;
	failing: number;
	missing: number;
	stale: number;
	deferred: number;
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
	git: ProjectStatus["git"];
	journeys: Array<{
		name: string;
		display_name: string;
		actor: string;
		goal: string;
		status: "complete" | "incomplete" | "stale";
		scenario_count: number;
		scenarios_missing: number;
		scenarios_passing: number;
		scenarios_failing: number;
		is_stale: boolean;
	}>;
	scenarios: ScenarioTotals;
	health: {
		status: DiagnosticReport["status"];
		healthy: boolean;
		summary: DiagnosticReport["summary"];
	};
	issues: AgentIssue[];
	generated_at: string;
}

export interface AgentIssue {
	id: string;
	severity: DiagnosticIssue["severity"];
	type: DiagnosticIssue["type"];
	file: string;
	message: string;
	recommendation: string;
	auto_fixable: boolean;
}

export interface AgentWorkRecommendation {
	recommended: string;
	reason: string;
	suggested_files: Array<{ path: string; action: string }>;
	blocking: AgentIssue[];
	generated_at: string;
}

const AUTO_FIXABLE_TYPES = new Set<DiagnosticIssue["type"]>([
	"manifest_missing",
	"journey_stale",
	"missing_scenario",
]);

function isCurrentPhaseScenario(
	scenario: ScenarioStatus,
	currentPhase: number,
): boolean {
	return (
		!scenario.isDeferred && (!scenario.phase || scenario.phase <= currentPhase)
	);
}

function getFeaturePaths(
	feature: FeatureStatus,
	featureId: string,
	slug: string,
) {
	const featurePath = feature.path || featureId;
	return {
		scenarioPath: `specs/features/${featurePath}/${slug}.feature`,
		testPath: `tests/e2e/${featurePath}/${slug}.e2e.test.ts`,
	};
}

export function getScenarioTotals(status: ProjectStatus): ScenarioTotals {
	const totals: ScenarioTotals = {
		total: 0,
		passing: 0,
		failing: 0,
		missing: 0,
		stale: 0,
		deferred: 0,
	};

	for (const feature of Object.values(status.features)) {
		for (const scenario of Object.values(feature.scenarios)) {
			totals.total++;
			totals[scenario.e2e]++;
		}
	}

	return totals;
}

export function buildAgentIssueList(report: DiagnosticReport): AgentIssue[] {
	return report.issues.map((issue) => ({
		id: issue.id,
		severity: issue.severity,
		type: issue.type,
		file: issue.file,
		message: issue.message,
		recommendation: issue.recommendation,
		auto_fixable: AUTO_FIXABLE_TYPES.has(issue.type),
	}));
}

export function buildAgentProjectSnapshot(
	status: ProjectStatus,
	report: DiagnosticReport,
	root = process.cwd(),
	now = new Date(),
): AgentProjectSnapshot {
	return {
		project: {
			name: path.basename(root) || "unknown",
			root,
		},
		phase: {
			current: status.current_phase,
			name: status.phases[String(status.current_phase)] || "Unknown",
			all: status.phases,
		},
		git: status.git,
		journeys: Object.entries(status.journeys).map(([name, journey]) => ({
			name,
			display_name: journey.name,
			actor: journey.actor,
			goal: journey.goal,
			status:
				journey.scenariosMissing > 0 || journey.scenariosFailing > 0
					? "incomplete"
					: journey.isStale
						? "stale"
						: "complete",
			scenario_count: journey.scenarioCount,
			scenarios_missing: journey.scenariosMissing,
			scenarios_passing: journey.scenariosPassing,
			scenarios_failing: journey.scenariosFailing,
			is_stale: journey.isStale,
		})),
		scenarios: getScenarioTotals(status),
		health: {
			status: report.status,
			healthy: report.healthy,
			summary: report.summary,
		},
		issues: buildAgentIssueList(report),
		generated_at: now.toISOString(),
	};
}

export function recommendNextAgentWork(
	status: ProjectStatus,
	report: DiagnosticReport,
	now = new Date(),
): AgentWorkRecommendation {
	const issues = buildAgentIssueList(report);
	const blocking = issues.filter((issue) => issue.severity === "critical");

	if (blocking.length > 0) {
		const firstBlocker = blocking[0];
		return {
			recommended: firstBlocker.file,
			reason: firstBlocker.message,
			suggested_files: [
				{
					path: firstBlocker.file,
					action: firstBlocker.recommendation,
				},
			],
			blocking,
			generated_at: now.toISOString(),
		};
	}

	for (const [featureId, feature] of Object.entries(status.features)) {
		for (const [slug, scenario] of Object.entries(feature.scenarios)) {
			if (
				scenario.e2e === "failing" &&
				isCurrentPhaseScenario(scenario, status.current_phase)
			) {
				const paths = getFeaturePaths(feature, featureId, slug);
				return {
					recommended: `${featureId}/${slug}`,
					reason: "Current-phase scenario test is failing.",
					suggested_files: [
						{
							path: paths.testPath,
							action: "Fix the failing E2E test or implementation.",
						},
					],
					blocking,
					generated_at: now.toISOString(),
				};
			}
		}
	}

	for (const [featureId, feature] of Object.entries(status.features)) {
		for (const [slug, scenario] of Object.entries(feature.scenarios)) {
			if (
				scenario.e2e === "missing" &&
				isCurrentPhaseScenario(scenario, status.current_phase)
			) {
				const paths = getFeaturePaths(feature, featureId, slug);
				return {
					recommended: `${featureId}/${slug}`,
					reason: "Current-phase scenario is missing executable E2E coverage.",
					suggested_files: [
						{
							path: paths.scenarioPath,
							action: "Review the behavior contract.",
						},
						{
							path: paths.testPath,
							action: "Create executable E2E coverage.",
						},
					],
					blocking,
					generated_at: now.toISOString(),
				};
			}
		}
	}

	for (const [featureId, feature] of Object.entries(status.features)) {
		for (const [slug, scenario] of Object.entries(feature.scenarios)) {
			if (
				scenario.e2e === "stale" &&
				isCurrentPhaseScenario(scenario, status.current_phase)
			) {
				const paths = getFeaturePaths(feature, featureId, slug);
				return {
					recommended: `${featureId}/${slug}`,
					reason: "Current-phase scenario result is stale.",
					suggested_files: [
						{
							path: paths.testPath,
							action: "Run the test to refresh UDD status.",
						},
					],
					blocking,
					generated_at: now.toISOString(),
				};
			}
		}
	}

	if (report.summary.total > 0) {
		const firstIssue = issues[0];
		return {
			recommended: firstIssue.file,
			reason: firstIssue.message,
			suggested_files: [
				{
					path: firstIssue.file,
					action: firstIssue.recommendation,
				},
			],
			blocking,
			generated_at: now.toISOString(),
		};
	}

	return {
		recommended: "none",
		reason:
			"No current-phase failing, missing, stale, or diagnostic work found.",
		suggested_files: [],
		blocking,
		generated_at: now.toISOString(),
	};
}
