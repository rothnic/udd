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

describe("udd sync edge cases", () => {
	it("should fail when no journeys directory present", async () => {
		await withTempDir(async () => {
			const result = await runUddInCwd("sync");

			expect(result.code).toBe(1);
			expect(result.stdout).toContain("No product/journeys/ directory found");
		});
	});

	it("should handle empty journeys directory gracefully", async () => {
		await withTempDir(async () => {
			await fs.mkdir(path.join(process.cwd(), "product/journeys"), {
				recursive: true,
			});

			const result = await runUddInCwd("sync");

			expect(result.stdout).toContain("No journey files found");
		});
	});

	it("should warn about invalid journey syntax and continue", async () => {
		await withTempDir(async () => {
			await fs.mkdir(path.join(process.cwd(), "product/journeys"), {
				recursive: true,
			});
			await fs.mkdir(path.join(process.cwd(), "specs/.udd"), {
				recursive: true,
			});
			await fs.writeFile(
				path.join(process.cwd(), "product/journeys/broken_journey.md"),
				"this is not valid markdown with frontmatter ---",
			);
			await fs.writeFile(
				path.join(process.cwd(), "specs/.udd/manifest.yml"),
				"journeys: []\n",
			);

			const result = await runUddInCwd("sync");

			expect(result.stdout).toContain("broken");
			expect(result.stdout).toContain("Journey");
		});
	});

	it("should not modify files in dry-run mode", async () => {
		await withTempDir(async () => {
			await fs.mkdir(path.join(process.cwd(), "product/journeys"), {
				recursive: true,
			});
			await fs.mkdir(path.join(process.cwd(), "specs/.udd"), {
				recursive: true,
			});
			await fs.writeFile(
				path.join(process.cwd(), "product/journeys/new_user.md"),
				`---
steps:
  - User signs up → specs/features/auth/signup.feature
---
# Journey: New User`,
			);
			await fs.writeFile(
				path.join(process.cwd(), "specs/.udd/manifest.yml"),
				"journeys: []\n",
			);

			const result = await runUddInCwd("sync --dry-run");

			expect(result.stdout).toContain("(dry-run");

			const featurePath = path.join(
				process.cwd(),
				"specs/features/auth/signup.feature",
			);
			const featureExists = await fs
				.access(featurePath)
				.then(() => true)
				.catch(() => false);
			expect(featureExists).toBe(false);
		});
	});

	it("should recover from corrupted manifest", async () => {
		await withTempDir(async () => {
			await fs.mkdir(path.join(process.cwd(), "product/journeys"), {
				recursive: true,
			});
			await fs.mkdir(path.join(process.cwd(), "specs/.udd"), {
				recursive: true,
			});
			await fs.writeFile(
				path.join(process.cwd(), "product/journeys/simple.md"),
				`---
steps:
  - User does something → specs/features/test/feature.feature
---
# Journey: Simple`,
			);
			await fs.writeFile(
				path.join(process.cwd(), "specs/.udd/manifest.yml"),
				"this is: [invalid: yaml: content:\n",
			);

			const result = await runUddInCwd("sync");

			expect(result.stdout).toContain("Syncing");
		});
	});
});
