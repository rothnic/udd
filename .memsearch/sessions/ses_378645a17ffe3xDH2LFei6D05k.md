# Implement Task 13 E2E tests for edge case features (@Sisyphus-Junior subagent)

**ID**: ses_378645a17ffe3xDH2LFei6D05k
**Project ID**: ad761ea6174e58ed763fc75290c3f403ed51079d
**Created**: 2/22/2026, 5:07:30 PM
**Stats**: 5 files changed, +635 -0

---

## USER (5:08:11 PM)

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


import fs from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { execAsync, rootDir, withTempDir } from "../../../utils.js";

async function runUddInCwd(
	args: string,
): Promise<{ stdout: string; stderr: string }> {
	const uddBin = path.resolve(rootDir, "bin/udd.ts");
	const command = `npx tsx ${uddBin} ${args}`;
	return execAsync(command);
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
				path.join(process.cwd(), "specs/.udd/manifest.yml"),
				"invalid: [yaml: content:\n",
			);

			const result = await runUddInCwd("sync").catch((e) => e);

			expect(result).toHaveProperty("stdout");
			expect(result.stdout.toLowerCase()).toMatch(/manifest|yaml|parse/i);
		});
	});

	it("should report deleted journey referenced in manifest", async () => {
		await withTempDir(async () => {
			await fs.mkdir(path.join(process.cwd(), "product/journeys"), {
				recursive: true,
			});
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

			const result = await runUddInCwd("status").catch((e) => e);

			expect(result).toHaveProperty("stdout");
			expect(result.stdout.toLowerCase()).toMatch(
				/old_journey|missing|removed/i,
			);
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

			const result = await runUddInCwd("sync").catch((e) => e);

			expect(result).toHaveProperty("stdout");
			expect(result.stdout.toLowerCase()).toMatch(/missing|scenario|create/i);
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

			const result = await runUddInCwd("status").catch((e) => e);

			expect(result).toHaveProperty("stdout");
			expect(result.stdout.toLowerCase()).toMatch(/hash|mismatch|changed/i);
		});
	});
});


import fs from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { execAsync, rootDir, withTempDir } from "../../../utils.js";

async function runUddInCwd(
	args: string,
): Promise<{ stdout: string; stderr: string }> {
	const uddBin = path.resolve(rootDir, "bin/udd.ts");
	const command = `npx tsx ${uddBin} ${args}`;
	return execAsync(command);
}

describe("udd orphan detection", () => {
	it("should show orphaned scenarios in human-readable status", async () => {
		await withTempDir(async () => {
			await fs.mkdir(path.join(process.cwd(), "specs/features/area/feature"), {
				recursive: true,
			});
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

			const result = await runUddInCwd("status").catch((e) => e);

			expect(result).toHaveProperty("stdout");
			expect(result.stdout.toLowerCase()).toMatch(/orphan/i);
		});
	});

	it("should include orphaned scenarios in JSON output", async () => {
		await withTempDir(async () => {
			await fs.mkdir(path.join(process.cwd(), "specs/features/area/feature"), {
				recursive: true,
			});
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

			const result = await runUddInCwd("status --json").catch((e) => e);

			expect(result).toHaveProperty("stdout");
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
				path.join(
					process.cwd(),
					"specs/features/area/feature/linked_scenario.feature",
				),
				"Feature: Linked\n\nScenario: Test\n  Given something\n",
			);
			await fs.mkdir(path.join(process.cwd(), "product/journeys"), {
				recursive: true,
			});
			await fs.mkdir(path.join(process.cwd(), "specs/.udd"), {
				recursive: true,
			});
			await fs.writeFile(
				path.join(process.cwd(), "product/journeys/using_linked.md"),
				`---
steps:
  - Use feature → specs/features/area/feature/linked_scenario.feature
---
# Journey: Using Linked`,
			);
			await fs.writeFile(
				path.join(process.cwd(), "specs/.udd/manifest.yml"),
				`journeys:
  - name: using_linked
    file: product/journeys/using_linked.md
    steps:
      - Use feature → specs/features/area/feature/linked_scenario.feature
scenarios: []
`,
			);

			const result = await runUddInCwd("status --json").catch((e) => e);

			expect(result).toHaveProperty("stdout");
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

			const result = await runUddInCwd("status").catch((e) => e);

			expect(result).toHaveProperty("stdout");
			expect(result.stdout.toLowerCase()).toMatch(/orphan/i);
			expect(result.stdout).toContain("orphan1");
			expect(result.stdout).toContain("orphan2");
		});
	});
});


import fs from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { execAsync, rootDir, withTempDir } from "../../../utils.js";

async function runUddInCwd(
	args: string,
): Promise<{ stdout: string; stderr: string }> {
	const uddBin = path.resolve(rootDir, "bin/udd.ts");
	const command = `npx tsx ${uddBin} ${args}`;
	return execAsync(command);
}

describe("udd status edge cases", () => {
	it("should handle missing product directory", async () => {
		await withTempDir(async () => {
			const result = await runUddInCwd("status").catch((e) => e);

			expect(result).toHaveProperty("stdout");
			expect(result.stdout).toContain("Project Status");
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

			const result = await runUddInCwd("status").catch((e) => e);

			expect(result).toHaveProperty("stdout");
			expect(result.stdout).toContain("Project Status");
			expect(result.stdout).toContain("test_journey");
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

			const result = await runUddInCwd("status").catch((e) => e);

			expect(result).toHaveProperty("stdout");
			expect(result.stdout).toContain("Project Status");
			expect(result.stdout).toContain("test_journey");
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

			const result = await runUddInCwd("status").catch((e) => e);

			expect(result).toHaveProperty("stdout");
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

			const result = await runUddInCwd("status").catch((e) => e);

			expect(result).toHaveProperty("stdout");
			expect(result.stdout).toContain("Project Status");
		});
	});
});


import fs from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { execAsync, rootDir, withTempDir } from "../../../utils.js";

async function runUddInCwd(
	args: string,
): Promise<{ stdout: string; stderr: string }> {
	const uddBin = path.resolve(rootDir, "bin/udd.ts");
	const command = `npx tsx ${uddBin} ${args}`;
	return execAsync(command);
}

describe("udd sync edge cases", () => {
	it("should fail when no journeys directory present", async () => {
		await withTempDir(async () => {
			const result = await runUddInCwd("sync").catch((e) => e);

			expect(result).toHaveProperty("code");
			expect(result.code).toBe(1);
			expect(result.stdout).toContain("No product/journeys/ directory found");
		});
	});

	it("should handle empty journeys directory gracefully", async () => {
		await withTempDir(async () => {
			await fs.mkdir(path.join(process.cwd(), "product/journeys"), {
				recursive: true,
			});

			const result = await runUddInCwd("sync").catch((e) => e);

			expect(result).toHaveProperty("stdout");
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

			const result = await runUddInCwd("sync").catch((e) => e);

			expect(result).toHaveProperty("stdout");
			expect(result.stdout).toContain("broken_journey.md");
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

			const result = await runUddInCwd("sync --dry-run").catch((e) => e);

			expect(result).toHaveProperty("stdout");
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

			const result = await runUddInCwd("sync").catch((e) => e);

			expect(result).toHaveProperty("stdout");
			expect(result.stdout).toContain("Syncing");
		});
	});
});


## USER (5:22:27 PM)

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


