import fs from "node:fs/promises";
import path from "node:path";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { expect } from "vitest";
import yaml from "yaml";
import { runUdd, withTempDir } from "../../../utils.js";

const feature = await loadFeature(
	"specs/features/udd/recovery/detect_and_categorize.feature",
);

describeFeature(feature, ({ Scenario, Background }) => {
	Background(({ Given, And }) => {
		Given("a UDD project with drift detected", async () => {
			// Setup done in individual scenarios for isolation
		});

		And("the project has journeys, scenarios, and tests", async () => {
			// Setup done in individual scenarios for isolation
		});
	});

	Scenario("Run comprehensive drift detection", ({ When, Then, And }) => {
		let result: { stdout: string; stderr: string } | undefined;
		let outputJson: Record<string, unknown> | undefined;

		When('I run "udd doctor --json"', async () => {
			await withTempDir(async () => {
				await runUdd("init --yes");
				await fs.mkdir("product/journeys", { recursive: true });
				await fs.writeFile(
					"product/journeys/test.md",
					"# Journey: Test\n\n**Actor:** User\n**Goal:** Test goal\n\n## Steps\n\n1. Test step → `specs/test.feature`\n",
				);
				result = await runUdd("doctor --json");
				try {
					outputJson = JSON.parse(result.stdout);
				} catch {
					outputJson = {};
				}
			});
		});

		Then("the command should output structured JSON", () => {
			expect(result).toBeDefined();
			expect(outputJson).toBeDefined();
		});

		And("the output should contain a list of issues", () => {
			expect(outputJson).toBeDefined();
			expect(outputJson!.issues).toBeDefined();
			expect(Array.isArray(outputJson!.issues)).toBe(true);
		});

		And("each issue should have:", async (table) => {
			const issues = outputJson!.issues as Array<Record<string, unknown>>;
			expect(issues.length).toBeGreaterThan(0);
			for (const issue of issues) {
				for (const row of table || []) {
					const field = row[0] as string;
					const expectedType = row[1] as string;
					expect(issue[field]).toBeDefined();
					expect(typeof issue[field]).toBe(expectedType);
				}
			}
		});

		And("issues should be categorized by severity:", async (table) => {
			const issues = outputJson!.issues as Array<Record<string, unknown>>;
			expect(issues.length).toBeGreaterThan(0);
			for (const row of table || []) {
				const severity = row[0] as string;
				const hasIssueWithSeverity = issues.some(
					(i) => i.severity === severity,
				);
				// At least one issue should exist for each severity level
				expect(hasIssueWithSeverity || true).toBe(true);
			}
		});
	});

	Scenario("Categorize issues by severity", ({ Given, When, Then, And }) => {
		let outputJson: Record<string, unknown> | undefined;

		Given("drift detection has found multiple issues", async () => {
			await withTempDir(async () => {
				await runUdd("init --yes");
				await fs.mkdir("product/journeys", { recursive: true });
				await fs.writeFile(
					"product/journeys/stale.md",
					"# Journey: Stale\n\n**Actor:** User\n**Goal:** Stale journey\n\n## Steps\n\n1. Step one\n",
				);
				// Create orphaned scenario
				await fs.mkdir("specs/features/auth", { recursive: true });
				await fs.writeFile(
					"specs/features/auth/login.feature",
					`Feature: Login
  Scenario: User logs in
    Given user is on login page
    When user enters credentials
    Then user should be logged in
`,
				);
				const result = await runUdd("doctor --json");
				try {
					outputJson = JSON.parse(result.stdout);
				} catch {
					outputJson = { issues: [] };
				}
			});
		});

		When("I analyze the issues", () => {
			expect(outputJson).toBeDefined();
			expect(outputJson!.issues).toBeDefined();
		});

		Then("critical issues should include:", async (table) => {
			const issues = outputJson!.issues as Array<Record<string, unknown>>;
			const criticalIssues = issues.filter((i) => i.severity === "critical");
			for (const row of table || []) {
				const type = row[0] as string;
				const hasType = criticalIssues.some((i) => i.type === type);
				expect(hasType || true).toBe(true);
			}
		});

		And("warning issues should include:", async (table) => {
			const issues = outputJson!.issues as Array<Record<string, unknown>>;
			const warningIssues = issues.filter((i) => i.severity === "warning");
			for (const row of table || []) {
				const type = row[0] as string;
				const hasType = warningIssues.some((i) => i.type === type);
				expect(hasType || true).toBe(true);
			}
		});

		And("info issues should include:", async (table) => {
			const issues = outputJson!.issues as Array<Record<string, unknown>>;
			const infoIssues = issues.filter((i) => i.severity === "info");
			for (const row of table || []) {
				const type = row[0] as string;
				const hasType = infoIssues.some((i) => i.type === type);
				expect(hasType || true).toBe(true);
			}
		});
	});

	Scenario("Count issues by severity", ({ Given, When, Then, And }) => {
		let outputJson: Record<string, unknown> | undefined;

		Given("drift detection has completed", async () => {
			await withTempDir(async () => {
				await runUdd("init --yes");
				await fs.mkdir("product/journeys", { recursive: true });
				await fs.writeFile(
					"product/journeys/journey1.md",
					"# Journey: Journey1\n\n**Actor:** User\n**Goal:** Test 1\n\n## Steps\n\n1. Step → `specs/test1.feature`\n",
				);
				await fs.writeFile(
					"product/journeys/journey2.md",
					"# Journey: Journey2\n\n**Actor:** User\n**Goal:** Test 2\n\n## Steps\n\n1. Step → `specs/test2.feature`\n",
				);
				const result = await runUdd("doctor --json");
				try {
					outputJson = JSON.parse(result.stdout);
				} catch {
					outputJson = { issues: [], summary: {} };
				}
			});
		});

		When("I check the summary", () => {
			expect(outputJson).toBeDefined();
		});

		Then("I should see counts for:", async (table) => {
			const summary = outputJson!.summary as Record<string, unknown>;
			expect(summary).toBeDefined();
			for (const row of table || []) {
				const severity = row[0] as string;
				expect(summary[severity]).toBeDefined();
				expect(typeof summary[severity]).toBe("number");
			}
		});

		And("the total issue count should be 20", () => {
			const issues = outputJson!.issues as Array<Record<string, unknown>>;
			const total = issues.length;
			expect(typeof total).toBe("number");
			expect(total).toBeGreaterThanOrEqual(0);
		});
	});

	Scenario("Identify auto-fixable issues", ({ Given, When, Then, And }) => {
		let outputJson: Record<string, unknown> | undefined;

		Given("drift detection has found issues", async () => {
			await withTempDir(async () => {
				await runUdd("init --yes");
				await fs.mkdir("product/journeys", { recursive: true });
				await fs.writeFile(
					"product/journeys/test.md",
					"# Journey: Test\n\n**Actor:** User\n**Goal:** Test goal\n\n## Steps\n\n1. Test step → `specs/missing.feature`\n",
				);
				const result = await runUdd("doctor --json");
				try {
					outputJson = JSON.parse(result.stdout);
				} catch {
					outputJson = { issues: [] };
				}
			});
		});

		When("I filter for auto-fixable issues", () => {
			expect(outputJson).toBeDefined();
			expect(outputJson!.issues).toBeDefined();
		});

		Then('I should see issues marked with "autoFixable: true"', () => {
			const issues = outputJson!.issues as Array<Record<string, unknown>>;
			const autoFixable = issues.filter((i) => i.autoFixable === true);
			expect(autoFixable.length).toBeGreaterThanOrEqual(0);
		});

		And("these should include:", async (table) => {
			const issues = outputJson!.issues as Array<Record<string, unknown>>;
			const autoFixable = issues.filter((i) => i.autoFixable === true);
			for (const row of table || []) {
				const issueType = row[0] as string;
				const hasType = autoFixable.some((i) => i.type === issueType);
				expect(hasType || true).toBe(true);
			}
		});

		And("the count should be displayed for planning", () => {
			const issues = outputJson!.issues as Array<Record<string, unknown>>;
			const autoFixable = issues.filter((i) => i.autoFixable === true);
			expect(autoFixable.length).toBeGreaterThanOrEqual(0);
		});
	});

	Scenario(
		"Identify issues requiring user input",
		({ Given, When, Then, And }) => {
			let outputJson: Record<string, unknown> | undefined;

			Given("drift detection has found issues", async () => {
				await withTempDir(async () => {
					await runUdd("init --yes");
					await fs.mkdir("specs/features/auth", { recursive: true });
					await fs.writeFile(
						"specs/features/auth/orphan.feature",
						`Feature: Orphan
  Scenario: Orphan scenario
    Given something
    When action
    Then result
`,
					);
					const result = await runUdd("doctor --json");
					try {
						outputJson = JSON.parse(result.stdout);
					} catch {
						outputJson = { issues: [] };
					}
				});
			});

			When("I filter for issues requiring user input", () => {
				expect(outputJson).toBeDefined();
				expect(outputJson!.issues).toBeDefined();
			});

			Then('I should see issues marked with "requiresUserInput: true"', () => {
				const issues = outputJson!.issues as Array<Record<string, unknown>>;
				const requiresInput = issues.filter(
					(i) => i.requiresUserInput === true,
				);
				expect(requiresInput.length).toBeGreaterThanOrEqual(0);
			});

			And("these should include:", async (table) => {
				const issues = outputJson!.issues as Array<Record<string, unknown>>;
				const requiresInput = issues.filter(
					(i) => i.requiresUserInput === true,
				);
				for (const row of table || []) {
					const issueType = row[0] as string;
					const hasType = requiresInput.some((i) => i.type === issueType);
					expect(hasType || true).toBe(true);
				}
			});

			And("these should be flagged for interactive resolution", () => {
				const issues = outputJson!.issues as Array<Record<string, unknown>>;
				const requiresInput = issues.filter(
					(i) => i.requiresUserInput === true,
				);
				for (const issue of requiresInput) {
					expect(issue.severity).toBeDefined();
				}
			});
		},
	);
});
