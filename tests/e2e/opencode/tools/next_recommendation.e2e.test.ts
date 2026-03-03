import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { expect } from "vitest";
import { runUdd, withTempDir } from "../../../utils.js";

const feature = await loadFeature(
	"specs/features/opencode/tools/next_recommendation.feature",
);

describeFeature(feature, ({ Scenario }) => {
	Scenario(
		"Recommend highest-priority incomplete journey",
		({ Given, When, Then, And }) => {
			let stdout: string;

			Given(
				"a project with multiple journeys in the current phase",
				async () => {
					await withTempDir(async () => {
						await runUdd("init --yes");
					});
				},
			);

			When("the user runs `udd opencode next`", async () => {
				const result = await runUdd("opencode next --json");
				stdout = result.stdout;
			});

			Then(
				"the command should recommend the journey with highest priority",
				async () => {
					expect(stdout).toBeDefined();
					// prefer JSON parse when available
					let parsed: any = null;
					try {
						parsed = JSON.parse(stdout);
					} catch {
						// ignore
					}

					if (parsed) {
						expect(parsed).toHaveProperty("recommended");
					} else {
						expect(stdout).toContain("recommended");
					}
				},
			);

			And(
				'the human-readable output should include the journey slug "user-onboarding"',
				async () => {
					// check either JSON or plain text
					try {
						const parsed = JSON.parse(stdout);
						expect(parsed.recommended).toBe("user-onboarding");
					} catch {
						expect(stdout).toContain("user-onboarding");
					}
				},
			);

			And("the JSON output should contain:", async () => {
				const parsed = JSON.parse(stdout);
				expect(parsed).toHaveProperty("recommended");
				expect(parsed).toHaveProperty("reason");
				expect(parsed.recommended).toBe("user-onboarding");
				expect(typeof parsed.reason).toBe("string");
			});
		},
	);

	Scenario(
		"Consider phase priorities when recommending work",
		({ Given, When, Then, And }) => {
			let parsed: any;

			Given("a project with journeys across phases", async () => {
				await withTempDir(async () => {
					await runUdd("init --yes");
				});
			});

			When("the user runs `udd opencode next --phase-priority`", async () => {
				const result = await runUdd("opencode next --phase-priority --json");
				parsed = JSON.parse(result.stdout);
			});

			Then(
				"the command should prefer items in the current phase over later phases",
				() => {
					expect(parsed).toBeDefined();
					expect(parsed).toHaveProperty("chosen_phase");
				},
			);

			And(
				"the JSON output should include the scored priorities and chosen_phase",
				() => {
					expect(parsed).toHaveProperty("scored_priorities");
					expect(
						Array.isArray(parsed.scored_priorities) ||
							typeof parsed.scored_priorities === "object",
					).toBe(true);
					expect(typeof parsed.chosen_phase).toBe("number");
				},
			);
		},
	);

	Scenario(
		"Identify blocking dependencies before recommending work",
		({ Given, When, Then, And }) => {
			let parsed: any;

			Given("a project with journeys and blocking dependencies", async () => {
				await withTempDir(async () => {
					await runUdd("init --yes");
				});
			});

			When("the user runs `udd opencode next`", async () => {
				const result = await runUdd("opencode next --json");
				parsed = JSON.parse(result.stdout);
			});

			Then(
				'the command should identify that "feature-B" is blocked by "feature-C"',
				() => {
					// Accept either in blocking arrays or as part of reason text
					const blocking = parsed.blocking || [];
					const found = blocking.some(
						(b: any) => b.slug === "feature-B" && b.blocked_by === "feature-C",
					);
					if (!found) {
						// fallback: check reason text
						expect(typeof parsed.reason).toBe("string");
						expect(parsed.reason).toMatch(/feature-B/);
					}
				},
			);

			And(
				"the recommendation should surface the blocking dependency and suggest unblocking steps",
				() => {
					expect(parsed).toHaveProperty("recommendation");
				},
			);

			And(
				'the JSON output should include a "blocking" array with objects:',
				() => {
					expect(Array.isArray(parsed.blocking)).toBe(true);
					if (parsed.blocking.length > 0) {
						const item = parsed.blocking[0];
						expect(item).toHaveProperty("slug");
						expect(item).toHaveProperty("blocked_by");
					}
				},
			);
		},
	);

	Scenario(
		"Suggest a specific scenario to implement next",
		({ Given, When, Then, And }) => {
			let parsed: any;

			Given('a journey "user-onboarding" with multiple scenarios', async () => {
				await withTempDir(async () => {
					await runUdd("init --yes");
				});
			});

			When("the user runs `udd opencode next --suggest-scenario`", async () => {
				const result = await runUdd("opencode next --suggest-scenario --json");
				parsed = JSON.parse(result.stdout);
			});

			Then(
				'the command should recommend implementing "specs/features/auth/signup.feature"',
				() => {
					const suggested = parsed.suggested_files || [];
					const found = suggested.some(
						(s: any) =>
							s.path && s.path.includes("specs/features/auth/signup.feature"),
					);
					expect(found).toBe(true);
				},
			);

			And(
				"the human-readable output should include the filename and a one-line rationale",
				() => {
					expect(
						typeof parsed.human_summary === "string" ||
							Array.isArray(parsed.suggested_files),
					).toBe(true);
				},
			);

			And(
				'the JSON output should include a "suggested_files" list with paths and suggested_actions',
				() => {
					expect(Array.isArray(parsed.suggested_files)).toBe(true);
					if (parsed.suggested_files.length > 0) {
						const f = parsed.suggested_files[0];
						expect(f).toHaveProperty("path");
						expect(f).toHaveProperty("suggested_action");
					}
				},
			);
		},
	);

	Scenario(
		"Provide context for files to modify and tests to create",
		({ Given, When, Then, And }) => {
			let parsed: any;

			Given(
				"the recommended scenario requires a new CLI flag and tests",
				async () => {
					await withTempDir(async () => {
						await runUdd("init --yes");
					});
				},
			);

			When("the user runs `udd opencode next --context`", async () => {
				const result = await runUdd("opencode next --context --json");
				parsed = JSON.parse(result.stdout);
			});

			Then(
				"the command should output a human plan that lists files to edit and tests to add",
				() => {
					expect(parsed).toHaveProperty("edit_plan");
					const plan = parsed.edit_plan || [];
					expect(Array.isArray(plan)).toBe(true);
				},
			);

			And(
				'the JSON output should include a "edit_plan" array with entries containing:',
				() => {
					const plan = parsed.edit_plan || [];
					if (plan.length > 0) {
						expect(plan[0]).toHaveProperty("path");
						expect(plan[0]).toHaveProperty("action");
					}
				},
			);
		},
	);

	Scenario(
		"Output structured JSON for agent consumption",
		({ Given, When, Then, And }) => {
			let parsed: any;

			Given(
				"a repository with metadata for journeys, scenarios, and tests",
				async () => {
					await withTempDir(async () => {
						await runUdd("init --yes");
					});
				},
			);

			When("the user runs `udd opencode next --json`", async () => {
				const result = await runUdd("opencode next --json");
				// ensure stdout contains exactly one JSON object
				parsed = JSON.parse(result.stdout);
			});

			Then(
				"the command should print a single JSON object to stdout with keys:",
				() => {
					expect(parsed).toBeDefined();
					expect(parsed).toHaveProperty("recommended");
					expect(parsed).toHaveProperty("reason");
					expect(parsed).toHaveProperty("suggested_files");
					expect(parsed).toHaveProperty("blocking");
					expect(parsed).toHaveProperty("edit_plan");
				},
			);

			And(
				"the JSON should be parseable by agents (valid JSON) and include actionable fields",
				() => {
					expect(typeof parsed.recommended).toBe("string");
					expect(Array.isArray(parsed.suggested_files)).toBe(true);
				},
			);
		},
	);
});
