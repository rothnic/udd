import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { buildUddCommand, execAsync } from "../../../utils.js";

// @feature udd/recovery/plan_repair.feature
describe("recovery repair planning", () => {
	it("produces ranked dry-run evidence with safe actions and manual refusals", async () => {
		const projectDir = await fs.mkdtemp(path.join(os.tmpdir(), "udd-repair-plan-"));
		const previousCwd = process.cwd();
		try {
			process.chdir(projectDir);
			await fs.mkdir("product/journeys", { recursive: true });
			await fs.mkdir("specs/.udd", { recursive: true });
			await fs.mkdir("specs/features/current", { recursive: true });
			await fs.writeFile(
				"product/journeys/recover.md",
				[
					"# Journey: Recover",
					"",
					"1. Current behavior -> `specs/features/current/kept.feature`",
					"",
				].join("\n"),
			);
			await fs.writeFile(
				"specs/features/current/kept.feature",
				"Feature: Kept\n\n  Scenario: Kept\n    Given kept behavior exists\n",
			);
			await fs.writeFile(
				"specs/.udd/manifest.yml",
				[
					"journeys:",
					"  recover:",
					"    path: product/journeys/recover.md",
					"    hash: old-hash",
					"scenarios:",
					"  specs/features/recovery/missing.feature:",
					"    path: specs/features/recovery/missing.feature",
					"",
				].join("\n"),
			);

			const report = JSON.parse(
				(await execAsync(buildUddCommand("repair --dry-run --json"))).stdout,
			);

			expect(report.mode).toBe("dry-run");
			expect(report.applied).toEqual([]);
			expect(report.proposed).toContainEqual(
				expect.objectContaining({
					kind: "refresh_manifest",
					safe: true,
					reversible: true,
					path: "specs/.udd/manifest.yml",
					would_write: ["specs/.udd/manifest.yml"],
					source_issue: expect.objectContaining({
						type: "journey_stale",
					}),
					source_issues: expect.arrayContaining([
						expect.objectContaining({
							type: "journey_stale",
						}),
					]),
				}),
			);
			expect(report.would_write).toEqual([
				"specs/.udd/manifest.yml",
				"docs/project/reviews/repair/latest-repair-evidence.md",
			]);
			expect(report.refused).toContainEqual(
				expect.objectContaining({
					kind: "manual",
					safe: false,
					path: "specs/features/recovery/missing.feature",
					source_issue: expect.objectContaining({
						type: "missing_scenario",
					}),
				}),
			);
			expect(report.proposed[0].rank).toBeLessThan(report.refused[0].rank);
			expect(report.evidence.written).toBe(false);
			expect(report.evidence.path).toBe(
				"docs/project/reviews/repair/latest-repair-evidence.md",
			);
			expect(report.evidence.markdown).toContain("UDD Repair Dry-Run Evidence");
			expect(report.evidence.markdown).toContain("Apply-Mode Writes");
		} finally {
			process.chdir(previousCwd);
			await fs.rm(projectDir, { recursive: true, force: true });
		}
	});
});
