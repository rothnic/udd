import fs from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { runUdd, withTempDir } from "../../../utils.js";

// @feature udd/strategic-program/strategic_program_commands.feature
describe("strategic program command surfaces", () => {
	it("returns deterministic trace and impact JSON", async () => {
		const trace = JSON.parse((await runUdd("trace --json")).stdout);
		expect(trace.nodes.length).toBeGreaterThan(0);
		expect(trace.edges.length).toBeGreaterThan(0);
		expect(trace.nodes).toContainEqual(
			expect.objectContaining({ id: "use_case:run_tests" }),
		);

		const impact = JSON.parse(
			(await runUdd("impact specs/use-cases/run_tests.yml --json")).stdout,
		);
		expect(impact.affected.use_cases).toContainEqual(
			expect.objectContaining({ id: "use_case:run_tests" }),
		);
		expect(impact.affected.scenarios.length).toBeGreaterThan(0);
	});

	it("exposes root test scan and governance gate aliases", async () => {
		const scan = JSON.parse((await runUdd("test-scan --json")).stdout);
		expect(scan.summary.total).toBeGreaterThan(0);
		expect(scan.summary).toHaveProperty("stubbed");

		const gate = JSON.parse(
			(await runUdd("gate test-governance --json")).stdout,
		);
		expect(gate).toHaveProperty("passed");
		expect(gate).toHaveProperty("stubbedTests");
	});

	it("classifies doctor conditions and plans repair without applying", async () => {
		const doctor = JSON.parse((await runUdd("doctor --json")).stdout);
		expect(doctor.conditions.length).toBeGreaterThanOrEqual(8);

		const repair = JSON.parse((await runUdd("repair --dry-run --json")).stdout);
		expect(repair.mode).toBe("dry-run");
		expect(repair.applied).toEqual([]);
		expect(repair.evidence.markdown).toContain("UDD Repair Dry-Run Evidence");
	});

	it("applies only safe repair actions and emits reviewer evidence", async () => {
		await withTempDir(async () => {
			await fs.mkdir("product/journeys", { recursive: true });
			await fs.mkdir("specs", { recursive: true });
			await fs.writeFile(
				"product/journeys/example.md",
				"# Journey: Example\n\n1. Step -> `specs/features/example/demo.feature`\n",
			);

			const result = JSON.parse((await runUdd("repair --apply --json")).stdout);
			expect(result.mode).toBe("apply");
			expect(result.applied).toContainEqual(
				expect.objectContaining({ kind: "refresh_manifest" }),
			);
			expect(result.advisory).toContainEqual(
				expect.objectContaining({ kind: "manual" }),
			);
			await fs.access("specs/.udd/manifest.yml");
			await fs.access("docs/project/reviews/repair/latest-repair-evidence.md");
		});
	});

	it("builds adapter-neutral evidence for agent handoff", async () => {
		const evidence = JSON.parse(
			(
				await runUdd(
					"opencode evidence --json --goal goals/000-strategic-execution-master-goal.md",
				)
			).stdout,
		);
		expect(evidence.goal.path).toBe(
			"goals/000-strategic-execution-master-goal.md",
		);
		expect(evidence.status_snapshot).toHaveProperty("project");
		expect(evidence.next_recommendation).toHaveProperty("recommended");
	});

	it("scaffolds use cases and scenarios without fake passing tests", async () => {
		await withTempDir(async () => {
			await runUdd(
				"new use-case export_csv --name 'Export CSV' --summary 'Export rows for analysis'",
			);
			await runUdd(
				"new scenario reports export_csv happy_path --use-case export_csv",
			);

			await fs.access("specs/use-cases/export_csv.yml");
			await fs.access("specs/features/reports/export_csv/happy_path.feature");
			await expect(
				fs.access("tests/e2e/reports/export_csv/happy_path.e2e.test.ts"),
			).rejects.toThrow();

			const featureMeta = await fs.readFile(
				path.join("specs", "features", "reports", "export_csv", "_feature.yml"),
				"utf-8",
			);
			expect(featureMeta).toContain("export_csv");
		});
	});
});
