import fs from "node:fs/promises";
import path from "node:path";
import chalk from "chalk";
import { Command } from "commander";
import yaml from "yaml";

export const newCommand = new Command("new").description("Scaffold new specs");

newCommand
	.command("journey")
	.argument("<slug>", "Journey slug (e.g. new_user_onboarding)")
	.description("Create a new user journey")
	.action(async (slug) => {
		const rootDir = process.cwd();
		const journeysDir = path.join(rootDir, "product/journeys");
		const filePath = path.join(journeysDir, `${slug}.md`);

		const journeyName = slug
			.split("_")
			.map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
			.join(" ");

		const content = `# Journey: ${journeyName}

**Actor:** User  
**Goal:** TODO: Describe the user's goal

## Steps

1. TODO: First step → \`specs/domain/action.feature\`

## Success

TODO: Define success criteria
`;

		try {
			await fs.mkdir(journeysDir, { recursive: true });
			await fs.writeFile(filePath, content);
			console.log(chalk.green(`Created journey: ${filePath}`));
			console.log(chalk.dim("Next: Run `udd sync` to generate scenarios"));
		} catch (error) {
			console.error(chalk.red("Error creating journey:"), error);
			process.exit(1);
		}
	});

newCommand
	.command("scenario")
	.argument("<domain>", "Domain (e.g. auth)")
	.argument("<action>", "Action slug (e.g. login)")
	.description("Create a new scenario and test stub")
	.action(async (domain, action) => {
		const rootDir = process.cwd();
		const specsDir = path.join(rootDir, "specs", domain);
		const filePath = path.join(specsDir, `${action}.feature`);

		const scenarioName = action
			.split("_")
			.map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
			.join(" ");

		const content = `Feature: ${domain}

  Scenario: ${scenarioName}
    Given I am a User
    When I ${action.replace(/_/g, " ")}
    Then the action is completed successfully
`;

		const testDir = path.join(rootDir, "tests", domain);
		const testFilePath = path.join(testDir, `${action}.e2e.test.ts`);
		const testContent = `import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { expect } from "vitest";

const feature = await loadFeature("specs/${domain}/${action}.feature");

describeFeature(feature, ({ Scenario }) => {
	Scenario("${scenarioName}", ({ Given, When, Then }) => {
		Given(/I am a (.+)/, (actor: string) => {
			// TODO: Implement - set up actor context
		});

		When(/I (.+)/, (action: string) => {
			// TODO: Implement - perform action
		});

		Then("the action is completed successfully", () => {
			// TODO: Implement - verify outcome
			expect(true).toBe(true);
		});
	});
});
`;

		try {
			// Create scenario
			await fs.mkdir(specsDir, { recursive: true });
			await fs.writeFile(filePath, content);
			console.log(chalk.green(`Created scenario: ${filePath}`));

			// Create test
			await fs.mkdir(testDir, { recursive: true });
			await fs.writeFile(testFilePath, testContent);
			console.log(chalk.green(`Created test: ${testFilePath}`));
		} catch (error) {
			console.error(chalk.red("Error creating scenario:"), error);
			process.exit(1);
		}
	});

newCommand
	.command("feature")
	.argument("<domain>", "Domain (e.g. auth, user, reporting)")
	.argument(
		"<feature-name>",
		"Feature name slug (e.g. export_csv, password_reset)",
	)
	.description("Create a new feature file from SysML-informed template")
	.action(async (domain, featureName) => {
		const rootDir = process.cwd();
		const templatePath = path.join(
			rootDir,
			"templates",
			"feature-template.feature",
		);

		// Create feature directory structure: specs/features/<domain>/<feature-name>/
		const featureDir = path.join(
			rootDir,
			"specs",
			"features",
			domain,
			featureName,
		);
		const featureFilePath = path.join(featureDir, `${featureName}.feature`);

		// Convert feature name to title case for display
		const featureTitle = featureName
			.split("_")
			.map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
			.join(" ");

		try {
			// Read template
			const templateContent = await fs.readFile(templatePath, "utf-8");

			// Replace [Feature Name] placeholder with actual feature name
			const content = templateContent.replace(
				/\[Feature Name\]/g,
				featureTitle,
			);

			// Create feature directory and file
			await fs.mkdir(featureDir, { recursive: true });
			await fs.writeFile(featureFilePath, content);

			console.log(chalk.green(`✓ Created feature: ${featureFilePath}`));
			console.log(chalk.dim("\nNext steps:"));
			console.log(
				chalk.dim("  1. Edit the feature file to fill in context sections"),
			);
			console.log(chalk.dim("  2. Replace placeholders with actual scenarios"));
			console.log(
				chalk.dim("  3. See docs/example-features/ for reference examples"),
			);
			console.log(
				chalk.dim("  4. Run 'udd lint' to validate the feature file"),
			);
		} catch (error) {
			if (
				(error as NodeJS.ErrnoException).code === "ENOENT" &&
				(error as NodeJS.ErrnoException).path?.includes("template")
			) {
				console.error(
					chalk.red(
						"Error: Template file not found at templates/feature-template.feature",
					),
				);
				console.error(
					chalk.dim(
						"Make sure you're running this command from the project root",
					),
				);
			} else {
				console.error(chalk.red("Error creating feature:"), error);
			}
			process.exit(1);
		}
	});
