import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { buildUddCommand, execAsync } from "../../../utils.js";

// @feature udd/recovery/refuse_behavior_rewrites.feature
describe("recovery behavior rewrite refusal", () => {
	it("refuses to create missing behavior scenarios from manifest drift", async () => {
		const projectDir = await fs.mkdtemp(path.join(os.tmpdir(), "udd-repair-refuse-"));
		const previousCwd = process.cwd();
		try {
			process.chdir(projectDir);
			await fs.mkdir("product/journeys", { recursive: true });
			await fs.mkdir("specs/.udd", { recursive: true });
			await fs.writeFile("product/journeys/recover.md", "# Journey: Recover\n");
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

			expect(report.refused).toContainEqual(
				expect.objectContaining({
					kind: "manual",
					path: "specs/features/recovery/missing.feature",
					description: expect.stringContaining("will not rewrite behavior specs"),
					reason: expect.stringContaining("missing scenario"),
				}),
			);
			expect(report.proposed).not.toContainEqual(
				expect.objectContaining({
					path: "specs/features/recovery/missing.feature",
				}),
			);
		} finally {
			process.chdir(previousCwd);
			await fs.rm(projectDir, { recursive: true, force: true });
		}
	});
});

