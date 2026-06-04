import fs from "node:fs/promises";
import path from "node:path";
import { glob } from "glob";
import yaml from "yaml";
import { extractFeatureReference } from "./test-governance.js";

export type TraceNodeType =
	| "objective"
	| "phase"
	| "capability"
	| "use_case"
	| "outcome"
	| "scenario"
	| "test"
	| "goal";

export interface TraceSource {
	path: string;
	line?: number;
}

export interface TraceNode {
	id: string;
	type: TraceNodeType;
	label: string;
	source: TraceSource;
	status?: string;
}

export interface TraceEdge {
	from: string;
	to: string;
	type: string;
	source: TraceSource;
}

export interface TraceDiagnostic {
	type:
		| "missing_scenario"
		| "missing_test"
		| "stale_scenario"
		| "orphan_scenario"
		| "orphan_test"
		| "duplicate_scenario"
		| "future_phase";
	severity: "error" | "warning" | "info";
	message: string;
	source: TraceSource;
}

export interface TraceGraph {
	generated_at: string;
	nodes: TraceNode[];
	edges: TraceEdge[];
	diagnostics: TraceDiagnostic[];
}

export interface ImpactResult {
	input: string;
	resolved: TraceNode[];
	affected: {
		objectives: TraceNode[];
		capabilities: TraceNode[];
		use_cases: TraceNode[];
		outcomes: TraceNode[];
		scenarios: TraceNode[];
		tests: TraceNode[];
		goals: TraceNode[];
	};
	edges: TraceEdge[];
	diagnostics: TraceDiagnostic[];
	regression_markers: Array<{
		type:
			| "direct"
			| "adjacent"
			| "missing_proof"
			| "deferred_future"
			| "untraceable";
		path: string;
		reason: string;
		confidence: "high" | "medium" | "low";
	}>;
	recommendations: Array<{
		command: string;
		reason: string;
		confidence: "high" | "medium" | "low";
		source_paths: string[];
	}>;
	recommended_commands: string[];
}

function toPosix(filePath: string): string {
	return filePath.replace(/\\/g, "/");
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return value !== null && typeof value === "object" && !Array.isArray(value);
}

function normalizePath(filePath: string): string {
	return toPosix(filePath).replace(/^\.\//, "");
}

function scenarioIdToPath(id: string): string {
	return `specs/features/${id}.feature`;
}

function scenarioPathToId(filePath: string): string {
	return normalizePath(filePath)
		.replace(/^specs\/features\//, "")
		.replace(/\.feature$/, "");
}

function nodeId(type: TraceNodeType, id: string): string {
	return `${type}:${id}`;
}

function addNode(nodes: Map<string, TraceNode>, node: TraceNode): void {
	if (!nodes.has(node.id)) {
		nodes.set(node.id, node);
	}
}

function addEdge(edges: TraceEdge[], edge: TraceEdge): void {
	if (
		!edges.some(
			(existing) =>
				existing.from === edge.from &&
				existing.to === edge.to &&
				existing.type === edge.type,
		)
	) {
		edges.push(edge);
	}
}

async function readYaml(rootDir: string, file: string): Promise<unknown> {
	return yaml.parse(await fs.readFile(path.join(rootDir, file), "utf-8"));
}

async function exists(rootDir: string, file: string): Promise<boolean> {
	try {
		await fs.access(path.join(rootDir, file));
		return true;
	} catch {
		return false;
	}
}

function outcomeId(useCaseId: string, index: number): string {
	return `${useCaseId}#outcome-${index + 1}`;
}

export async function buildTraceGraph(
	rootDir = process.cwd(),
	now = new Date(0),
): Promise<TraceGraph> {
	const nodes = new Map<string, TraceNode>();
	const edges: TraceEdge[] = [];
	const diagnostics: TraceDiagnostic[] = [];
	const referencedScenarios = new Set<string>();
	const scenarioReferenceCounts = new Map<string, number>();

	const visionPath = "specs/VISION.md";
	try {
		const vision = await fs.readFile(path.join(rootDir, visionPath), "utf-8");
		const frontmatter = vision.match(/^---\n([\s\S]*?)\n---/);
		const parsed = frontmatter ? yaml.parse(frontmatter[1]) : {};
		addNode(nodes, {
			id: nodeId("objective", parsed.id ?? "vision"),
			type: "objective",
			label: parsed.name ?? "UDD Vision",
			source: { path: visionPath },
		});
	} catch {
		// Lint/doctor own missing vision failures; graph stays best effort.
	}

	const objective = [...nodes.values()].find(
		(node) => node.type === "objective",
	);
	const goalFiles = (await glob("goals/*.md", { cwd: rootDir })).sort();
	for (const file of goalFiles) {
		const id = path.basename(file, ".md");
		addNode(nodes, {
			id: nodeId("goal", id),
			type: "goal",
			label: id,
			source: { path: file },
		});
		if (objective) {
			addEdge(edges, {
				from: objective.id,
				to: nodeId("goal", id),
				type: "objective_includes_goal",
				source: { path: file },
			});
		}
	}
	const capabilityByUseCase = new Map<string, string>();
	const phaseByUseCase = new Map<
		string,
		{ id: string; name: string; number: number }
	>();
	const futureScenarioPaths = new Set<string>();

	try {
		const roadmap = (await readYaml(rootDir, "specs/roadmap.yml")) as {
			phases?: Array<{
				id: string;
				name: string;
				number: number;
				use_cases?: Array<{
					id: string;
					capability?: string;
					scenario_paths?: string[];
					future_scenario_paths?: string[];
				}>;
			}>;
			capabilities?: Record<string, { name?: string; description?: string }>;
		};

		for (const [id, capability] of Object.entries(roadmap.capabilities ?? {})) {
			addNode(nodes, {
				id: nodeId("capability", id),
				type: "capability",
				label: capability.name ?? id,
				source: { path: "specs/roadmap.yml" },
			});
		}

		for (const phase of roadmap.phases ?? []) {
			addNode(nodes, {
				id: nodeId("phase", phase.id),
				type: "phase",
				label: `Phase ${phase.number}: ${phase.name}`,
				source: { path: "specs/roadmap.yml" },
				status: String(phase.number),
			});

			for (const useCase of phase.use_cases ?? []) {
				phaseByUseCase.set(useCase.id, phase);
				if (useCase.capability) {
					capabilityByUseCase.set(useCase.id, useCase.capability);
					addEdge(edges, {
						from: nodeId("capability", useCase.capability),
						to: nodeId("use_case", useCase.id),
						type: "capability_contains_use_case",
						source: { path: "specs/roadmap.yml" },
					});
				}
				addEdge(edges, {
					from: nodeId("phase", phase.id),
					to: nodeId("use_case", useCase.id),
					type: "phase_schedules_use_case",
					source: { path: "specs/roadmap.yml" },
				});
				for (const scenarioPath of useCase.future_scenario_paths ?? []) {
					futureScenarioPaths.add(scenarioPath);
				}
			}
		}
	} catch {
		// Best-effort graph; lint validates roadmap structure separately.
	}

	const useCaseFiles = (
		await glob("specs/use-cases/*.yml", { cwd: rootDir })
	).sort();
	for (const file of useCaseFiles) {
		const parsedData = await readYaml(rootDir, file);
		if (!isRecord(parsedData) || typeof parsedData.id !== "string") continue;
		const parsed = parsedData as {
			id: string;
			name?: string;
			outcomes?: Array<{
				description?: string;
				scenarios?: string[];
				scenario_paths?: string[];
			}>;
		};

		addNode(nodes, {
			id: nodeId("use_case", parsed.id),
			type: "use_case",
			label: parsed.name ?? parsed.id,
			source: { path: file },
			status: phaseByUseCase.get(parsed.id)?.name,
		});
		if (objective) {
			addEdge(edges, {
				from: objective.id,
				to: nodeId("use_case", parsed.id),
				type: "objective_includes_use_case",
				source: { path: visionPath },
			});
		}

		const capability = capabilityByUseCase.get(parsed.id);
		if (capability) {
			addEdge(edges, {
				from: nodeId("capability", capability),
				to: nodeId("use_case", parsed.id),
				type: "capability_contains_use_case",
				source: { path: "specs/roadmap.yml" },
			});
		}

		for (const [index, outcome] of (parsed.outcomes ?? []).entries()) {
			const id = outcomeId(parsed.id, index);
			addNode(nodes, {
				id: nodeId("outcome", id),
				type: "outcome",
				label: outcome.description ?? id,
				source: { path: file },
			});
			addEdge(edges, {
				from: nodeId("use_case", parsed.id),
				to: nodeId("outcome", id),
				type: "use_case_has_outcome",
				source: { path: file },
			});

			for (const scenarioPath of outcome.scenario_paths ??
				outcome.scenarios ??
				[]) {
				referencedScenarios.add(scenarioPath);
				scenarioReferenceCounts.set(
					scenarioPath,
					(scenarioReferenceCounts.get(scenarioPath) ?? 0) + 1,
				);
				addEdge(edges, {
					from: nodeId("outcome", id),
					to: nodeId("scenario", scenarioPath),
					type: "outcome_requires_scenario",
					source: { path: file },
				});
				if (!(await exists(rootDir, scenarioIdToPath(scenarioPath)))) {
					diagnostics.push({
						type: "missing_scenario",
						severity: "error",
						message: `Use case ${parsed.id} references missing scenario ${scenarioPath}`,
						source: { path: file },
					});
				}
			}
		}
	}

	const scenarioFiles = (
		await glob("specs/features/**/*.feature", { cwd: rootDir })
	).sort();
	for (const file of scenarioFiles) {
		const id = scenarioPathToId(file);
		addNode(nodes, {
			id: nodeId("scenario", id),
			type: "scenario",
			label: id,
			source: { path: file },
			status: futureScenarioPaths.has(id) ? "future-phase" : undefined,
		});
		if (!referencedScenarios.has(id)) {
			diagnostics.push({
				type: "orphan_scenario",
				severity: futureScenarioPaths.has(id) ? "info" : "warning",
				message: `Scenario ${id} is not linked from a use-case outcome.`,
				source: { path: file },
			});
		}
	}

	for (const [scenarioPath, count] of scenarioReferenceCounts.entries()) {
		if (count > 1) {
			diagnostics.push({
				type: "duplicate_scenario",
				severity: "warning",
				message: `Scenario ${scenarioPath} is referenced by ${count} outcomes.`,
				source: { path: scenarioIdToPath(scenarioPath) },
			});
		}
	}

	const testFiles = (
		await glob("tests/**/*.{test,e2e.test}.{ts,tsx,js,jsx}", {
			cwd: rootDir,
			nodir: true,
		})
	).sort();
	let resultsMtime: number | undefined;
	try {
		const stats = await fs.stat(path.join(rootDir, ".udd/results.json"));
		resultsMtime = stats.mtimeMs;
	} catch {
		// Missing generated results means linked scenarios need a fresh test run.
	}
	const testsByScenario = new Map<string, string[]>();
	for (const file of testFiles) {
		const content = await fs.readFile(path.join(rootDir, file), "utf-8");
		const feature = extractFeatureReference(content);
		const id = normalizePath(file);
		addNode(nodes, {
			id: nodeId("test", id),
			type: "test",
			label: id,
			source: { path: file },
			status: feature ? "linked" : "unlinked",
		});

		if (!feature) {
			diagnostics.push({
				type: "orphan_test",
				severity: "warning",
				message: `Test ${file} does not link to a scenario feature file.`,
				source: { path: file },
			});
			continue;
		}

		const scenario = scenarioPathToId(feature);
		testsByScenario.set(scenario, [
			...(testsByScenario.get(scenario) ?? []),
			id,
		]);
		addEdge(edges, {
			from: nodeId("scenario", scenario),
			to: nodeId("test", id),
			type: "scenario_proven_by_test",
			source: { path: file },
		});
	}

	for (const scenario of referencedScenarios) {
		if (!testsByScenario.has(scenario) && !futureScenarioPaths.has(scenario)) {
			diagnostics.push({
				type: "missing_test",
				severity: "error",
				message: `Scenario ${scenario} has no linked E2E test.`,
				source: { path: scenarioIdToPath(scenario) },
			});
		}
		if (testsByScenario.has(scenario) && !futureScenarioPaths.has(scenario)) {
			const scenarioPath = scenarioIdToPath(scenario);
			let staleReason: string | undefined;
			if (resultsMtime === undefined) {
				staleReason =
					"No generated test results exist for this linked scenario.";
			} else {
				try {
					const [scenarioStats, linkedTestStats] = await Promise.all([
						fs.stat(path.join(rootDir, scenarioPath)),
						Promise.all(
							(testsByScenario.get(scenario) ?? []).map((testPath) =>
								fs.stat(path.join(rootDir, testPath)),
							),
						),
					]);
					if (
						scenarioStats.mtimeMs > resultsMtime ||
						linkedTestStats.some((stats) => stats.mtimeMs > resultsMtime)
					) {
						staleReason =
							"Scenario or linked test changed after generated test results.";
					}
				} catch {
					// Missing scenario/test diagnostics are already emitted elsewhere.
				}
			}
			if (staleReason) {
				diagnostics.push({
					type: "stale_scenario",
					severity: "info",
					message: `Scenario ${scenario} is stale: ${staleReason}`,
					source: { path: scenarioPath },
				});
			}
		}
		if (futureScenarioPaths.has(scenario)) {
			diagnostics.push({
				type: "future_phase",
				severity: "info",
				message: `Scenario ${scenario} is planned for a future phase.`,
				source: { path: scenarioIdToPath(scenario) },
			});
		}
	}

	return {
		generated_at: now.toISOString(),
		nodes: [...nodes.values()].sort((left, right) =>
			left.id.localeCompare(right.id),
		),
		edges: edges.sort((left, right) =>
			`${left.from}:${left.type}:${left.to}`.localeCompare(
				`${right.from}:${right.type}:${right.to}`,
			),
		),
		diagnostics: diagnostics.sort((left, right) =>
			`${left.source.path}:${left.type}:${left.message}`.localeCompare(
				`${right.source.path}:${right.type}:${right.message}`,
			),
		),
	};
}

function isSameOrRelatedPath(input: string, sourcePath: string): boolean {
	const normalizedInput = normalizePath(input);
	const normalizedSource = normalizePath(sourcePath);
	if (normalizedInput === normalizedSource) return true;
	if (normalizedSource.endsWith(normalizedInput)) return true;
	if (normalizedInput.startsWith("specs/features/")) {
		return (
			scenarioPathToId(normalizedInput) === scenarioPathToId(normalizedSource)
		);
	}
	return false;
}

export async function analyzeImpact(
	inputPath: string,
	rootDir = process.cwd(),
	graph?: TraceGraph,
): Promise<ImpactResult> {
	graph ??= await buildTraceGraph(rootDir);
	const byId = new Map(graph.nodes.map((node) => [node.id, node]));
	const forward = new Map<string, TraceEdge[]>();
	const reverse = new Map<string, TraceEdge[]>();
	for (const edge of graph.edges) {
		forward.set(edge.from, [...(forward.get(edge.from) ?? []), edge]);
		reverse.set(edge.to, [...(reverse.get(edge.to) ?? []), edge]);
	}

	const seeds = graph.nodes.filter((node) =>
		isSameOrRelatedPath(inputPath, node.source.path),
	);
	const seen = new Set(seeds.map((node) => node.id));
	const impactEdges: TraceEdge[] = [];

	const downstreamQueue = seeds.map((node) => node.id);
	while (downstreamQueue.length > 0) {
		const current = downstreamQueue.shift();
		if (!current) continue;
		for (const edge of forward.get(current) ?? []) {
			impactEdges.push(edge);
			if (!seen.has(edge.to)) {
				seen.add(edge.to);
				downstreamQueue.push(edge.to);
			}
		}
	}

	const upstreamQueue = seeds.map((node) => node.id);
	while (upstreamQueue.length > 0) {
		const current = upstreamQueue.shift();
		if (!current) continue;
		for (const edge of reverse.get(current) ?? []) {
			impactEdges.push(edge);
			if (!seen.has(edge.from)) {
				seen.add(edge.from);
				upstreamQueue.push(edge.from);
			}
		}
	}

	const affectedNodes = [...seen]
		.map((id) => byId.get(id))
		.filter((node): node is TraceNode => Boolean(node));
	const byType = (type: TraceNodeType) =>
		affectedNodes.filter((node) => node.type === type);
	const affectedSourcePaths = new Set(
		affectedNodes.map((node) => normalizePath(node.source.path)),
	);
	const diagnostics = graph.diagnostics.filter((diagnostic) =>
		affectedSourcePaths.has(normalizePath(diagnostic.source.path)),
	);
	const tests = byType("test");
	const scenarios = byType("scenario");
	const regressionMarkers: ImpactResult["regression_markers"] = [
		...seeds.map((node) => ({
			type: "direct" as const,
			path: node.source.path,
			reason: `Input resolved directly to ${node.type} ${node.label}.`,
			confidence: "high" as const,
		})),
		...affectedNodes
			.filter((node) => !seeds.some((seed) => seed.id === node.id))
			.map((node) => ({
				type: "adjacent" as const,
				path: node.source.path,
				reason: `${node.type} ${node.label} is connected through the trace graph.`,
				confidence: "medium" as const,
			})),
		...diagnostics
			.filter((diagnostic) => diagnostic.type === "missing_test")
			.map((diagnostic) => ({
				type: "missing_proof" as const,
				path: diagnostic.source.path,
				reason: diagnostic.message,
				confidence: "high" as const,
			})),
		...scenarios
			.filter((scenario) => scenario.status === "future-phase")
			.map((scenario) => ({
				type: "deferred_future" as const,
				path: scenario.source.path,
				reason: `${scenario.label} is marked as future phase work.`,
				confidence: "medium" as const,
			})),
	].sort((left, right) =>
		`${left.type}:${left.path}:${left.reason}`.localeCompare(
			`${right.type}:${right.path}:${right.reason}`,
		),
	);
	const testPaths = [...new Set(tests.map((node) => node.source.path))].sort();
	const recommendations: ImpactResult["recommendations"] = [];
	if (testPaths.length > 0) {
		recommendations.push({
			command: `npm test -- --run ${testPaths.join(" ")}`,
			reason: "Run affected linked E2E tests.",
			confidence: "high",
			source_paths: testPaths,
		});
	}
	for (const marker of regressionMarkers.filter(
		(item) => item.type === "missing_proof",
	)) {
		const testPath = marker.path
			.replace(/^specs\/features\//, "tests/e2e/")
			.replace(/\.feature$/, ".e2e.test.ts");
		recommendations.push({
			command: `npm test -- --run ${testPath}`,
			reason: `Create or restore missing proof before trusting ${marker.path}.`,
			confidence: "medium",
			source_paths: [marker.path, testPath],
		});
	}
	const changedGoals = byType("goal");
	if (changedGoals.length > 0) {
		const goalPaths = changedGoals.map((node) => node.source.path).sort();
		recommendations.push(
			{
				command: "./bin/udd status --json",
				reason: "Verify goal-plan changes against current project health.",
				confidence: "medium",
				source_paths: goalPaths,
			},
			{
				command: "./bin/udd lint",
				reason: "Validate source-of-truth structure after goal-plan changes.",
				confidence: "medium",
				source_paths: goalPaths,
			},
		);
	}
	if (seeds.length === 0) {
		regressionMarkers.push({
			type: "untraceable",
			path: normalizePath(inputPath),
			reason:
				"No trace node resolves for this path; use review judgment and run the nearest relevant tests.",
			confidence: "low",
		});
		recommendations.push({
			command: "./bin/udd lint",
			reason: "Fallback validation for untraceable changed files.",
			confidence: "low",
			source_paths: [normalizePath(inputPath)],
		});
	}

	return {
		input: inputPath,
		resolved: seeds,
		affected: {
			objectives: byType("objective"),
			capabilities: byType("capability"),
			use_cases: byType("use_case"),
			outcomes: byType("outcome"),
			scenarios: byType("scenario"),
			tests: byType("test"),
			goals: byType("goal"),
		},
		edges: impactEdges.sort((left, right) =>
			`${left.from}:${left.type}:${left.to}`.localeCompare(
				`${right.from}:${right.type}:${right.to}`,
			),
		),
		diagnostics,
		regression_markers: regressionMarkers,
		recommendations,
		recommended_commands: recommendations.map((item) => item.command),
	};
}
