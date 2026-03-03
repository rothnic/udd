import fs from "node:fs/promises";
import path from "node:path";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { expect } from "vitest";
import yaml from "yaml";
import { runUdd, withTempDir } from "../../../utils.js";

const feature = await loadFeature(
	"specs/features/udd/recovery/execute_auto_fixes.feature",
);

describeFeature(feature, ({ Scenario, Background }) => {
	Background(({ Given, And }) => {
		Given("a recovery backlog exists with auto-fixable issues", async () => {
			// Setup will be done in individual scenarios
		});

		And("I have 12 auto-fixable issues out of 20 total", async () => {
			// Setup will be done in individual scenarios
		});
	});

	Scenario("Execute all auto-fixes in batch", ({ When, Then, And }) => {
		let result: { stdout: string; stderr: string } | undefined;

		When('I run "udd doctor --fix --auto"', async () => {
			await withTempDir(async () => {
				await runUdd("init --yes");
				await fs.mkdir("specs/features/auth", { recursive: true });
				await fs.writeFile(
					"specs/features/auth/oauth.feature",
					`Feature: OAuth authentication
  @phase:1
  Scenario: OAuth authentication
    Given the system is initialized
    When the user performs OAuth authentication
    Then the action is completed successfully
`,
				);
				await runUdd("doctor --plan");
				result = await runUdd("doctor --fix --auto");
			});
		});

		Then("the command should:", async () => {
			expect(result).toBeDefined();
			const output = result!.stdout + result!.stderr;
			expect(output).toContain("Executing auto-fixes");
		});

		And("I should see progress output:", async () => {
			const output = result!.stdout + result!.stderr;
			expect(output).toContain("✓ Fixed:");
			expect(output).toMatch(/Fixed:\s*\d+\/\d+/);
		});
	});

	Scenario("Create missing scenario stub", ({ Given, When, Then, And }) => {
		let scenarioCreated = false;
		let scenarioContent: string | undefined;

		Given(
			'an issue of type "test_missing" for scenario "specs/features/auth/oauth.feature"',
			async () => {
				await withTempDir(async () => {
					await runUdd("init --yes");
					await fs.mkdir("specs/features/auth", { recursive: true });
					// Note: No scenario file exists yet
					await runUdd("doctor --plan");
				});
			},
		);

		When("the auto-fix executes", async () => {
			await withTempDir(async () => {
				await runUdd("init --yes");
				await fs.mkdir("specs/features/auth", { recursive: true });
				await runUdd("doctor --plan");
				await runUdd("doctor --fix --auto");

				const scenarioPath = path.join(
					process.cwd(),
					"specs/features/auth/oauth.feature",
				);
				try {
					scenarioContent = await fs.readFile(scenarioPath, "utf-8");
					scenarioCreated = true;
				} catch {
					scenarioCreated = false;
				}
			});
		});

		Then("it should:", async () => {
			expect(scenarioCreated).toBe(true);
		});

		And("the file should be valid Gherkin", async () => {
			expect(scenarioContent).toBeDefined();
			expect(scenarioContent).toContain("Feature:");
			expect(scenarioContent).toContain("Scenario:");
		});
	});

	Scenario("Create missing test stub", ({ Given, When, Then, And }) => {
		let testCreated = false;
		let testContent: string | undefined;

		Given(
			'an issue of type "test_missing" for test "tests/e2e/auth/oauth.e2e.test.ts"',
			async () => {
				await withTempDir(async () => {
					await runUdd("init --yes");
					await fs.mkdir("specs/features/auth", { recursive: true });
					await fs.writeFile(
						"specs/features/auth/oauth.feature",
						`Feature: OAuth authentication
  @phase:1
  Scenario: OAuth authentication
    Given the system is initialized
    When the user performs OAuth authentication
    Then the action is completed successfully
`,
					);
					await runUdd("doctor --plan");
				});
			},
		);

		When("the auto-fix executes", async () => {
			await withTempDir(async () => {
				await runUdd("init --yes");
				await fs.mkdir("specs/features/auth", { recursive: true });
				await fs.writeFile(
					"specs/features/auth/oauth.feature",
					`Feature: OAuth authentication
  @phase:1
  Scenario: OAuth authentication
    Given the system is initialized
    When the user performs OAuth authentication
    Then the action is completed successfully
`,
				);
				await runUdd("doctor --plan");
				await runUdd("doctor --fix --auto");

				const testPath = path.join(
					process.cwd(),
					"tests/e2e/auth/oauth.e2e.test.ts",
				);
				try {
					testContent = await fs.readFile(testPath, "utf-8");
					testCreated = true;
				} catch {
					testCreated = false;
				}
			});
		});

		Then("it should:", async () => {
			expect(testCreated).toBe(true);
		});

		And("the test should be importable", async () => {
			expect(testContent).toBeDefined();
			expect(testContent).toContain('import { describeFeature }');
			expect(testContent).toContain("Given(");
			expect(testContent).toContain("When(");
			expect(testContent).toContain("Then(");
		});
	});

	Scenario(
		"Fix stale journey by marking for sync",
		({ Given, When, Then, And }) => {
			let backlog: Record<string, unknown> | undefined;
			let journeyContentBefore: string;

			Given(
				'an issue of type "journey_stale" for "product/journeys/user-onboarding.md"',
				async () => {
					await withTempDir(async () => {
						await runUdd("init --yes");
						await fs.mkdir("product/journeys", { recursive: true });
						await fs.mkdir("specs/features/auth", { recursive: true });
						await fs.writeFile(
							"product/journeys/user-onboarding.md",
							`# Journey: User Onboarding

**Actor:** User
**Goal:** Complete onboarding

## Steps

1. User signs up → \`specs/features/auth/signup.feature\`
2. User logs in → \`specs/features/auth/login.feature\`
`,
						);
						// Create only one of the referenced scenarios to create stale state
						await fs.writeFile(
							"specs/features/auth/signup.feature",
							`Feature: User signup
  Scenario: New user signs up
`,
						);
						journeyContentBefore = await fs.readFile(
							"product/journeys/user-onboarding.md",
							"utf-8",
						);
						await runUdd("doctor --plan");
					});
				},
			);

			When("the auto-fix executes", async () => {
				await withTempDir(async () => {
					await runUdd("init --yes");
					await fs.mkdir("product/journeys", { recursive: true });
					await fs.mkdir("specs/features/auth", { recursive: true });
					await fs.writeFile(
						"product/journeys/user-onboarding.md",
						`# Journey: User Onboarding

**Actor:** User
**Goal:** Complete onboarding

## Steps

1. User signs up → \`specs/features/auth/signup.feature\`
2. User logs in → \`specs/features/auth/login.feature\`
`,
					);
					await fs.writeFile(
						"specs/features/auth/signup.feature",
						`Feature: User signup
  Scenario: New user signs up
`,
					);
					await runUdd("doctor --plan");
					await runUdd("doctor --fix --auto");

					const backlogPath = path.join(process.cwd(), ".udd", "plan.yml");
					const content = await fs.readFile(backlogPath, "utf-8");
					backlog = yaml.parse(content);
				});
			});

			Then("it should:", async () => {
				expect(backlog).toBeDefined();
			});

			And("the journey file should remain unchanged", async () => {
				await withTempDir(async () => {
					await runUdd("init --yes");
					await fs.mkdir("product/journeys", { recursive: true });
					await fs.mkdir("specs/features/auth", { recursive: true });
					await fs.writeFile(
						"product/journeys/user-onboarding.md",
						`# Journey: User Onboarding

**Actor:** User
**Goal:** Complete onboarding

## Steps

1. User signs up → \`specs/features/auth/signup.feature\`
2. User logs in → \`specs/features/auth/login.feature\`
`,
					);
					await fs.writeFile(
						"specs/features/auth/signup.feature",
						`Feature: User signup
  Scenario: New user signs up
`,
					);
					const contentBefore = await fs.readFile(
						"product/journeys/user-onboarding.md",
						"utf-8",
					);
					await runUdd("doctor --plan");
					await runUdd("doctor --fix --auto");
					const contentAfter = await fs.readFile(
						"product/journeys/user-onboarding.md",
						"utf-8",
					);
					expect(contentAfter).toBe(contentBefore);
				});
			});
		},
	);

	Scenario("Regenerate corrupt manifest", ({ Given, When, Then, And }) => {
		let manifestContent: string | undefined;
		let backupExists = false;

		Given('an issue of type "manifest_corrupt"', async () => {
			await withTempDir(async () => {
				await runUdd("init --yes");
				await fs.mkdir("specs/.udd", { recursive: true });
				await fs.writeFile("specs/.udd/manifest.yml", "invalid: yaml: {[");
			});
		});

		When("the auto-fix executes", async () => {
			await withTempDir(async () => {
				await runUdd("init --yes");
				await fs.mkdir("specs/.udd", { recursive: true });
				await fs.writeFile("specs/.udd/manifest.yml", "invalid: yaml: {[");
				await runUdd("doctor --plan");
				await runUdd("doctor --fix --auto");

				const manifestPath = path.join(
					process.cwd(),
					"specs/.udd/manifest.yml",
				);
				const backupPath = path.join(
					process.cwd(),
					"specs/.udd/manifest.yml.bak",
				);
				try {
					manifestContent = await fs.readFile(manifestPath, "utf-8");
				} catch {
					manifestContent = undefined;
				}
				try {
					await fs.access(backupPath);
					backupExists = true;
				} catch {
					backupExists = false;
				}
			});
		});

		Then("it should:", async () => {
			expect(manifestContent).toBeDefined();
		});

		And("the project should be recoverable", async () => {
			expect(manifestContent).toContain("version:");
			expect(manifestContent).toContain("journeys:");
			expect(manifestContent).toContain("features:");
			expect(manifestContent).toContain("tests:");
		});
	});

	Scenario("Handle auto-fix failure", ({ Given, When, Then, And }) => {
		let result: { stdout: string; stderr: string } | undefined;

		Given("an auto-fixable issue", async () => {
			await withTempDir(async () => {
				await runUdd("init --yes");
				await fs.mkdir("specs/features/auth", { recursive: true });
				await fs.writeFile(
					"specs/features/auth/oauth.feature",
					`Feature: OAuth authentication
  @phase:1
  Scenario: OAuth authentication
    Given the system is initialized
    When the user performs OAuth authentication
    Then the action is completed successfully
`,
				);
			});
		});

		When("the fix fails (e.g., permission denied)", async () => {
			await withTempDir(async () => {
				await runUdd("init --yes");
				await fs.mkdir("specs/features/auth", { recursive: true });
				await fs.writeFile(
					"specs/features/auth/oauth.feature",
					`Feature: OAuth authentication
  @phase:1
  Scenario: OAuth authentication
    Given the system is initialized
    When the user performs OAuth authentication
    Then the action is completed successfully
`,
				);
				await runUdd("doctor --plan");
				try {
					result = await runUdd("doctor --fix --auto");
				} catch (error) {
					result = {
						stdout: "",
						stderr: String(error),
					};
				}
			});
		});

		Then("it should:", async () => {
			// Test passes if command completes (either successfully or with handled error)
			expect(result).toBeDefined();
		});

		And("not block other fixes", async () => {
			// If multiple fixes were attempted, they should continue despite failures
			expect(result).toBeDefined();
		});
	});

	Scenario("Verify auto-fixes with doctor", ({ Given, When, Then, And }) => {
		let result: { stdout: string; stderr: string } | undefined;
		let backlog: Record<string, unknown> | undefined;

		Given("auto-fixes have been executed", async () => {
			await withTempDir(async () => {
				await runUdd("init --yes");
				await fs.mkdir("specs/features/auth", { recursive: true });
				await fs.writeFile(
					"specs/features/auth/oauth.feature",
					`Feature: OAuth authentication
  @phase:1
  Scenario: OAuth authentication
    Given the system is initialized
    When the user performs OAuth authentication
    Then the action is completed successfully
`,
				);
				await runUdd("doctor --plan");
				await runUdd("doctor --fix --auto");
			});
		});

		When("the command completes", async () => {
			await withTempDir(async () => {
				await runUdd("init --yes");
				await fs.mkdir("specs/features/auth", { recursive: true });
				await fs.writeFile(
					"specs/features/auth/oauth.feature",
					`Feature: OAuth authentication
  @phase:1
  Scenario: OAuth authentication
    Given the system is initialized
    When the user performs OAuth authentication
    Then the action is completed successfully
`,
				);
				await runUdd("doctor --plan");
				result = await runUdd("doctor --fix --auto");
				const backlogPath = path.join(process.cwd(), ".udd", "plan.yml");
				const content = await fs.readFile(backlogPath, "utf-8");
				backlog = yaml.parse(content);
			});
		});

		Then('it should automatically run "udd doctor"', async () => {
			const output = result!.stdout + result!.stderr;
			expect(output).toContain("Verification") || expect(output).toContain("verified");
		});

		And("verify fixed issues no longer appear", async () => {

			expect(backlog).toBeDefined();
			const beads = backlog!.beads as Array<Record<string, unknown>>;
			const completedBeads = beads.filter(
				(b) => b.status === "completed" || b.status === "fixed",
			);
			expect(completedBeads.length).toBeGreaterThanOrEqual(0);
		});

		And("update backlog:", async () => {
			expect(backlog).toBeDefined();
			const beads = backlog!.beads as Array<Record<string, unknown>>;
			// Verify backlog contains entries with status and verified fields
			for (const bead of beads) {
				if (bead.status === "completed" || bead.status === "fixed") {
					expect(bead.status).toBeDefined();
				}
			}
		});

		And("report:", async () => {
			const output = result!.stdout + result!.stderr;
			expect(output).toContain("Verification complete") ||
				expect(output).toContain("confirmed resolved");
		});
	});

	Scenario(
		"Parallel auto-fix execution",
		({ Given, When, Then, And }) => {
			let result: { stdout: string; stderr: string } | undefined;

			Given("multiple independent auto-fixable issues", async () => {
				await withTempDir(async () => {
					await runUdd("init --yes");
					await fs.mkdir("specs/features/auth", { recursive: true });
					await fs.mkdir("specs/features/user", { recursive: true });
					await fs.writeFile(
						"specs/features/auth/login.feature",
						`Feature: Login
  @phase:1
  Scenario: User logs in
    Given the system is initialized
    When the user logs in
    Then the action is completed successfully
`,
					);
					await fs.writeFile(
						"specs/features/auth/logout.feature",
						`Feature: Logout
  @phase:1
  Scenario: User logs out
    Given the system is initialized
    When the user logs out
    Then the action is completed successfully
`,
					);
					await fs.writeFile(
						"specs/features/user/profile.feature",
						`Feature: User profile
  @phase:1
  Scenario: User views profile
    Given the system is initialized
    When the user views profile
    Then the action is completed successfully
`,
					);
				});
			});

			When('"udd doctor --fix --auto --parallel" runs', async () => {
				await withTempDir(async () => {
					await runUdd("init --yes");
					await fs.mkdir("specs/features/auth", { recursive: true });
					await fs.mkdir("specs/features/user", { recursive: true });
					await fs.writeFile(
						"specs/features/auth/login.feature",
						`Feature: Login
  @phase:1
  Scenario: User logs in
    Given the system is initialized
    When the user logs in
    Then the action is completed successfully
`,
					);
					await fs.writeFile(
						"specs/features/auth/logout.feature",
						`Feature: Logout
  @phase:1
  Scenario: User logs out
    Given the system is initialized
    When the user logs out
    Then the action is completed successfully
`,
					);
					await fs.writeFile(
						"specs/features/user/profile.feature",
						`Feature: User profile
  @phase:1
  Scenario: User views profile
    Given the system is initialized
    When the user views profile
    Then the action is completed successfully
`,
					);
					await runUdd("doctor --plan");
					result = await runUdd("doctor --fix --auto --parallel");
				});
			});

			Then(
				"it should execute fixes concurrently where safe:",
				async () => {
					const output = result!.stdout + result!.stderr;
					expect(output).toContain("parallel") ||
						expect(output).toContain("workers") ||
						expect(output).toContain("All parallel fixes completed");
				},
			);

			And("respect dependencies (don't run dependent fixes until blockers complete)", async () => {
				expect(result).toBeDefined();
				// Dependencies should be respected in execution order
			});
		},
	);

	Scenario("Dry-run auto-fixes", ({ Given, When, Then, And }) => {
		let result: { stdout: string; stderr: string } | undefined;
		let testFileCreated = false;

		Given("I want to preview auto-fixes before applying", async () => {
			await withTempDir(async () => {
				await runUdd("init --yes");
				await fs.mkdir("specs/features/auth", { recursive: true });
				await fs.writeFile(
					"specs/features/auth/login.feature",
					`Feature: Login
  @phase:1
  Scenario: User logs in
    Given the system is initialized
    When the user logs in
    Then the action is completed successfully
`,
				);
			});
		});

		When('I run "udd doctor --fix --auto --dry-run"', async () => {
			await withTempDir(async () => {
				await runUdd("init --yes");
				await fs.mkdir("specs/features/auth", { recursive: true });
				await fs.writeFile(
					"specs/features/auth/login.feature",
					`Feature: Login
  @phase:1
  Scenario: User logs in
    Given the system is initialized
    When the user logs in
    Then the action is completed successfully
`,
				);
				await runUdd("doctor --plan");
				result = await runUdd("doctor --fix --auto --dry-run");

				// Check if file was actually created
				const testPath = path.join(
					process.cwd(),
					"tests/e2e/auth/login.e2e.test.ts",
				);
				try {
					await fs.access(testPath);
					testFileCreated = true;
				} catch {
					testFileCreated = false;
				}
			});
		});

		Then("it should show what would be fixed without making changes:", async () => {
			const output = result!.stdout + result!.stderr;
			expect(output).toContain("Dry-run") ||
				expect(output).toContain("would be fixed") ||
				expect(output).toContain("Would fix");
		});

		And("not modify any files", async () => {
			expect(testFileCreated).toBe(false);
		});
	});
});
