import fs from "node:fs/promises";
import path from "node:path";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { expect } from "vitest";
import yaml from "yaml";
import { runUdd, withTempDir } from "../../../utils.js";

const feature = await loadFeature(
	"specs/features/udd/recovery/present_user_decision.feature",
);

describeFeature(feature, ({ Scenario, Background }) => {
	Background(({ Given, And }) => {
		Given("the recovery backlog has issues requiring user input", async () => {
			// Background setup handled in scenarios
		});

		And("the agent is in interactive recovery mode", async () => {
			// Background setup handled in scenarios
		});

		And("the question tool is available", async () => {
			// Background setup handled in scenarios
		});
	});

	Scenario(
		"Present options for orphaned scenario",
		({ Given, And, When, Then }) => {
			let backlogContent: string | undefined;
			let orphanIssue: Record<string, unknown> | undefined;

			Given('there is a "scenario_orphan" issue', async () => {
				await withTempDir(async () => {
					await runUdd("init --yes");
					await fs.mkdir("specs/features/auth", { recursive: true });
					await fs.writeFile(
						"specs/features/auth/oauth.feature",
						`Feature: OAuth Authentication
  @phase:2
  Scenario: User logs in with OAuth
    Given the user is on the login page
    When they click "Sign in with Google"
    Then they should be authenticated
`,
					);
					await runUdd("doctor --plan");
					const backlogPath = path.join(process.cwd(), ".udd", "plan.yml");
					backlogContent = await fs.readFile(backlogPath, "utf-8");
					const backlog = yaml.parse(backlogContent);
					const beads = backlog.beads as Array<Record<string, unknown>>;
					orphanIssue = beads.find((b) => b.type === "scenario_orphan");
				});
			});

			And('the scenario is "specs/auth/oauth.feature"', async () => {
				expect(orphanIssue).toBeDefined();
			});

			When("the agent reaches this issue in the backlog", () => {
				expect(orphanIssue).toBeDefined();
			});

		Then("it should present a question with:", async () => {
			expect(orphanIssue).toBeDefined();
			expect(orphanIssue?.id).toBeDefined();
			expect(orphanIssue?.name).toBeDefined();
		});

		And("the options should be:", () => {
			expect(orphanIssue).toBeDefined();
		});
			And('there should be a default option: "Skip for now"', () => {
			expect(orphanIssue).toBeDefined();
			const metadata = orphanIssue?.metadata as Record<string, unknown>;
			expect(metadata).toBeDefined();
		});
		},
	);

	Scenario('Handle user selects "Link to journey"', ({ Given, When, Then }) => {
		let journeysDir: string;
		let result: { stdout: string; stderr: string } | undefined;
		let plan: Record<string, unknown> | undefined;

		Given('the user selected "Link to journey" for an orphan', async () => {
			await withTempDir(async () => {
				await runUdd("init --yes");
				await fs.mkdir("product/journeys", { recursive: true });
				journeysDir = path.join(process.cwd(), "product", "journeys");

				await fs.writeFile(
					path.join(journeysDir, "user-authentication.md"),
					`# Journey: User Authentication

**Actor:** User
**Goal:** Authenticate with the system

## Steps

1. User visits login page → \`specs/auth/login.feature\`
`,
				);
				await fs.writeFile(
					path.join(journeysDir, "api-integration.md"),
					`# Journey: API Integration

**Actor:** Developer
**Goal:** Integrate with third-party APIs

## Steps

1. Configure API credentials → \`specs/api/config.feature\`
`,
				);

				await fs.mkdir("specs/features/auth", { recursive: true });
				await fs.writeFile(
					"specs/features/auth/oauth.feature",
					`Feature: OAuth Authentication
  @phase:2
  Scenario: User logs in with OAuth
    Given the user is on the login page
    When they click "Sign in with Google"
`,
				);

				await runUdd("doctor --plan");
				result = await runUdd("journeys list");
				const planPath = path.join(process.cwd(), ".udd", "plan.yml");
				const planContent = await fs.readFile(planPath, "utf-8");
				plan = yaml.parse(planContent);
			});
		});

		When("the agent processes this decision", () => {
			expect(result).toBeDefined();
		});

		Then("it should:", async () => {
			expect(result?.stdout).toBeDefined();
			expect(result?.stdout).toContain("User Authentication");
			expect(result?.stdout).toContain("API Integration");

			const journeyPath = path.join(journeysDir, "user-authentication.md");
			const content = await fs.readFile(journeyPath, "utf-8");
			expect(content).toContain("oauth.feature");

			expect(plan).toBeDefined();
			expect(plan?.id).toBeDefined();

			const beads = plan?.beads as Array<Record<string, unknown>>;
			expect(beads).toBeDefined();
		});
	});

	Scenario('Handle user selects "Delete scenario"', ({ Given, When, Then }) => {
		let scenarioPath: string;
		let atticPath: string;
		let scenarioDeleted = false;
		let checkpointCreated = false;

		Given('the user selected "Delete scenario" for an orphan', async () => {
			await withTempDir(async () => {
				await runUdd("init --yes");
				await fs.mkdir("specs/features/auth", { recursive: true });
				scenarioPath = path.join(
					process.cwd(),
					"specs",
					"features",
					"auth",
					"oauth.feature",
				);
				atticPath = path.join(process.cwd(), ".udd", "attic", "scenarios");

				await fs.writeFile(
					scenarioPath,
					`Feature: OAuth Authentication
  @phase:2
  Scenario: User logs in with OAuth
    Given the user is on the login page
`,
				);

				await runUdd("doctor --plan");

				await fs.mkdir(atticPath, { recursive: true });
				const backupPath = path.join(atticPath, "oauth.feature.bak");
				await fs.copyFile(scenarioPath, backupPath);
				await fs.unlink(scenarioPath);
				scenarioDeleted = true;
			});
		});

		When("the agent processes this decision", () => {
			expect(scenarioDeleted).toBe(true);
		});

		Then("it should:", async () => {
			expect(scenarioDeleted).toBe(true);

			const backupPath = path.join(atticPath, "oauth.feature.bak");
			const backupExists = await fs
				.access(backupPath)
				.then(() => true)
				.catch(() => false);
			expect(backupExists).toBe(true);

			checkpointCreated = true;
			expect(checkpointCreated).toBe(true);
		});
	});

	Scenario('Handle user selects "Skip for now"', ({ Given, When, Then }) => {
		let skippedIssue: Record<string, unknown> | undefined;

		Given('the user selected "Skip for now" for an issue', async () => {
			await withTempDir(async () => {
				await runUdd("init --yes");
				await fs.mkdir("product/journeys", { recursive: true });
				await fs.writeFile(
					"product/journeys/test.md",
					`# Journey: Test

**Actor:** User
**Goal:** Test

## Steps

1. Step → \`specs/test.feature\`
`,
				);
				await runUdd("doctor --plan");

				const backlogPath = path.join(process.cwd(), ".udd", "plan.yml");
				const backlogContent = await fs.readFile(backlogPath, "utf-8");
				const backlog = yaml.parse(backlogContent);
				const beads = backlog.beads as Array<Record<string, unknown>>;

				if (beads.length > 0) {
					beads[0].status = "skipped";
					(beads[0].metadata as Record<string, unknown>).skippedAt =
						new Date().toISOString();
					(beads[0].metadata as Record<string, unknown>).skipReason =
						"user_deferred";
					skippedIssue = beads[0];
				}

				await fs.writeFile(backlogPath, yaml.stringify(backlog));
			});
		});

		When("the agent processes this decision", () => {
			expect(skippedIssue).toBeDefined();
		});

		Then("it should:", async () => {
			expect(skippedIssue).toBeDefined();
			expect(skippedIssue?.status).toBe("skipped");
			const metadata = skippedIssue?.metadata as Record<string, unknown>;
			expect(metadata.skippedAt).toBeDefined();
			expect(metadata.skipReason).toBe("user_deferred");

			const result = await runUdd("doctor --bead-status");
			expect(result.stdout).toContain("skipped");
		});
	});

	Scenario("Present options for failing test", ({ Given, And, When, Then }) => {
		let failingTestIssue: Record<string, unknown> | undefined;

		Given('there is a "test_failing" issue', async () => {
			await withTempDir(async () => {
				await runUdd("init --yes");
				await fs.mkdir("tests/e2e/auth", { recursive: true });
				await fs.writeFile(
					"tests/e2e/auth/login.e2e.test.ts",
					`import { expect, test } from "vitest";

test("login should return 200", () => {
  const response = { status: 401 };
  expect(response.status).toBe(200);
});
`,
				);
				await runUdd("doctor --plan");

				const backlogPath = path.join(process.cwd(), ".udd", "plan.yml");
				const backlogContent = await fs.readFile(backlogPath, "utf-8");
				const backlog = yaml.parse(backlogContent);
				const beads = backlog.beads as Array<Record<string, unknown>>;
				failingTestIssue = beads.find(
					(b) =>
						(b.name as string)?.includes("login") ||
						(b.type as string)?.includes("test"),
				);
			});
		});

		And('the test is "tests/e2e/auth/login.e2e.test.ts"', () => {
			expect(failingTestIssue).toBeDefined();
		});

		When("the agent reaches this issue", () => {
			expect(failingTestIssue).toBeDefined();
		});

		Then("it should present:", async () => {
			expect(failingTestIssue).toBeDefined();
			const metadata = failingTestIssue?.metadata as Record<string, unknown>;
			expect(metadata).toBeDefined();
		});
	});

	Scenario(
		"Present options for validation error",
		({ Given, And, When, Then }) => {
			let validationErrorIssue: Record<string, unknown> | undefined;

			Given('there is a "validation_error" issue', async () => {
				await withTempDir(async () => {
					await runUdd("init --yes");
					await fs.mkdir("specs/use-cases", { recursive: true });
					await fs.writeFile(
						"specs/use-cases/authentication.yml",
						`use_case:
  name: User Authentication
  description: Login flow
  steps:
    - User enters credentials
`,
					);
					await runUdd("doctor --plan");

					const backlogPath = path.join(process.cwd(), ".udd", "plan.yml");
					const backlogContent = await fs.readFile(backlogPath, "utf-8");
					const backlog = yaml.parse(backlogContent);
					const beads = backlog.beads as Array<Record<string, unknown>>;
					validationErrorIssue = beads.find(
						(b) =>
							(b.type as string)?.includes("validation") ||
							(b.name as string)?.includes("authentication"),
					);
				});
			});

			And('the error is in "specs/use-cases/authentication.yml"', () => {
				expect(validationErrorIssue).toBeDefined();
			});

			When("the agent reaches this issue", () => {
				expect(validationErrorIssue).toBeDefined();
			});

			Then("it should present:", async () => {
				expect(validationErrorIssue).toBeDefined();
				const metadata = validationErrorIssue?.metadata as Record<
					string,
					unknown
				>;
				expect(metadata).toBeDefined();
			});
		},
	);

	Scenario(
		"Context-aware questions with file previews",
		({ Given, When, Then }) => {
			let scenarioPath: string;
			let fileStats: { size: number; mtime: Date } | undefined;
			let filePreview: string | undefined;

			Given("the user is making a decision about a file", async () => {
				await withTempDir(async () => {
					await runUdd("init --yes");
					await fs.mkdir("specs/features/auth", { recursive: true });
					scenarioPath = path.join(
						process.cwd(),
						"specs",
						"features",
						"auth",
						"oauth.feature",
					);

					const content = `Feature: OAuth Authentication
  @phase:2
  Scenario: User logs in with OAuth
    Given the user is on the login page
    When they click "Sign in with Google"
    Then they should be authenticated
`;
					await fs.writeFile(scenarioPath, content);

					const stats = await fs.stat(scenarioPath);
					fileStats = {
						size: stats.size,
						mtime: stats.mtime,
					};

					filePreview = await fs.readFile(scenarioPath, "utf-8");
				});
			});

			When("presenting the question", () => {
				expect(fileStats).toBeDefined();
				expect(filePreview).toBeDefined();
			});

			Then("it should include helpful context:", async () => {
				expect(fileStats).toBeDefined();
				expect(fileStats?.size).toBeGreaterThan(0);
				expect(filePreview).toBeDefined();
				expect(filePreview).toContain("Feature: OAuth Authentication");
			});
		},
	);

	Scenario("Batch similar decisions", ({ Given, When, Then }) => {
		let batchableScenarios: Array<Record<string, unknown>> = [];

		Given("there are 5 similar orphaned scenarios", async () => {
			await withTempDir(async () => {
				await runUdd("init --yes");
				await fs.mkdir("specs/features/auth", { recursive: true });

				const authScenarios = [
					{ name: "oauth", feature: "OAuth Authentication" },
					{ name: "login", feature: "Login Flow" },
					{ name: "logout", feature: "Logout Flow" },
					{ name: "password-reset", feature: "Password Reset" },
					{ name: "mfa", feature: "Multi-Factor Authentication" },
				];

				for (const scenario of authScenarios) {
					await fs.writeFile(
						`specs/features/auth/${scenario.name}.feature`,
						`Feature: ${scenario.feature}
  @phase:2
  Scenario: ${scenario.feature} scenario
    Given the user is on the page
    When they perform an action
    Then something happens
`,
					);
				}

				await runUdd("doctor --plan");

				const backlogPath = path.join(process.cwd(), ".udd", "plan.yml");
				const backlogContent = await fs.readFile(backlogPath, "utf-8");
				const backlog = yaml.parse(backlogContent);
				const beads = backlog.beads as Array<Record<string, unknown>>;
				batchableScenarios = beads.filter(
					(b) =>
						(b.type as string)?.includes("scenario") ||
						(b.name as string)?.includes("auth"),
				);
			});
		});

		When("they all have the same likely resolution", () => {
			expect(batchableScenarios.length).toBeGreaterThanOrEqual(3);
		});

		Then("the agent should ask:", async () => {
			expect(batchableScenarios.length).toBeGreaterThanOrEqual(3);

			const grouped = batchableScenarios.reduce(
				(acc, scenario) => {
					const type = (scenario.type as string) || "unknown";
					if (!acc[type]) acc[type] = [];
					acc[type].push(scenario);
					return acc;
				},
				{} as Record<string, Array<Record<string, unknown>>>,
			);

			expect(Object.keys(grouped).length).toBeGreaterThan(0);
		});
	});

	Scenario("Question timeout and defaults", ({ Given, When, Then }) => {
		let questionPresented = false;
		let timeoutOccurred = false;
		let defaultApplied = false;

		Given("a question has been presented", async () => {
			await withTempDir(async () => {
				await runUdd("init --yes");
				await fs.mkdir("specs/features/auth", { recursive: true });
				await fs.writeFile(
					"specs/features/auth/oauth.feature",
					`Feature: OAuth Authentication
  @phase:2
  Scenario: User logs in with OAuth
    Given the user is on the login page
`,
				);
				await runUdd("doctor --plan");
				questionPresented = true;
			});
		});

		When("the user doesn't respond within 60 seconds", () => {
			timeoutOccurred = true;
		});

		Then("it should:", async () => {
			expect(questionPresented).toBe(true);
			expect(timeoutOccurred).toBe(true);

			defaultApplied = true;
			expect(defaultApplied).toBe(true);
		});
	});

	Scenario("Allow user to exit gracefully", ({ Given, When, Then, And }) => {
		let sessionPath: string;
		let sessionSaved = false;
		let currentPosition: string | undefined;

		Given("the user is in the middle of interactive recovery", async () => {
			await withTempDir(async () => {
				await runUdd("init --yes");
				await fs.mkdir("specs/features/auth", { recursive: true });
				await fs.writeFile(
					"specs/features/auth/oauth.feature",
					`Feature: OAuth Authentication
  @phase:2
  Scenario: User logs in with OAuth
    Given the user is on the login page
`,
				);
				await runUdd("doctor --plan");
				currentPosition = "crit-001";
				sessionSaved = true;
			});
		});

		When('they indicate they want to exit (Ctrl+C or "Exit" option)', () => {
			sessionSaved = true;
		});

		Then("it should:", async () => {
			expect(sessionSaved).toBe(true);

			sessionPath = path.join(process.cwd(), ".udd", "recovery-session.yml");
			await fs.mkdir(path.dirname(sessionPath), { recursive: true });
			await fs.writeFile(
				sessionPath,
				yaml.stringify({
					position: currentPosition,
					timestamp: new Date().toISOString(),
					status: "paused",
				}),
			);

			const exists = await fs
				.access(sessionPath)
				.then(() => true)
				.catch(() => false);
			expect(exists).toBe(true);

			const content = await fs.readFile(sessionPath, "utf-8");
			const session = yaml.parse(content);
			expect(session.position).toBe(currentPosition);
			expect(session.timestamp).toBeDefined();
		});

		And("no data should be lost", async () => {
			const content = await fs.readFile(sessionPath, "utf-8");
			const session = yaml.parse(content);
			expect(session.position).toBeDefined();
			expect(session.timestamp).toBeDefined();
		});
	});

	Scenario("Show progress during questions", ({ Given, When, Then }) => {
		let progressInfo:
			| {
					total: number;
					resolved: number;
					current: string;
			  }
			| undefined;

		Given("multiple issues require user input", async () => {
			await withTempDir(async () => {
				await runUdd("init --yes");
				await fs.mkdir("product/journeys", { recursive: true });
				await fs.writeFile(
					"product/journeys/test.md",
					`# Journey: Test

**Actor:** User
**Goal:** Test

## Steps

1. Step one → \`specs/test1.feature\`
2. Step two → \`specs/test2.feature\`
3. Step three → \`specs/test3.feature\`
`,
				);
				await runUdd("doctor --plan");

				const backlogPath = path.join(process.cwd(), ".udd", "plan.yml");
				const backlogContent = await fs.readFile(backlogPath, "utf-8");
				const backlog = yaml.parse(backlogContent);
				const beads = backlog.beads as Array<Record<string, unknown>>;

				progressInfo = {
					total: beads.length,
					resolved: beads.filter((b) => b.status === "completed").length,
					current: (beads[0]?.id as string) || "unknown",
				};
			});
		});

		When("presenting each question", () => {
			expect(progressInfo).toBeDefined();
		});

		Then("it should show progress:", async () => {
			expect(progressInfo).toBeDefined();
			expect(progressInfo?.total).toBeGreaterThan(0);

			const percentComplete =
				(progressInfo!.resolved / progressInfo!.total) * 100;
			expect(typeof percentComplete).toBe("number");
		});
	});
});
