import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { buildUddCommand, execAsync } from "../../../utils.js";

// @feature udd/recovery/apply_safe_repairs.feature
describe("recovery safe apply", () => {
	it("applies only safe reversible repairs in a temp project", async () => {
		const projectDir = await fs.mkdtemp(
			path.join(os.tmpdir(), "udd-repair-apply-"),
		);
		const previousCwd = process.cwd();
		try {
			process.chdir(projectDir);
			await fs.mkdir("product/journeys", { recursive: true });
			await fs.mkdir("specs/.udd", { recursive: true });
			await fs.writeFile(
				"product/journeys/recover.md",
				[
					"# Journey: Recover",
					"",
					"1. Missing behavior -> `specs/features/recovery/missing.feature`",
					"",
				].join("\n"),
			);
			await fs.writeFile(
				"specs/.udd/manifest.yml",
				"journeys:\n  recover:\n    path: product/journeys/recover.md\n    hash: old-hash\nscenarios: {}\n",
			);

			const report = JSON.parse(
				(await execAsync(buildUddCommand("repair --apply --json"))).stdout,
			);

			expect(report.mode).toBe("apply");
			expect(report.applied).toContainEqual(
				expect.objectContaining({
					kind: "refresh_manifest",
					path: "specs/.udd/manifest.yml",
					safe: true,
				}),
			);
			expect(report.refused).toEqual([]);
			expect(report.advisory).toContainEqual(
				expect.objectContaining({
					kind: "manual",
					path: "specs/features/recovery/missing.feature",
				}),
			);
			expect(report.would_write).toEqual([
				"specs/.udd/manifest.yml",
				"docs/project/reviews/repair/latest-repair-evidence.md",
			]);
			expect(report.evidence.written).toBe(true);
			await fs.access("docs/project/reviews/repair/latest-repair-evidence.md");
			await expect(
				fs.access("specs/features/recovery/missing.feature"),
			).rejects.toThrow();
			const doctor = JSON.parse(
				(await execAsync(buildUddCommand("doctor --json"))).stdout,
			);
			expect(doctor.healthy).toBe(true);
			expect(doctor.summary.warning).toBe(0);
		} finally {
			process.chdir(previousCwd);
			await fs.rm(projectDir, { recursive: true, force: true });
		}
	});

	it("creates a missing expected journey directory without behavior rewrites", async () => {
		const projectDir = await fs.mkdtemp(
			path.join(os.tmpdir(), "udd-repair-mkdir-"),
		);
		const previousCwd = process.cwd();
		try {
			process.chdir(projectDir);
			await fs.mkdir("product", { recursive: true });
			await fs.mkdir("specs/.udd", { recursive: true });
			await fs.writeFile(
				"specs/.udd/manifest.yml",
				"journeys: {}\nscenarios: {}\n",
			);

			const report = JSON.parse(
				(await execAsync(buildUddCommand("repair --apply --json"))).stdout,
			);

			expect(report.mode).toBe("apply");
			expect(report.applied).toContainEqual(
				expect.objectContaining({
					kind: "mkdir",
					path: "product/journeys",
					safe: true,
					reversible: true,
				}),
			);
			expect(report.would_write).toEqual([
				"product/journeys",
				"docs/project/reviews/repair/latest-repair-evidence.md",
			]);
			expect(report.evidence.written).toBe(true);
			await fs.access("product/journeys");
			await fs.access("docs/project/reviews/repair/latest-repair-evidence.md");
			await expect(fs.access("specs/features")).rejects.toThrow();
		} finally {
			process.chdir(previousCwd);
			await fs.rm(projectDir, { recursive: true, force: true });
		}
	});
});
