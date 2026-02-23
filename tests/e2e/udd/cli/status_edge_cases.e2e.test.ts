import fs from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { execAsync, rootDir, withTempDir } from "../../../utils.js";

async function runUddInCwd(
	args: string,
): Promise<{ stdout: string; stderr: string; code?: number }> {
	const uddBin = path.resolve(rootDir, "bin/udd.ts");
	const command = `npx tsx ${uddBin} ${args}`;
	try {
		return await execAsync(command);
	} catch (error: unknown) {
		return error as { stdout: string; stderr: string; code: number };
	}
}

describe("udd status edge cases", () => {
	it("should handle missing product directory", async () => {
		await withTempDir(async () => {
			const result = await runUddInCwd("status");

			expect(result.stdout).toContain("Project Status");
			expect(result.stdout).toContain("Use Cases:");
		});
	});

	it("should handle missing manifest while journeys exist", async () => {
		await withTempDir(async () => {
			await fs.mkdir(path.join(process.cwd(), "product/journeys"), {
				recursive: true,
			});
			await fs.writeFile(
				path.join(process.cwd(), "product/journeys/test_journey.md"),
				`---
steps:
  - User does something → specs/features/test/feature.feature
---
# Journey: Test`,
			);

			const result = await runUddInCwd("status");

			expect(result.stdout).toContain("Project Status");
			expect(result.stdout).toContain("Test");
			expect(result.stdout).toContain("needs sync");
		});
	});

	it("should handle corrupted manifest YAML", async () => {
		await withTempDir(async () => {
			await fs.mkdir(path.join(process.cwd(), "product/journeys"), {
				recursive: true,
			});
			await fs.mkdir(path.join(process.cwd(), "specs/.udd"), {
				recursive: true,
			});
			await fs.writeFile(
				path.join(process.cwd(), "product/journeys/test_journey.md"),
				`---
steps:
  - User does something → specs/features/test/feature.feature
---
# Journey: Test`,
			);
			await fs.writeFile(
				path.join(process.cwd(), "specs/.udd/manifest.yml"),
				"invalid: [yaml: content:\n",
			);

			const result = await runUddInCwd("status");

			expect(result.stdout).toContain("Project Status");
			expect(result.stdout).toContain("Test");
		});
	});

	it("should handle feature directory without metadata file", async () => {
		await withTempDir(async () => {
			await fs.mkdir(path.join(process.cwd(), "specs/features/test_feature"), {
				recursive: true,
			});
			await fs.writeFile(
				path.join(process.cwd(), "specs/features/test_feature/test.feature"),
				"Feature: Test\n\nScenario: Test\n  Given something\n",
			);

			const result = await runUddInCwd("status");

			expect(result.stdout).toContain("Project Status");
		});
	});

	it("should handle unparseable journey file gracefully", async () => {
		await withTempDir(async () => {
			await fs.mkdir(path.join(process.cwd(), "product/journeys"), {
				recursive: true,
			});
			await fs.writeFile(
				path.join(process.cwd(), "product/journeys/binary.bin"),
				Buffer.from([0x00, 0x01, 0x02, 0xff, 0xfe]),
			);

			const result = await runUddInCwd("status");

			expect(result.stdout).toContain("Project Status");
		});
	});
});
