import path from "node:path";
import type { DiagnosticIssue, DiagnosticReport } from "./diagnostics.js";
import type { FeatureStatus, ProjectStatus, ScenarioStatus } from "./status.js";
import {
	buildTestGovernanceReport,
	checkTestGate,
	type MissingProofEntry,
	type TestGateResult,
	type TestGovernanceSummary,
} from "./test-governance.js";
import {
	analyzeImpact,
	buildTraceGraph,
	type ImpactResult,
} from "./trace-graph.js";

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

export interface AgentPauseReason {
	type:
		| "unsafe_repair"
		| "missing_specs"
		| "unresolved_review_gate"
		| "unverified_test_claim";
	reason: string;
	source: string;
	blocks_continue: boolean;
	next_action: string;
}

export interface AgentWorkRecommendation {
	recommended: string;
	reason: string;
	user_impact: string;
	blocks_work: boolean;
	verification_commands: string[];
	suggested_files: Array<{ path: string; action: string }>;
	blocking: AgentIssue[];
	pause_reasons: AgentPauseReason[];
	generated_at: string;
}

export interface AgentEvidencePackage {
	project: AgentProjectSnapshot["project"];
	goal: {
		path: string | null;
		status: "unknown" | "in_progress" | "complete" | "blocked";
	};
	status_snapshot: AgentProjectSnapshot;
	next_recommendation: AgentWorkRecommendation;
	issues_summary: DiagnosticReport["summary"];
	test_governance: {
		summary: TestGovernanceSummary;
		review_manifest_issues: string[];
		missing_proof: MissingProofEntry[];
		blocking_findings: TestGateResult["blockingFindings"];
		next_action: string | null;
	};
	verification: Array<{
		command: string;
		status: "not_run" | "passed" | "failed";
		evidence_path?: string;
	}>;
	changed_files: string[];
	changed_file_impacts: Array<{
		path: string;
		recommended_commands: string[];
		regression_markers: ImpactResult["regression_markers"];
		diagnostics: ImpactResult["diagnostics"];
	}>;
	pause_reasons: AgentPauseReason[];
	handoff: {
		summary: string;
		next_action: string;
		proof_status: {
			health: DiagnosticReport["status"];
			test_governance_gate: "passed" | "blocked";
			verification_claims: "explicit-evidence-required";
		};
		blockers: Array<{ source: string; reason: string; next_action: string }>;
		review_required: boolean;
		verification_commands: string[];
	};
	review_notes: string[];
	generated_at: string;
}

const AUTO_FIXABLE_TYPES = new Set<DiagnosticIssue["type"]>([
	"manifest_missing",
	"journey_stale",
]);

function isGeneratedStateCleanupIssue(issue: AgentIssue): boolean {
	return (
		(issue.type === "manifest_missing" || issue.type === "journey_stale") &&
		issue.severity !== "critical"
	);
}

function pauseReasonForIssue(issue: AgentIssue): AgentPauseReason | null {
	if (issue.type === "product_missing" || issue.type === "specs_missing") {
		return {
			type: "missing_specs",
			reason: issue.message,
			source: issue.file,
			blocks_continue: true,
			next_action: issue.recommendation,
		};
	}

	if (!issue.auto_fixable && issue.severity !== "info") {
		return {
			type: "unsafe_repair",
			reason: issue.message,
			source: issue.file,
			blocks_continue: true,
			next_action: issue.recommendation,
		};
	}

	return null;
}

function pauseReasonForGateFinding(
	finding: TestGateResult["blockingFindings"][number],
): AgentPauseReason {
	return {
		type:
			finding.type === "dirty_review" || finding.type === "review_manifest"
				? "unresolved_review_gate"
				: "unverified_test_claim",
		reason: finding.message,
		source: Object.values(finding.source_references)[0] ?? "test governance",
		blocks_continue: true,
		next_action: finding.message,
	};
}

function dedupePauseReasons(reasons: AgentPauseReason[]): AgentPauseReason[] {
	const byKey = new Map<string, AgentPauseReason>();
	for (const reason of reasons) {
		byKey.set(`${reason.type}:${reason.source}:${reason.reason}`, reason);
	}
	return [...byKey.values()].sort((left, right) =>
		`${left.type}:${left.source}`.localeCompare(
			`${right.type}:${right.source}`,
		),
	);
}

function fallbackCommandsForUntraceablePath(file: string): string[] {
	const normalized = file.replace(/\\/g, "/");
	if (normalized === "src/lib/agent-integration.ts") {
		return [
			"npm test -- --run tests/lib/agent-integration.test.ts tests/e2e/opencode/tools/agent_handoff_evidence.e2e.test.ts tests/e2e/opencode/tools/next_recommendation.e2e.test.ts",
		];
	}

	if (normalized === "src/lib/trace-graph.ts") {
		return [
			"npm test -- --run tests/lib/trace-graph.test.ts tests/lib/agent-integration.test.ts tests/e2e/udd/test-governance/feature-change-detection.e2e.test.ts",
		];
	}

	if (normalized === "src/commands/opencode.ts") {
		return [
			"npm test -- --run tests/e2e/opencode/tools/agent_handoff_evidence.e2e.test.ts tests/e2e/opencode/tools/next_recommendation.e2e.test.ts tests/e2e/opencode/tools/status_deep.e2e.test.ts tests/e2e/opencode/tools/issues_list.e2e.test.ts tests/lib/opencode.test.ts",
		];
	}

	if (normalized === "docs/agent-operator-contract.md") {
		return [
			"npm test -- --run tests/e2e/opencode/tools/agent_handoff_evidence.e2e.test.ts tests/e2e/opencode/tools/next_recommendation.e2e.test.ts",
		];
	}

	return [];
}

function reviewGateNextAction(
	pauseReasons: AgentPauseReason[],
	nextGovernanceFinding?: TestGateResult["blockingFindings"][number],
): string | null {
	const criticalPause = pauseReasons.find(
		(reason) =>
			reason.type === "missing_specs" || reason.type === "unsafe_repair",
	);
	if (criticalPause) return criticalPause.next_action;

	if (nextGovernanceFinding) return nextGovernanceFinding.message;

	const firstPause = pauseReasons.find(
		(reason) =>
			reason.type === "unresolved_review_gate" ||
			reason.type === "unverified_test_claim",
	);
	return firstPause?.next_action ?? null;
}

function recommendation(
	args: Omit<AgentWorkRecommendation, "generated_at">,
	now: Date,
): AgentWorkRecommendation {
	return {
		...args,
		generated_at: now.toISOString(),
	};
}

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
	const blocking = issues.filter((issue) => issue.severity !== "info");
	const blockingPauseReasons = blocking
		.map(pauseReasonForIssue)
		.filter((reason): reason is AgentPauseReason => Boolean(reason));
	const commandBlocking = blocking.filter(
		(issue) => !isGeneratedStateCleanupIssue(issue),
	);

	if (commandBlocking.length > 0) {
		const firstBlocker = commandBlocking[0];
		return recommendation(
			{
				recommended: firstBlocker.file,
				reason: firstBlocker.message,
				user_impact:
					"Project structure or behavior specs need review before an agent can continue safely.",
				blocks_work: true,
				verification_commands: ["./bin/udd doctor --json", "./bin/udd lint"],
				suggested_files: [
					{
						path: firstBlocker.file,
						action: firstBlocker.recommendation,
					},
				],
				blocking: commandBlocking,
				pause_reasons: dedupePauseReasons(blockingPauseReasons),
			},
			now,
		);
	}

	for (const [featureId, feature] of Object.entries(status.features)) {
		for (const [slug, scenario] of Object.entries(feature.scenarios)) {
			if (
				scenario.e2e === "failing" &&
				isCurrentPhaseScenario(scenario, status.current_phase)
			) {
				const paths = getFeaturePaths(feature, featureId, slug);
				return recommendation(
					{
						recommended: `${featureId}/${slug}`,
						reason: "Current-phase scenario test is failing.",
						user_impact:
							"Users cannot trust this behavior until the failing proof is fixed.",
						blocks_work: true,
						verification_commands: [`npm test -- --run ${paths.testPath}`],
						suggested_files: [
							{
								path: paths.testPath,
								action: "Fix the failing E2E test or implementation.",
							},
						],
						blocking,
						pause_reasons: dedupePauseReasons(blockingPauseReasons),
					},
					now,
				);
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
				return recommendation(
					{
						recommended: `${featureId}/${slug}`,
						reason:
							"Current-phase scenario is missing executable E2E coverage.",
						user_impact:
							"A current user-facing behavior has no executable proof obligation.",
						blocks_work: true,
						verification_commands: [`npm test -- --run ${paths.testPath}`],
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
						pause_reasons: dedupePauseReasons([
							...blockingPauseReasons,
							{
								type: "unverified_test_claim",
								reason:
									"Current-phase scenario is missing executable E2E coverage.",
								source: paths.scenarioPath,
								blocks_continue: true,
								next_action: `Create ${paths.testPath} before claiming this behavior is proved.`,
							},
						]),
					},
					now,
				);
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
				return recommendation(
					{
						recommended: `${featureId}/${slug}`,
						reason: "Current-phase scenario result is stale.",
						user_impact:
							"A current behavior changed or lacks fresh proof; rerun the targeted test before handoff.",
						blocks_work: false,
						verification_commands: [`npm test -- --run ${paths.testPath}`],
						suggested_files: [
							{
								path: paths.testPath,
								action: "Run the test to refresh UDD status.",
							},
						],
						blocking,
						pause_reasons: dedupePauseReasons(blockingPauseReasons),
					},
					now,
				);
			}
		}
	}

	if (report.summary.total > 0) {
		const firstIssue = issues[0];
		return recommendation(
			{
				recommended: firstIssue.file,
				reason: firstIssue.message,
				user_impact:
					firstIssue.severity === "info"
						? "Advisory cleanup can improve clarity but does not block current proof."
						: "Project diagnostics need review before this work is trustworthy.",
				blocks_work: firstIssue.severity !== "info",
				verification_commands: ["./bin/udd doctor --json", "./bin/udd lint"],
				suggested_files: [
					{
						path: firstIssue.file,
						action: firstIssue.recommendation,
					},
				],
				blocking,
				pause_reasons: dedupePauseReasons(blockingPauseReasons),
			},
			now,
		);
	}

	return recommendation(
		{
			recommended: "none",
			reason:
				"No current-phase failing, missing, stale, or diagnostic work found.",
			user_impact:
				"No current agent-operator work is required from shared UDD facts.",
			blocks_work: false,
			verification_commands: ["./bin/udd status --json", "./bin/udd lint"],
			suggested_files: [],
			blocking,
			pause_reasons: [],
		},
		now,
	);
}

export function applyTestGovernanceToRecommendation(
	next: AgentWorkRecommendation,
	testGate: TestGateResult,
	now = new Date(),
): AgentWorkRecommendation {
	const firstFinding = testGate.blockingFindings[0];
	if (!firstFinding) return next;

	const sourcePaths = Object.values(firstFinding.source_references);
	const pauseReason = pauseReasonForGateFinding(firstFinding);
	return recommendation(
		{
			recommended: firstFinding.path,
			reason: firstFinding.message,
			user_impact:
				"Proof governance blocks trustworthy agent handoff until a reviewer resolves the finding.",
			blocks_work: true,
			verification_commands: [
				"./bin/udd test-scan --json",
				"./bin/udd gate test-governance --strict --json",
			],
			suggested_files: sourcePaths.length
				? sourcePaths.map((path) => ({
						path,
						action: firstFinding.message,
					}))
				: [
						{
							path: firstFinding.path,
							action: firstFinding.message,
						},
					],
			blocking: next.blocking,
			pause_reasons: dedupePauseReasons([...next.pause_reasons, pauseReason]),
		},
		now,
	);
}

export async function recommendNextAgentWorkWithGovernance(
	status: ProjectStatus,
	report: DiagnosticReport,
	now = new Date(),
): Promise<AgentWorkRecommendation> {
	const next = recommendNextAgentWork(status, report, now);
	const testGate = await checkTestGate(process.cwd());
	return applyTestGovernanceToRecommendation(next, testGate, now);
}

export async function buildAgentEvidencePackage(
	status: ProjectStatus,
	report: DiagnosticReport,
	options: {
		goalPath?: string | null;
		goalStatus?: AgentEvidencePackage["goal"]["status"];
		changedFiles?: string[];
		reviewNotes?: string[];
		verification?: AgentEvidencePackage["verification"];
		now?: Date;
	} = {},
): Promise<AgentEvidencePackage> {
	const now = options.now ?? new Date();
	const snapshot = buildAgentProjectSnapshot(
		status,
		report,
		process.cwd(),
		now,
	);
	const baseNext = recommendNextAgentWork(status, report, now);
	const [testGovernance, testGate] = await Promise.all([
		buildTestGovernanceReport(process.cwd(), now),
		checkTestGate(process.cwd()),
	]);
	const nextGovernanceFinding = testGate.blockingFindings[0];
	const next = applyTestGovernanceToRecommendation(baseNext, testGate, now);
	const changedFiles = options.changedFiles ?? [];
	const traceGraph = await buildTraceGraph(process.cwd(), now);
	const changedFileImpacts = await Promise.all(
		changedFiles.map(async (file) => {
			const impact = await analyzeImpact(file, process.cwd(), traceGraph);
			const recommendedCommands = [
				...new Set([
					...impact.recommended_commands,
					...fallbackCommandsForUntraceablePath(file),
				]),
			];
			return {
				path: file,
				recommended_commands: recommendedCommands,
				regression_markers: impact.regression_markers,
				diagnostics: impact.diagnostics,
			};
		}),
	);
	const pauseReasons = dedupePauseReasons([...next.pause_reasons]);
	const verificationCommands = [
		...new Set([
			...next.verification_commands,
			...changedFileImpacts.flatMap((impact) => impact.recommended_commands),
			...(options.verification ?? [])
				.filter((item) => item.status === "passed" || item.status === "failed")
				.map((item) => item.command),
		]),
	].filter((command) => command.trim() !== "");
	const pauseNextAction = reviewGateNextAction(
		pauseReasons,
		nextGovernanceFinding,
	);

	return {
		project: snapshot.project,
		goal: {
			path: options.goalPath ?? null,
			status: options.goalStatus ?? "in_progress",
		},
		status_snapshot: snapshot,
		next_recommendation: next,
		issues_summary: report.summary,
		test_governance: {
			summary: testGovernance.summary,
			review_manifest_issues: testGovernance.reviews.issues,
			missing_proof: testGovernance.missing_proof,
			blocking_findings: testGate.blockingFindings,
			next_action: nextGovernanceFinding ? nextGovernanceFinding.message : null,
		},
		verification: options.verification ?? [
			{ command: "./bin/udd status", status: "passed" },
			{ command: "./bin/udd lint", status: "not_run" },
			{ command: "npm test -- --run", status: "not_run" },
		],
		changed_files: changedFiles,
		changed_file_impacts: changedFileImpacts,
		pause_reasons: pauseReasons,
		handoff: {
			summary: `${next.recommended}: ${next.reason}`,
			next_action:
				pauseNextAction ??
				next.suggested_files[0]?.action ??
				"Review the evidence package and decide whether to continue.",
			proof_status: {
				health: report.status,
				test_governance_gate:
					testGate.blockingFindings.length > 0 ? "blocked" : "passed",
				verification_claims: "explicit-evidence-required",
			},
			blockers: pauseReasons.map((reason) => ({
				source: reason.source,
				reason: reason.reason,
				next_action: reason.next_action,
			})),
			review_required: pauseReasons.length > 0,
			verification_commands: verificationCommands,
		},
		review_notes: options.reviewNotes ?? [],
		generated_at: now.toISOString(),
	};
}
