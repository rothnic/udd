import fs from "node:fs/promises";
import path from "node:path";
import chalk from "chalk";
import { Command } from "commander";
import yaml from "yaml";

export const newCommand = new Command("new").description("Scaffold new specs");

newCommand
	.command("use-case")
	.argument("<id>", "Use case ID (e.g. capture_quick_todo)")
	.description("Create a new use case")
	.action(async (id) => {
		const rootDir = process.cwd();
		const filePath = path.join(rootDir, "specs/use-cases", `${id}.yml`);

		const content = {
			id: id,
			name: id
				.split("_")
				.map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
				.join(" "),
			summary: "TODO: Add summary",
			actors: ["user"],
			outcomes: [
				{
					description: "TODO: Add outcome description",
					scenarios: [],
				},
			],
		};

		try {
			await fs.writeFile(filePath, yaml.stringify(content));
			console.log(chalk.green(`Created use case: ${filePath}`));
		} catch (error) {
			console.error(chalk.red("Error creating use case:"), error);
			process.exit(1);
		}
	});

newCommand
	.command("feature")
	.argument("<area>", "Feature area (e.g. todos)")
	.argument("<feature>", "Feature name (e.g. basic)")
	.description("Create a new feature")
	.action(async (area, feature) => {
		const rootDir = process.cwd();
		const featureDir = path.join(rootDir, "specs/features", area, feature);
		const filePath = path.join(featureDir, "_feature.yml");

		const content = {
			id: `${area}/${feature}`,
			area: area,
			name: feature
				.split("_")
				.map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
				.join(" "),
			summary: "TODO: Add summary",
			use_cases: [],
			phase: 1,
			kind: "core",
		};

		try {
			await fs.mkdir(featureDir, { recursive: true });
			await fs.writeFile(filePath, yaml.stringify(content));
			console.log(chalk.green(`Created feature: ${filePath}`));
		} catch (error) {
			console.error(chalk.red("Error creating feature:"), error);
			process.exit(1);
		}
	});

newCommand
	.command("scenario")
	.argument("<area>", "Feature area")
	.argument("<feature>", "Feature name")
	.argument("<slug>", "Scenario slug (e.g. add_todo)")
	.description("Create a new scenario")
	.action(async (area, feature, slug) => {
		const rootDir = process.cwd();
		const featureDir = path.join(rootDir, "specs/features", area, feature);
		const filePath = path.join(featureDir, `${slug}.feature`);

		const featureName = feature
			.split("_")
			.map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
			.join(" ");
		const scenarioName = slug
			.split("_")
			.map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
			.join(" ");

		const content = `Feature: ${featureName}

  Scenario: ${scenarioName}
    Given I am in the right state
    When I do something
    Then something happens
`;

		const testDir = path.join(rootDir, "tests/e2e", area, feature);
		const testFilePath = path.join(testDir, `${slug}.e2e.test.ts`);
		const testContent = `import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { expect } from "vitest";

const feature = await loadFeature("specs/features/${area}/${feature}/${slug}.feature");

describeFeature(feature, ({ Scenario }) => {
	Scenario("${scenarioName}", ({ Given, When, Then }) => {
		Given("I am in the right state", () => {
			// TODO: Implement
		});

		When("I do something", () => {
			// TODO: Implement
		});

		Then("something happens", () => {
			// TODO: Implement
			expect(true).toBe(true);
		});
	});
});
`;

		try {
			// Ensure feature dir exists
			await fs.mkdir(featureDir, { recursive: true });
			await fs.writeFile(filePath, content);
			console.log(chalk.green(`Created scenario: ${filePath}`));

			// Ensure test dir exists
			await fs.mkdir(testDir, { recursive: true });
			await fs.writeFile(testFilePath, testContent);
			console.log(chalk.green(`Created test: ${testFilePath}`));
		} catch (error) {
			console.error(chalk.red("Error creating scenario:"), error);
			process.exit(1);
		}
	});

newCommand
	.command("requirement")
	.argument("<key>", "Requirement key (e.g. store_new_todo)")
	.description("Create a new technical requirement")
	.action(async (key) => {
		const rootDir = process.cwd();
		const filePath = path.join(rootDir, "specs/requirements", `${key}.yml`);

		const content = {
			key: key,
			type: "functional",
			feature: "TODO: Add feature id",
			scenarios: [],
			description: "TODO: Add description",
		};

		try {
			await fs.mkdir(path.dirname(filePath), { recursive: true });
			await fs.writeFile(filePath, yaml.stringify(content));
			console.log(chalk.green(`Created requirement: ${filePath}`));
		} catch (error) {
			console.error(chalk.red("Error creating requirement:"), error);
			process.exit(1);
		}
	});
