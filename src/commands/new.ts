import fs from "node:fs/promises";
import path from "node:path";
import chalk from "chalk";
import { Command } from "commander";
import yaml from "yaml";

export const newCommand = new Command("new").description("Scaffold new specs");

function titleFromSlug(slug: string): string {
	return slug
		.split(/[_-]/)
		.map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
		.join(" ");
}

async function writeFileIfMissing(
	filePath: string,
	content: string,
): Promise<void> {
	try {
		await fs.writeFile(filePath, content, { flag: "wx" });
	} catch (error) {
		if ((error as NodeJS.ErrnoException).code === "EEXIST") {
			throw new Error(
				`${path.relative(process.cwd(), filePath)} already exists`,
			);
		}
		throw error;
	}
}

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
	.argument("<feature>", "Feature group or scenario slug")
	.argument("[slug]", "Scenario slug when using area + feature + slug")
	.option("--use-case <id>", "Use case id to link in the feature metadata")
	.description(
		"Create one canonical scenario file and print the expected E2E test obligation",
	)
	.action(async (domain, feature, slug, options: { useCase?: string }) => {
		const rootDir = process.cwd();
		const featureGroup = slug ? feature : domain;
		const scenarioSlug = slug ?? feature;
		const specsDir = path.join(
			rootDir,
			"specs",
			"features",
			domain,
			featureGroup,
		);
		const featureMetaPath = path.join(specsDir, "_feature.yml");
		const filePath = path.join(specsDir, `${scenarioSlug}.feature`);
		const featureId = `${domain}/${featureGroup}`;

		const scenarioName = titleFromSlug(scenarioSlug);
		const featureName = titleFromSlug(featureGroup);

		const content = `Feature: ${domain}

  Scenario: ${scenarioName}
    Given I am a User
    When I ${scenarioSlug.replace(/[_-]/g, " ")}
    Then the action is completed successfully
`;

		const testFilePath = path.join(
			rootDir,
			"tests",
			"e2e",
			domain,
			featureGroup,
			`${scenarioSlug}.e2e.test.ts`,
		);

		try {
			await fs.mkdir(specsDir, { recursive: true });
			try {
				await fs.access(featureMetaPath);
			} catch {
				await fs.writeFile(
					featureMetaPath,
					yaml.stringify({
						id: featureId,
						area: domain,
						name: featureName,
						summary: `TODO: Describe ${featureName}.`,
						use_cases: options.useCase ? [options.useCase] : [],
						kind: "core",
					}),
				);
			}
			await writeFileIfMissing(filePath, content);
			console.log(chalk.green(`Created scenario: ${filePath}`));
			console.log(chalk.dim(`Expected E2E test: ${testFilePath}`));
			console.log(
				chalk.dim(
					"No test file was created; implement real user-observable assertions before marking this behavior complete.",
				),
			);
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error);
			console.error(chalk.red("Error creating scenario:"), message);
			process.exit(1);
		}
	});

newCommand
	.command("use-case")
	.argument("<id>", "Use case id (e.g. export_csv)")
	.option("--name <name>", "Human-readable use case name")
	.option("--summary <summary>", "Use case summary")
	.option("--phase <number>", "Roadmap phase number", "3")
	.option("--actor <actor>", "Actor for the use case", "User")
	.description("Create a valid source-of-truth use case stub")
	.action(
		async (
			id: string,
			options: {
				name?: string;
				summary?: string;
				phase?: string;
				actor?: string;
			},
		) => {
			const rootDir = process.cwd();
			const useCasesDir = path.join(rootDir, "specs", "use-cases");
			const filePath = path.join(useCasesDir, `${id}.yml`);
			const name = options.name ?? titleFromSlug(id);
			const content = yaml.stringify({
				id,
				name,
				summary: options.summary ?? `TODO: Describe the ${name} outcome.`,
				actors: [options.actor ?? "User"],
				phase: Number(options.phase ?? 3),
				outcomes: [
					{
						description: "TODO: Describe the user-visible outcome.",
						scenario_paths: [],
					},
				],
			});

			try {
				await fs.mkdir(useCasesDir, { recursive: true });
				await writeFileIfMissing(filePath, content);
				console.log(chalk.green(`Created use case: ${filePath}`));
				console.log(
					chalk.dim(
						"Next: link this use case from specs/roadmap.yml or specs/VISION.md before implementation.",
					),
				);
			} catch (error) {
				const message = error instanceof Error ? error.message : String(error);
				console.error(chalk.red("Error creating use case:"), message);
				process.exit(1);
			}
		},
	);

newCommand
	.command("feature")
	.argument("<domain>", "Domain (e.g. auth, user, reporting)")
	.argument(
		"<feature-name>",
		"Feature name slug (e.g. export_csv, password_reset)",
	)
	.description(
		"Create feature file from SysML template (use 'scenario' for simple features, 'discover' for guided creation)",
	)
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
			console.log(
				chalk.dim(
					"\nNote: This creates a rich template with SysML context sections.",
				),
			);
			console.log(
				chalk.dim(
					"      For simpler features, use 'udd new scenario' instead.",
				),
			);
			console.log(
				chalk.dim(
					"      For guided creation, use 'udd discover feature' instead.",
				),
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
