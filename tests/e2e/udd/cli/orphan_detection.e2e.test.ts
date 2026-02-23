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

describe("udd orphan detection", () => {
	it("should show orphaned scenarios in human-readable status", async () => {
		await withTempDir(async () => {
			await fs.mkdir(path.join(process.cwd(), "specs/features/area/feature"), {
				recursive: true,
			});
			await fs.writeFile(
				path.join(process.cwd(), "specs/features/area/feature/_feature.yml"),
				"id: area/feature\nname: Feature\n",
			);
			await fs.writeFile(
				path.join(
					process.cwd(),
					"specs/features/area/feature/unused_scenario.feature",
				),
				"Feature: Unused\n\nScenario: Test\n  Given something\n",
			);
			await fs.mkdir(path.join(process.cwd(), "specs/.udd"), {
				recursive: true,
			});
			await fs.writeFile(
				path.join(process.cwd(), "specs/.udd/manifest.yml"),
				"journeys: []\nscenarios: []\n",
			);

			const result = await runUddInCwd("status");

			expect(result.stdout).toContain("Orphaned");
			expect(result.stdout).toContain("unused_scenario");
		});
	});

	it("should include orphaned scenarios in JSON output", async () => {
		await withTempDir(async () => {
			await fs.mkdir(path.join(process.cwd(), "specs/features/area/feature"), {
				recursive: true,
			});
			await fs.writeFile(
				path.join(process.cwd(), "specs/features/area/feature/_feature.yml"),
				"id: area/feature\nname: Feature\n",
			);
			await fs.writeFile(
				path.join(
					process.cwd(),
					"specs/features/area/feature/orphan_json.feature",
				),
				"Feature: Orphan JSON\n\nScenario: Test\n  Given something\n",
			);
			await fs.mkdir(path.join(process.cwd(), "specs/.udd"), {
				recursive: true,
			});
			await fs.writeFile(
				path.join(process.cwd(), "specs/.udd/manifest.yml"),
				"journeys: []\nscenarios: []\n",
			);

			const result = await runUddInCwd("status --json");

			const json = JSON.parse(result.stdout);
			expect(json).toHaveProperty("orphaned_scenarios");
			expect(json.orphaned_scenarios).toContain("area/feature/orphan_json");
		});
	});

	it("should not report referenced scenarios as orphans", async () => {
		await withTempDir(async () => {
			await fs.mkdir(path.join(process.cwd(), "specs/features/area/feature"), {
				recursive: true,
			});
			await fs.writeFile(
				path.join(process.cwd(), "specs/features/area/feature/_feature.yml"),
				"id: area/feature\nname: Feature\n",
			);
			await fs.writeFile(
				path.join(
					process.cwd(),
					"specs/features/area/feature/linked_scenario.feature",
				),
				"Feature: Linked\n\nScenario: Test\n  Given something\n",
			);
			await fs.mkdir(path.join(process.cwd(), "specs/use-cases"), {
				recursive: true,
			});
			await fs.writeFile(
				path.join(process.cwd(), "specs/use-cases/test.yml"),
				`name: Test Use Case
outcomes:
  - name: Done
    scenarios:
      - area/feature/linked_scenario
`,
			);
			await fs.mkdir(path.join(process.cwd(), "specs/.udd"), {
				recursive: true,
			});
			await fs.writeFile(
				path.join(process.cwd(), "specs/.udd/manifest.yml"),
				"journeys: []\nscenarios: []\n",
			);

			const result = await runUddInCwd("status --json");

			const json = JSON.parse(result.stdout);
			if (json.orphaned_scenarios) {
				expect(json.orphaned_scenarios).not.toContain(
					"area/feature/linked_scenario",
				);
			}
		});
	});

	it("should aggregate and list multiple orphaned scenarios", async () => {
		await withTempDir(async () => {
			await fs.mkdir(path.join(process.cwd(), "specs/features/area/feature"), {
				recursive: true,
			});
			await fs.writeFile(
				path.join(process.cwd(), "specs/features/area/feature/_feature.yml"),
				"id: area/feature\nname: Feature\n",
			);
			await fs.writeFile(
				path.join(process.cwd(), "specs/features/area/feature/orphan1.feature"),
				"Feature: Orphan1\n\nScenario: Test\n  Given something\n",
			);
			await fs.writeFile(
				path.join(process.cwd(), "specs/features/area/feature/orphan2.feature"),
				"Feature: Orphan2\n\nScenario: Test\n  Given something\n",
			);
			await fs.mkdir(path.join(process.cwd(), "specs/.udd"), {
				recursive: true,
			});
			await fs.writeFile(
				path.join(process.cwd(), "specs/.udd/manifest.yml"),
				"journeys: []\nscenarios: []\n",
			);

			const result = await runUddInCwd("status");

			expect(result.stdout).toContain("Orphaned");
			expect(result.stdout).toContain("orphan1");
			expect(result.stdout).toContain("orphan2");
		});
	});
});
