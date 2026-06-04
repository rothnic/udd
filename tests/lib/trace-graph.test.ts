import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, expect, test } from "vitest";
import { analyzeImpact, buildTraceGraph } from "../../src/lib/trace-graph.js";

let projectDir: string;

beforeEach(async () => {
	projectDir = await fs.mkdtemp(path.join(os.tmpdir(), "udd-trace-graph-"));
});

afterEach(async () => {
	await fs.rm(projectDir, { recursive: true, force: true });
});

async function writeFile(filePath: string, content: string): Promise<void> {
	await fs.mkdir(path.dirname(path.join(projectDir, filePath)), {
		recursive: true,
	});
	await fs.writeFile(path.join(projectDir, filePath), content);
}

async function writeBaseProject(
	options: {
		scenarios?: string[];
		futureScenarios?: string[];
		writeFeatures?: string[];
		writeTests?: string[];
		duplicateScenario?: boolean;
		orphanFeature?: string;
		orphanTest?: string;
		results?: "fresh" | "old" | "missing";
	} = {},
): Promise<void> {
	const scenarios = options.scenarios ?? ["demo/happy"];
	const writeFeatures = options.writeFeatures ?? scenarios;
	const writeTests = options.writeTests ?? scenarios;
	await writeFile(
		"specs/VISION.md",
		[
			"---",
			"id: demo_objective",
			"name: Demo Objective",
			"use_cases:",
			"  - demo",
			"---",
			"",
			"# Demo Objective",
			"",
		].join("\n"),
	);
	await writeFile(
		"specs/roadmap.yml",
		[
			"current_phase: demo",
			"phases:",
			"  - id: demo",
			"    name: Demo",
			"    number: 1",
			"    use_cases:",
			"      - id: demo",
			"        capability: core",
			...(options.futureScenarios?.length
				? [
						"        future_scenario_paths:",
						...options.futureScenarios.map((id) => `          - ${id}`),
					]
				: []),
			"capabilities:",
			"  core:",
			"    name: Core",
			"",
		].join("\n"),
	);
	await writeFile(
		"specs/use-cases/demo.yml",
		[
			"id: demo",
			"name: Demo",
			"outcomes:",
			"  - description: Demo works",
			"    scenario_paths:",
			...scenarios.map((id) => `      - ${id}`),
			...(options.duplicateScenario
				? [
						"  - description: Demo still works",
						"    scenario_paths:",
						`      - ${scenarios[0]}`,
					]
				: []),
			"",
		].join("\n"),
	);
	for (const scenario of writeFeatures) {
		await writeFile(
			`specs/features/${scenario}.feature`,
			[
				"Feature: Demo",
				"",
				"  Scenario: Demo works",
				"    Given a demo",
				"    When it runs",
				"    Then it passes",
				"",
			].join("\n"),
		);
	}
	if (options.orphanFeature) {
		await writeFile(
			`specs/features/${options.orphanFeature}.feature`,
			"Feature: Orphan\n\n  Scenario: Orphan\n    Given an orphan\n",
		);
	}
	for (const scenario of writeTests) {
		const slug = scenario.split("/").at(-1);
		await writeFile(
			`tests/e2e/${scenario}.e2e.test.ts`,
			[
				`// @feature specs/features/${scenario}.feature`,
				"import { test } from 'vitest';",
				`test('${slug}', () => {});`,
				"",
			].join("\n"),
		);
	}
	if (options.orphanTest) {
		await writeFile(
			`tests/e2e/${options.orphanTest}.e2e.test.ts`,
			"import { test } from 'vitest';\ntest('orphan', () => {});\n",
		);
	}
	if (options.results !== "missing") {
		await writeFile(".udd/results.json", JSON.stringify({ testResults: [] }));
		const date =
			options.results === "old"
				? new Date(Date.now() - 60_000)
				: new Date(Date.now() + 60_000);
		await fs.utimes(path.join(projectDir, ".udd/results.json"), date, date);
	}
}

function diagnosticTypes(graph: Awaited<ReturnType<typeof buildTraceGraph>>) {
	return graph.diagnostics.map((diagnostic) => diagnostic.type);
}

test("builds a valid linked graph with source paths", async () => {
	await writeBaseProject();

	const graph = await buildTraceGraph(projectDir);

	expect(graph.nodes).toContainEqual(
		expect.objectContaining({
			id: "scenario:demo/happy",
			source: { path: "specs/features/demo/happy.feature" },
		}),
	);
	expect(graph.nodes).toContainEqual(
		expect.objectContaining({
			id: "test:tests/e2e/demo/happy.e2e.test.ts",
			status: "linked",
		}),
	);
	expect(diagnosticTypes(graph)).not.toContain("missing_test");
});

test("serializes deterministically", async () => {
	await writeBaseProject();

	const first = JSON.stringify(await buildTraceGraph(projectDir));
	const second = JSON.stringify(await buildTraceGraph(projectDir));

	expect(first).toBe(second);
});

test("diagnoses missing scenarios", async () => {
	await writeBaseProject({ scenarios: ["demo/missing"], writeFeatures: [] });

	const graph = await buildTraceGraph(projectDir);

	expect(diagnosticTypes(graph)).toContain("missing_scenario");
});

test("diagnoses missing tests", async () => {
	await writeBaseProject({ writeTests: [] });

	const graph = await buildTraceGraph(projectDir);

	expect(diagnosticTypes(graph)).toContain("missing_test");
});

test("diagnoses orphan scenarios", async () => {
	await writeBaseProject({ orphanFeature: "demo/orphan" });

	const graph = await buildTraceGraph(projectDir);

	expect(diagnosticTypes(graph)).toContain("orphan_scenario");
});

test("diagnoses orphan tests", async () => {
	await writeBaseProject({ orphanTest: "demo/orphan_test" });

	const graph = await buildTraceGraph(projectDir);

	expect(diagnosticTypes(graph)).toContain("orphan_test");
});

test("diagnoses duplicate scenario references", async () => {
	await writeBaseProject({ duplicateScenario: true });

	const graph = await buildTraceGraph(projectDir);

	expect(diagnosticTypes(graph)).toContain("duplicate_scenario");
});

test("classifies future-phase scenarios without requiring current proof", async () => {
	await writeBaseProject({
		futureScenarios: ["demo/future"],
		scenarios: ["demo/future"],
		writeFeatures: ["demo/future"],
		writeTests: [],
	});

	const graph = await buildTraceGraph(projectDir);

	expect(diagnosticTypes(graph)).toContain("future_phase");
	expect(diagnosticTypes(graph)).not.toContain("missing_test");
	expect(graph.nodes).toContainEqual(
		expect.objectContaining({
			id: "scenario:demo/future",
			status: "future-phase",
		}),
	);
});

test("classifies linked scenarios as stale when generated results are missing", async () => {
	await writeBaseProject({ results: "missing" });

	const graph = await buildTraceGraph(projectDir);

	expect(diagnosticTypes(graph)).toContain("stale_scenario");
});

test("classifies linked scenarios as stale when source changes after results", async () => {
	await writeBaseProject({ results: "old" });

	const graph = await buildTraceGraph(projectDir);

	expect(diagnosticTypes(graph)).toContain("stale_scenario");
});

test("analyzes impact for use-case, feature, test, roadmap, and unknown paths", async () => {
	await writeBaseProject();

	const graph = await buildTraceGraph(projectDir);
	const useCaseImpact = await analyzeImpact(
		"specs/use-cases/demo.yml",
		projectDir,
		graph,
	);
	const featureImpact = await analyzeImpact(
		"specs/features/demo/happy.feature",
		projectDir,
		graph,
	);
	const testImpact = await analyzeImpact(
		"tests/e2e/demo/happy.e2e.test.ts",
		projectDir,
		graph,
	);
	const roadmapImpact = await analyzeImpact(
		"specs/roadmap.yml",
		projectDir,
		graph,
	);
	const unknownImpact = await analyzeImpact("README.md", projectDir, graph);

	expect(useCaseImpact.affected.use_cases).toContainEqual(
		expect.objectContaining({ id: "use_case:demo" }),
	);
	expect(featureImpact.affected.tests).toContainEqual(
		expect.objectContaining({ id: "test:tests/e2e/demo/happy.e2e.test.ts" }),
	);
	expect(testImpact.affected.scenarios).toContainEqual(
		expect.objectContaining({ id: "scenario:demo/happy" }),
	);
	expect(roadmapImpact.affected.capabilities).toContainEqual(
		expect.objectContaining({ id: "capability:core" }),
	);
	expect(unknownImpact.regression_markers).toContainEqual(
		expect.objectContaining({ type: "untraceable" }),
	);
});
