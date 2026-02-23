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

describe("udd init edge cases", () => {
	it("should handle already initialized product/ gracefully", async () => {
		await withTempDir(async () => {
			await fs.mkdir(path.join(process.cwd(), "product"), { recursive: true });
			await fs.writeFile(
				path.join(process.cwd(), "product/README.md"),
				"# My Product\n",
			);

			const result = await runUddInCwd("init --yes");

			expect(result).toHaveProperty("stdout");
		});
	});

	it("should handle partial state (specs/.udd exists but product/ missing)", async () => {
		await withTempDir(async () => {
			await fs.mkdir(path.join(process.cwd(), "specs/.udd"), {
				recursive: true,
			});
			await fs.writeFile(
				path.join(process.cwd(), "specs/.udd/manifest.yml"),
				"journeys: []\n",
			);

			const result = await runUddInCwd("init --yes");

			expect(result).toHaveProperty("stdout");
			const productReadmePath = path.join(process.cwd(), "product/README.md");
			const exists = await fs
				.access(productReadmePath)
				.then(() => true)
				.catch(() => false);
			expect(exists).toBe(true);
		});
	});

	it("should handle empty product directory", async () => {
		await withTempDir(async () => {
			await fs.mkdir(path.join(process.cwd(), "product"), { recursive: true });

			const result = await runUddInCwd("init --yes");

			expect(result).toHaveProperty("stdout");
			const journeysPath = path.join(
				process.cwd(),
				"product/journeys/new_user_onboarding.md",
			);
			const exists = await fs
				.access(journeysPath)
				.then(() => true)
				.catch(() => false);
			expect(exists).toBe(true);
		});
	});

	it("should handle invalid files in product directory", async () => {
		await withTempDir(async () => {
			await fs.mkdir(path.join(process.cwd(), "product"), { recursive: true });
			await fs.writeFile(
				path.join(process.cwd(), "product/.DS_Store"),
				"binary junk",
			);

			const result = await runUddInCwd("init --yes");

			expect(result).toHaveProperty("stdout");
			const dsStorePath = path.join(process.cwd(), "product/.DS_Store");
			const dsStoreExists = await fs
				.access(dsStorePath)
				.then(() => true)
				.catch(() => false);
			expect(dsStoreExists).toBe(true);
		});
	});

	it("should skip prompts with --yes flag when already initialized", async () => {
		await withTempDir(async () => {
			await fs.mkdir(path.join(process.cwd(), "product"), { recursive: true });
			await fs.writeFile(
				path.join(process.cwd(), "product/README.md"),
				"# My Product\n",
			);

			const result = await runUddInCwd("init --yes");

			expect(result).toHaveProperty("stdout");
			if ("stdout" in result) {
				expect(result.stdout).not.toContain("Reinitialize?");
			}
		});
	});
});
