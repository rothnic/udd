import {
	defineSteps,
	describeFeature,
	loadFeature,
} from "@amiceli/vitest-cucumber";
import fs from "fs";
import path from "path";
import { expect } from "vitest";
import { runUdd } from "../../../utils.js";

// NOTE: Avoid global/overlapping registrations. Use scenario-scoped literal
// step implementations to ensure deterministic matching across parser
// variants. The scenario below contains the exact Given implementation.

// Register the exact literal step before loading the feature so the loader
// can resolve the mapping deterministically.
defineSteps((s: any) => {
	s.Given(
		"there are defined journeys and actors in product/ and specs/",
		() => {
			// Verify product/journeys and specs/features exist in repo
			const journeysDir = path.join(process.cwd(), "product", "journeys");
			const specsDir = path.join(process.cwd(), "specs", "features");
			expect(fs.existsSync(journeysDir)).toBe(true);
			expect(fs.existsSync(specsDir)).toBe(true);
		},
	);
	s.And?.(
		"there are defined journeys and actors in product/ and specs/",
		() => {
			const journeysDir = path.join(process.cwd(), "product", "journeys");
			const specsDir = path.join(process.cwd(), "specs", "features");
			expect(fs.existsSync(journeysDir)).toBe(true);
			expect(fs.existsSync(specsDir)).toBe(true);
		},
	);
});
// Diagnostic: print predefined steps registered in vitest-cucumber configuration
try {
	// eslint-disable-next-line @typescript-eslint/no-var-requires
	const { getVitestCucumberConfiguration } = await import(
		"@amiceli/vitest-cucumber"
	);
	const cfg = getVitestCucumberConfiguration();
	// eslint-disable-next-line no-console
	console.log(
		"DBG: predefinedSteps count=",
		(cfg.predefinedSteps || []).length,
	);
	// eslint-disable-next-line no-console
	console.log(
		"DBG: predefinedSteps types/details=",
		(cfg.predefinedSteps || []).map((p) => ({
			t: p.step.type,
			d: p.step.details,
		})),
	);
} catch (e) {
	// ignore
}

const feature = await loadFeature(
	"specs/features/udd/agent/query_commands.feature",
);

describeFeature(feature, ({ Scenario }) => {
	Scenario("Query Actors with JSON Output", ({ Given, When, Then, And }) => {
		let stdout: string;

		Given("UDD is initialized in the current directory", () => {
			// basic sanity: repo root has package.json
			expect(fs.existsSync(path.join(process.cwd(), "package.json"))).toBe(
				true,
			);
		});

		// The feature uses 'And' for this step; register an And step only so the
		// library (which keeps 'And' separate) can match the step type exactly.
		And("there are defined journeys and actors in product/ and specs/", () => {
			const journeysDir = path.join(process.cwd(), "product", "journeys");
			const actorsFile = path.join(process.cwd(), "product", "actors.md");
			const specsDir = path.join(process.cwd(), "specs", "features");
			expect(fs.existsSync(journeysDir)).toBe(true);
			expect(
				fs.existsSync(actorsFile) ||
					fs.existsSync(path.join(process.cwd(), "product", "actors")),
			).toBe(true);
			expect(fs.existsSync(specsDir)).toBe(true);
		});

		When('I run "udd query actors --json"', async () => {
			const result = await runUdd("query actors --json");
			stdout = result.stdout;
		});

		Then("the output should be valid JSON", () => {
			expect(() => JSON.parse(stdout)).not.toThrow();
		});

		And('the JSON should contain "actors" key', () => {
			const json = JSON.parse(stdout);
			expect(json).toHaveProperty("actors");
			expect(Array.isArray(json.actors)).toBe(true);
		});

		And('each actor should have "name" and "use_cases" fields', () => {
			const json = JSON.parse(stdout);
			if (json.actors.length > 0) {
				for (const actor of json.actors) {
					expect(actor).toHaveProperty("name");
					expect(actor).toHaveProperty("use_cases");
					expect(Array.isArray(actor.use_cases)).toBe(true);
				}
			}
		});
	});

	Scenario(
		"Query Actors with Human-Readable Output",
		({ Given, When, Then, And }) => {
			let stdout: string;

			Given("UDD is initialized in the current directory", () => {
				expect(fs.existsSync(path.join(process.cwd(), "package.json"))).toBe(
					true,
				);
			});

			And(
				"the product/actors.md and product/journeys/ exist with at least one actor",
				() => {
					const actorsFile = path.join(process.cwd(), "product", "actors.md");
					const journeysDir = path.join(process.cwd(), "product", "journeys");
					expect(
						fs.existsSync(actorsFile) ||
							fs.existsSync(path.join(process.cwd(), "product", "actors")),
					).toBe(true);
					const entries = fs.existsSync(journeysDir)
						? fs.readdirSync(journeysDir).filter((e) => !e.startsWith("."))
						: [];
					expect(entries.length).toBeGreaterThan(0);
				},
			);

			When('I run "udd query actors"', async () => {
				const result = await runUdd("query actors");
				stdout = result.stdout;
			});

			Then('the output should contain "Actors"', () => {
				expect(stdout).toContain("Actors");
			});

			And("the output should list actor names", () => {
				expect(stdout.length).toBeGreaterThan(0);
			});
		},
	);

	Scenario("Query Journeys with JSON Output", ({ Given, When, Then, And }) => {
		let stdout: string;

		Given("UDD is initialized in the current directory", () => {
			expect(fs.existsSync(path.join(process.cwd(), "package.json"))).toBe(
				true,
			);
		});

		And("product/journeys/ contains one or more journey files", () => {
			const journeysDir = path.join(process.cwd(), "product", "journeys");
			const entries = fs.existsSync(journeysDir)
				? fs.readdirSync(journeysDir).filter((e) => !e.startsWith("."))
				: [];
			expect(fs.existsSync(journeysDir)).toBe(true);
			expect(entries.length).toBeGreaterThan(0);
		});

		When('I run "udd query journeys --json"', async () => {
			const result = await runUdd("query journeys --json");
			stdout = result.stdout;
		});

		Then("the output should be valid JSON", () => {
			expect(() => JSON.parse(stdout)).not.toThrow();
		});

		And('the JSON should contain "journeys" key', () => {
			const json = JSON.parse(stdout);
			expect(json).toHaveProperty("journeys");
			expect(Array.isArray(json.journeys)).toBe(true);
		});
	});

	Scenario("Query Features with JSON Output", ({ Given, When, Then, And }) => {
		let stdout: string;

		Given("UDD is initialized in the current directory", () => {
			expect(fs.existsSync(path.join(process.cwd(), "package.json"))).toBe(
				true,
			);
		});

		And(
			"specs/features/ contains feature files generated from journeys",
			() => {
				const specsDir = path.join(process.cwd(), "specs", "features");
				expect(fs.existsSync(specsDir)).toBe(true);
				const entries = fs
					.readdirSync(specsDir)
					.filter((e) => !e.startsWith("."));
				expect(entries.length).toBeGreaterThan(0);
			},
		);

		When('I run "udd query features --json"', async () => {
			const result = await runUdd("query features --json");
			stdout = result.stdout;
		});

		Then("the output should be valid JSON", () => {
			expect(() => JSON.parse(stdout)).not.toThrow();
		});

		And('the JSON should contain "features" key', () => {
			const json = JSON.parse(stdout);
			expect(json).toHaveProperty("features");
			expect(Array.isArray(json.features)).toBe(true);
		});

		And('each feature should have "id", "path", and "scenarios" fields', () => {
			const json = JSON.parse(stdout);
			if (json.features.length > 0) {
				for (const feature of json.features) {
					expect(feature).toHaveProperty("id");
					expect(feature).toHaveProperty("path");
					expect(feature).toHaveProperty("scenarios");
					expect(Array.isArray(feature.scenarios)).toBe(true);
				}
			}
		});
	});

	Scenario("Query Status with JSON Output", ({ Given, When, Then, And }) => {
		let stdout: string;

		Given("UDD is initialized in the current directory", () => {
			expect(fs.existsSync(path.join(process.cwd(), "package.json"))).toBe(
				true,
			);
		});

		And("there are journeys, features, and tests present in the repo", () => {
			const journeysDir = path.join(process.cwd(), "product", "journeys");
			const specsDir = path.join(process.cwd(), "specs", "features");
			const testsDir = path.join(process.cwd(), "tests", "e2e");
			expect(fs.existsSync(journeysDir)).toBe(true);
			expect(fs.existsSync(specsDir)).toBe(true);
			expect(fs.existsSync(testsDir)).toBe(true);
		});

		When('I run "udd query status --json"', async () => {
			const result = await runUdd("query status --json");
			stdout = result.stdout;
		});

		Then("the output should be valid JSON", () => {
			expect(() => JSON.parse(stdout)).not.toThrow();
		});

		And('the JSON should contain "features" key', () => {
			const json = JSON.parse(stdout);
			expect(json).toHaveProperty("features");
		});

		And('the JSON should contain "scenarios" key', () => {
			const json = JSON.parse(stdout);
			expect(json).toHaveProperty("scenarios");
		});

		And('the JSON should contain "gaps" key', () => {
			const json = JSON.parse(stdout);
			expect(json).toHaveProperty("gaps");
		});

		And('the JSON should contain "completeness" key', () => {
			const json = JSON.parse(stdout);
			expect(json).toHaveProperty("completeness");
			expect(typeof json.completeness).toBe("number");
		});
	});

	Scenario("Query Status Shows Gap Analysis", ({ Given, When, Then, And }) => {
		let stdout: string;

		Given("UDD is initialized in the current directory", () => {
			expect(fs.existsSync(path.join(process.cwd(), "package.json"))).toBe(
				true,
			);
		});

		And(
			"the repository contains journeys and features with some missing tests",
			() => {
				const journeysDir = path.join(process.cwd(), "product", "journeys");
				const specsDir = path.join(process.cwd(), "specs", "features");
				expect(fs.existsSync(journeysDir)).toBe(true);
				expect(fs.existsSync(specsDir)).toBe(true);
			},
		);

		When('I run "udd query status --json"', async () => {
			const result = await runUdd("query status --json");
			stdout = result.stdout;
		});

		Then("the JSON should have gap analysis with expected fields", () => {
			const json = JSON.parse(stdout);
			expect(json.gaps).toBeDefined();
		});

		And('gaps should include "features_without_tests"', () => {
			const json = JSON.parse(stdout);
			expect(json.gaps).toHaveProperty("features_without_tests");
			expect(Array.isArray(json.gaps.features_without_tests)).toBe(true);
		});

		And('gaps should include "scenarios_without_tests"', () => {
			const json = JSON.parse(stdout);
			expect(json.gaps).toHaveProperty("scenarios_without_tests");
			expect(Array.isArray(json.gaps.scenarios_without_tests)).toBe(true);
		});

		And('gaps should include "failing_scenarios"', () => {
			const json = JSON.parse(stdout);
			expect(json.gaps).toHaveProperty("failing_scenarios");
			expect(Array.isArray(json.gaps.failing_scenarios)).toBe(true);
		});
	});
});
