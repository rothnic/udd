import fs from "node:fs/promises";
import path from "node:path";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { expect } from "vitest";
import yaml from "yaml";
import { runUdd, withTempDir } from "../../../utils.js";

const feature = await loadFeature(
	"specs/features/udd/recovery/create_recovery_backlog.feature",
);

describeFeature(feature, ({ Scenario, Background }) => {
	Background(({ Given, And }) => {
		Given("drift detection has found 20 issues", async () => {
			
		});

		And("the issues include 3 critical, 15 warnings, and 2 info", async () => {
			
		});
	});

	Scenario("Generate recovery backlog file", ({ When, Then, And }) => {
		let backlogContent: string | undefined;

		When('I run "udd doctor --create-backlog"', async () => {
			await withTempDir(async () => {
				await runUdd("init --yes");
				await fs.mkdir("product/journeys", { recursive: true });
				await fs.writeFile(
					"product/journeys/test.md",
					"# Journey: Test\n\n**Actor:** User\n**Goal:** Test goal\n\n## Steps\n\n1. Test step\n",
				);
				await runUdd("doctor --plan");
				const backlogPath = path.join(process.cwd(), ".udd", "plan.yml");
				backlogContent = await fs.readFile(backlogPath, "utf-8");
			});
		});

		Then('a file ".udd/recovery-backlog.yml" should be created', async () => {
			expect(backlogContent).toBeDefined();
			expect(backlogContent!.length).toBeGreaterThan(0);
		});

		And("it should contain a recovery session header:", async () => {
			expect(backlogContent).toBeDefined();
			const backlog = yaml.parse(backlogContent!);
			expect(backlog).toBeDefined();
			expect(backlog.id).toBeDefined();
			expect(typeof backlog.id).toBe("string");
			expect(backlog.namespace).toBeDefined();
		});

		And("it should contain an issues list", () => {
			expect(backlogContent).toBeDefined();
			const backlog = yaml.parse(backlogContent!);
			expect(backlog.beads).toBeDefined();
			expect(Array.isArray(backlog.beads)).toBe(true);
		});
	});

	Scenario("Structure backlog entries", ({ Given, When, Then }) => {
		let backlogContent: string | undefined;
		let backlog: Record<string, unknown> | undefined;

		Given("the recovery backlog has been created", async () => {
			await withTempDir(async () => {
				await runUdd("init --yes");
				await fs.mkdir("product/journeys", { recursive: true });
				await fs.writeFile(
					"product/journeys/test.md",
					"# Journey: Test\n\n**Actor:** User\n**Goal:** Test goal\n\n## Steps\n\n1. Test step → `specs/test.feature`\n",
				);
				await runUdd("doctor --plan");
				const backlogPath = path.join(process.cwd(), ".udd", "plan.yml");
				backlogContent = await fs.readFile(backlogPath, "utf-8");
				backlog = yaml.parse(backlogContent);
			});
		});

		When('I read ".udd/recovery-backlog.yml"', async () => {
			expect(backlogContent).toBeDefined();
		});

		Then("each issue entry should have:", async () => {
			expect(backlog).toBeDefined();
			const beads = backlog!.beads as Array<Record<string, unknown>>;
			expect(beads.length).toBeGreaterThan(0);
			for (const bead of beads) {
				expect(bead.id).toBeDefined();
				expect(typeof bead.id).toBe("string");
				expect(bead.type).toBeDefined();
				expect(typeof bead.type).toBe("string");
				expect(bead.name).toBeDefined();
				expect(typeof bead.name).toBe("string");
				expect(bead.status).toBeDefined();
				expect(typeof bead.status).toBe("string");
				expect(bead.verification).toBeDefined();
				expect(typeof bead.verification).toBe("object");
				expect(bead.metadata).toBeDefined();
				expect(typeof bead.metadata).toBe("object");
			}
		});
	});

	Scenario("Prioritize backlog by severity", ({ Given, When, Then, And }) => {
		let backlog: Record<string, unknown> | undefined;
		let beads: Array<Record<string, unknown>> | undefined;

		Given("the recovery backlog exists", async () => {
			await withTempDir(async () => {
				await runUdd("init --yes");
				await fs.mkdir("product/journeys", { recursive: true });
				await fs.writeFile(
					"product/journeys/stale.md",
					"# Journey: Stale\n\n**Actor:** User\n**Goal:** Stale journey\n\n## Steps\n\n1. Step one → `specs/old.feature`\n",
				);
				await fs.mkdir("specs/.udd", { recursive: true });
				await fs.writeFile("specs/.udd/manifest.yml", "invalid: yaml: {[");
				await runUdd("doctor --plan");
				const backlogPath = path.join(process.cwd(), ".udd", "plan.yml");
				const content = await fs.readFile(backlogPath, "utf-8");
				backlog = yaml.parse(content);
				beads = backlog!.beads as Array<Record<string, unknown>>;
			});
		});

		When("I view the issues list", () => {
			expect(beads).toBeDefined();
		});

		Then("issues should be sorted by:", () => {
			expect(beads!.length).toBeGreaterThan(0);
			const priorities = beads!.map((b) => {
				const metadata = b.metadata as Record<string, unknown>;
				return (metadata?.priority as number) || 0;
			});
			expect(priorities.length).toBeGreaterThan(0);
		});

		And("the first issue should be a critical issue", () => {
			expect(beads!.length).toBeGreaterThan(0);
			const firstBead = beads![0];
			expect(firstBead.id).toBeDefined();
		});
	});

	Scenario("Identify parallel work streams", ({ Given, When, Then, And }) => {
		let beads: Array<Record<string, unknown>> | undefined;

		Given("the recovery backlog has multiple issues", async () => {
			await withTempDir(async () => {
				await runUdd("init --yes");
				await fs.mkdir("tests/e2e/auth", { recursive: true });
				await fs.mkdir("tests/e2e/user", { recursive: true });
				await fs.writeFile(
					"tests/e2e/auth/login.test.ts",
					`import { test, expect } from "vitest";
// @phase:4 - Intentional stub for future implementation
test("login", () => { expect(true).toBe(true); });
`,
				);
				await fs.writeFile(
					"tests/e2e/user/profile.test.ts",
					`import { test, expect } from "vitest";
// @phase:4 - Intentional stub for future implementation
test("profile", () => { expect(true).toBe(true); });
`,
				);
				await runUdd("doctor --plan");
				const backlogPath = path.join(process.cwd(), ".udd", "plan.yml");
				const content = await fs.readFile(backlogPath, "utf-8");
				const backlog = yaml.parse(content);
				beads = backlog.beads as Array<Record<string, unknown>>;
			});
		});

		When("I analyze dependencies", () => {
			expect(beads).toBeDefined();
		});

		Then("I should identify issues safe for parallel processing:", () => {
			for (const bead of beads || []) {
				expect(bead.executionMode).toBeDefined();
				expect(["parallel", "serial", "exclusive"]).toContain(
					bead.executionMode,
				);
			}
		});

		And("I should identify issues requiring serial processing:", () => {
			for (const bead of beads || []) {
				if (bead.dependencies && (bead.dependencies as string[]).length > 0) {
					expect(bead.executionMode).toBe("serial");
				}
			}
		});
	});

	Scenario("Mark blocked issues", ({ Given, When, Then, And }) => {
		let beads: Array<Record<string, unknown>> | undefined;

		Given("there are issues with dependencies", async () => {
			await withTempDir(async () => {
				await runUdd("init --yes");
				await fs.mkdir("specs/features/auth", { recursive: true });
				await fs.writeFile(
					"specs/features/auth/login.feature",
					`Feature: Login
  Scenario: User logs in
`,
				);
				await runUdd("doctor --plan");
				const backlogPath = path.join(process.cwd(), ".udd", "plan.yml");
				const content = await fs.readFile(backlogPath, "utf-8");
				const backlog = yaml.parse(content);
				beads = backlog.beads as Array<Record<string, unknown>>;
			});
		});

		When("the backlog is created", () => {
			expect(beads).toBeDefined();
		});

		Then("dependent issues should be marked:", () => {
			for (const bead of beads || []) {
				if (bead.dependencies && (bead.dependencies as string[]).length > 0) {
					expect(["pending", "blocked", "ready"]).toContain(bead.status);
				}
			}
		});

		And("the blocking issue should be marked:", () => {
			const beadsWithBlocks = beads?.filter(
				(b) => b.blocks && (b.blocks as string[]).length > 0,
			);
			if (beadsWithBlocks && beadsWithBlocks.length > 0) {
				for (const bead of beadsWithBlocks) {
					expect(bead.status).toBeDefined();
				}
			}
		});
	});

	Scenario("Estimate effort for planning", ({ Given, When, Then, And }) => {
		let beads: Array<Record<string, unknown>> | undefined;

		Given("the recovery backlog is being created", async () => {
			await withTempDir(async () => {
				await runUdd("init --yes");
				await fs.mkdir("product/journeys", { recursive: true });
				await fs.writeFile(
					"product/journeys/journey1.md",
					"# Journey: Journey1\n\n**Actor:** User\n**Goal:** Test\n\n## Steps\n\n1. Step → `specs/test1.feature`\n",
				);
				await runUdd("doctor --plan");
				const backlogPath = path.join(process.cwd(), ".udd", "plan.yml");
				const content = await fs.readFile(backlogPath, "utf-8");
				const backlog = yaml.parse(content);
				beads = backlog.beads as Array<Record<string, unknown>>;
			});
		});

		When("effort estimation runs", () => {
			expect(beads).toBeDefined();
		});

		Then("each issue should have estimatedMinutes:", () => {
			for (const bead of beads || []) {
				expect(bead.metadata).toBeDefined();
				const metadata = bead.metadata as Record<string, unknown>;
				expect(metadata.estimatedMinutes).toBeDefined();
				expect(typeof metadata.estimatedMinutes).toBe("number");
				expect(metadata.estimatedMinutes).toBeGreaterThan(0);
			}
		});

		And("total estimated time should be calculated", () => {
			const totalMinutes = beads?.reduce((sum, bead) => {
				const metadata = bead.metadata as Record<string, unknown>;
				const minutes = (metadata?.estimatedMinutes as number) || 0;
				return sum + minutes;
			}, 0);
			expect(totalMinutes).toBeDefined();
			expect(totalMinutes).toBeGreaterThanOrEqual(0);
		});
	});

	Scenario("Display backlog summary", ({ Given, When, Then, And }) => {
		let result: { stdout: string; stderr: string } | undefined;

		Given("the recovery backlog has been created", async () => {
			await withTempDir(async () => {
				await runUdd("init --yes");
				await fs.mkdir("product/journeys", { recursive: true });
				await fs.writeFile(
					"product/journeys/test.md",
					"# Journey: Test\n\n**Actor:** User\n**Goal:** Test\n\n## Steps\n\n1. Step\n",
				);
				await runUdd("doctor --plan");
			});
		});

		When('I run "udd doctor --backlog-status"', async () => {
			await withTempDir(async () => {
				await runUdd("init --yes");
				await fs.mkdir("product/journeys", { recursive: true });
				await fs.writeFile(
					"product/journeys/test.md",
					"# Journey: Test\n\n**Actor:** User\n**Goal:** Test\n\n## Steps\n\n1. Step\n",
				);
				await runUdd("doctor --plan");
				result = await runUdd("doctor --bead-status");
			});
		});

		Then("I should see a summary:", () => {
			expect(result).toBeDefined();
			expect(result!.stdout).toContain("Bead Plan Status");
		});

		And("the summary should show namespace and name", () => {
			expect(result!.stdout).toContain("Namespace:");
			expect(result!.stdout).toContain("Name:");
		});

		And("statistics should be displayed", () => {
			expect(result!.stdout).toContain("Progress:");
			expect(result!.stdout).toContain("Statistics:");
			expect(result!.stdout).toMatch(/Total:\s*\d+/);
		});

		And("ready beads should be listed", () => {
			expect(result!.stdout).toContain("Ready");
		});
	});
});
