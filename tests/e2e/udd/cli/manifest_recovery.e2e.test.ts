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

describe("udd manifest recovery", () => {
	it("should detect invalid YAML in manifest and continue", async () => {
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
				"invalid: [yaml: content:\n",
			);

			const result = await runUddInCwd("sync");

			expect(result.stdout).toContain("Syncing");
		});
	});

	it("should report deleted journey referenced in manifest", async () => {
		await withTempDir(async () => {
			await fs.mkdir(path.join(process.cwd(), "specs/.udd"), {
				recursive: true,
			});
			await fs.writeFile(
				path.join(process.cwd(), "specs/.udd/manifest.yml"),
				`journeys:
  - name: old_journey
    file: product/journeys/old_journey.md
    steps: []
scenarios: []
`,
			);

			const result = await runUddInCwd("status");

			expect(result.stdout).toContain("Project Status");
		});
	});

	it("should report missing scenario referenced by journey in manifest", async () => {
		await withTempDir(async () => {
			await fs.mkdir(path.join(process.cwd(), "product/journeys"), {
				recursive: true,
			});
			await fs.mkdir(path.join(process.cwd(), "specs/.udd"), {
				recursive: true,
			});
			await fs.writeFile(
				path.join(process.cwd(), "product/journeys/new_journey.md"),
				`---
steps:
  - User does something → specs/features/foo/bar.feature
---
# Journey: New Journey`,
			);
			await fs.writeFile(
				path.join(process.cwd(), "specs/.udd/manifest.yml"),
				`journeys:
  - name: new_journey
    file: product/journeys/new_journey.md
    steps:
      - User does something → specs/features/foo/bar.feature
scenarios: []
`,
			);

			const result = await runUddInCwd("sync");

			expect(result.stdout.toLowerCase()).toMatch(
				/missing|scenario|create|journey/i,
			);
		});
	});

	it("should detect scenario hash mismatch", async () => {
		await withTempDir(async () => {
			await fs.mkdir(path.join(process.cwd(), "specs/features/baz"), {
				recursive: true,
			});
			await fs.mkdir(path.join(process.cwd(), "specs/.udd"), {
				recursive: true,
			});
			await fs.writeFile(
				path.join(process.cwd(), "specs/features/baz/qux.feature"),
				"Feature: Qux\n\nScenario: Test\n  Given something\n",
			);
			await fs.writeFile(
				path.join(process.cwd(), "specs/.udd/manifest.yml"),
				`journeys: []
scenarios:
  - file: specs/features/baz/qux.feature
    hash: "a1b2c3d4e5f6"
`,
			);

			const result = await runUddInCwd("status");

			expect(result.stdout).toContain("Project Status");
		});
	});
});
