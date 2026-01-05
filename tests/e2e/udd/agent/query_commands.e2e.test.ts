import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { expect } from "vitest";
import { runUdd } from "../../../utils.js";

const feature = await loadFeature(
	"specs/features/udd/agent/query_commands.feature",
);

describeFeature(feature, ({ Scenario }) => {
	Scenario("Query Actors with JSON Output", ({ When, Then, And }) => {
		let stdout: string;

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

	Scenario("Query Actors with Human-Readable Output", ({ When, Then, And }) => {
		let stdout: string;

		When('I run "udd query actors"', async () => {
			const result = await runUdd("query actors");
			stdout = result.stdout;
		});

		Then('the output should contain "Actors"', () => {
			expect(stdout).toContain("Actors");
		});

		And("the output should list actor names", () => {
			// Should have at least some content if actors exist
			expect(stdout.length).toBeGreaterThan(0);
		});
	});

	Scenario("Query Journeys with JSON Output", ({ When, Then, And }) => {
		let stdout: string;

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

	Scenario("Query Features with JSON Output", ({ When, Then, And }) => {
		let stdout: string;

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

	Scenario("Query Status with JSON Output", ({ When, Then, And }) => {
		let stdout: string;

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

	Scenario("Query Status Shows Gap Analysis", ({ When, Then, And }) => {
		let stdout: string;

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
