# Update sync command for multi-project (@Sisyphus-Junior subagent)

**ID**: ses_369c0295cffeCphtUqBKVRr9nw
**Project ID**: ad761ea6174e58ed763fc75290c3f403ed51079d
**Created**: 2/25/2026, 1:21:32 PM
**Stats**: 2 files changed, +52 -3

---

## USER (1:21:32 PM)

import fs from "node:fs/promises";
import path from "node:path";
import chalk from "chalk";
import { Command } from "commander";
import { resolvePaths } from "../lib/paths.js";

export const newCommand = new Command("new").description("Scaffold new specs");

newCommand
	.command("journey")
	.argument("<slug>", "Journey slug (e.g. new_user_onboarding)")
	.description("Create a new user journey")
	.option("--example <name>", "Create journey in an example project")
	.action(async (slug, options) => {
		// Resolve paths based on context (product or example)
		const paths = options?.example
			? resolvePaths(options.example)
			: resolvePaths("product");
		const journeysDir = path.join(paths.product, "journeys");
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
				chalk.dim("  3. See examples/feature-features/ for reference examples"),
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


import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { confirm } from "@inquirer/prompts";
import chalk from "chalk";
import { Command } from "commander";
import yaml from "yaml";
import { userWarn } from "../lib/cli-error.js";
import { listExamples, resolvePaths } from "../lib/paths.js";

interface JourneyStep {
	description: string;
	scenarioPath: string | null;
}

interface Journey {
	name: string;
	actor: string;
	goal: string;
	steps: JourneyStep[];
	filePath: string;
	hash: string;
}

interface ManifestJourney {
	path: string;
	hash: string;
	scenarios: string[];
}

interface ManifestScenario {
	hash: string;
	test: string;
	status: "pending" | "passing" | "failing";
}

interface Manifest {
	journeys: Record<string, ManifestJourney>;
	scenarios: Record<string, ManifestScenario>;
}

function hashContent(content: string): string {
	return crypto.createHash("sha256").update(content).digest("hex").slice(0, 12);
}

async function parseJourneyFile(filePath: string): Promise<Journey | null> {
	try {
		const content = await fs.readFile(filePath, "utf-8");
		const hash = hashContent(content);

		// Parse markdown journey format
		const lines = content.split("\n");
		let name = "";
		let actor = "";
		let goal = "";
		const steps: JourneyStep[] = [];

		for (const line of lines) {
			// Parse title: # Journey: Name
			if (line.startsWith("# Journey:") || line.startsWith("# ")) {
				name = line.replace(/^#\s*(Journey:\s*)?/, "").trim();
			}
			// Parse actor: **Actor:** Name
			if (line.includes("**Actor:**")) {
				actor = line.replace(/.*\*\*Actor:\*\*\s*/, "").trim();
			}
			// Parse goal: **Goal:** Description
			if (line.includes("**Goal:**")) {
				goal = line.replace(/.*\*\*Goal:\*\*\s*/, "").trim();
			}
			// Parse steps: 1. Description → `specs/domain/action.feature`
			const stepMatch = line.match(/^\d+\.\s+(.+?)(?:\s*→\s*`([^`]+)`)?$/);
			if (stepMatch) {
				steps.push({
					description: stepMatch[1].trim(),
					scenarioPath: stepMatch[2] || null,
				});
			}
		}

		if (!name) {
			name = path.basename(filePath, ".md").replace(/_/g, " ");
		}

		return {
			name,
			actor,
			goal,
			steps,
			filePath,
			hash,
		};
	} catch {
		return null;
	}
}

async function loadManifest(
	specsDir: string,
): Promise<{ manifest: Manifest; wasCorrupted: boolean }> {
	const manifestPath = path.join(specsDir, ".udd", "manifest.yml");
	try {
		const content = await fs.readFile(manifestPath, "utf-8");
		const parsed = yaml.parse(content);
		const validation = validateManifest(parsed);
		if (!validation.valid) {
			userWarn(`Invalid manifest: ${validation.reason}`);
			return { manifest: { journeys: {}, scenarios: {} }, wasCorrupted: true };
		}
		return {
			manifest: {
				journeys: parsed.journeys || {},
				scenarios: parsed.scenarios || {},
			},
			wasCorrupted: false,
		};
	} catch (err) {
		// Distinguish malformed YAML (parse errors) vs missing file
		try {
			await fs.access(manifestPath);
			// File exists but couldn't be read/parsed - provide context
			userWarn(
				`Could not parse manifest: ${String((err && (err as Error).message) || err)} (manifest path: ${manifestPath})`,
			);
		} catch {
			// File doesn't exist - first run, no warning
		}
		return { manifest: { journeys: {}, scenarios: {} }, wasCorrupted: true };
	}
}

function validateManifest(obj: unknown): { valid: boolean; reason?: string } {
	if (!obj || typeof obj !== "object") {
		return { valid: false, reason: "manifest is not a mapping/object" };
	}

	function isRecord(x: unknown): x is Record<string, unknown> {
		return x !== null && typeof x === "object" && !Array.isArray(x);
	}

	if (
		!("journeys" in obj) ||
		!isRecord((obj as Record<string, unknown>).journeys)
	) {
		return { valid: false, reason: "missing or invalid 'journeys' key" };
	}

	const journeys = (obj as Record<string, unknown>).journeys as Record<
		string,
		unknown
	>;

	// scenarios can be missing; that's acceptable
	const scenariosVal = (obj as Record<string, unknown>).scenarios as unknown;
	if (scenariosVal !== undefined && !isRecord(scenariosVal)) {
		// present but invalid
		return { valid: false, reason: "invalid 'scenarios' key" };
	}

	// Basic shape checks for journey entries
	for (const [k, v] of Object.entries(journeys) as [string, unknown][]) {
		if (!isRecord(v)) {
			return { valid: false, reason: `journey entry '${k}' is not an object` };
		}
		const pathVal = v.path;
		const hashVal = v.hash;
		const scenariosProp = v.scenarios;
		if (typeof pathVal !== "string") {
			return { valid: false, reason: `journey '${k}' missing 'path' string` };
		}
		if (typeof hashVal !== "string") {
			return { valid: false, reason: `journey '${k}' missing 'hash' string` };
		}
		if (!Array.isArray(scenariosProp)) {
			return { valid: false, reason: `journey '${k}' has invalid 'scenarios'` };
		}
	}

	// Basic shape checks for scenarios
	if (isRecord(scenariosVal)) {
		for (const [k, v] of Object.entries(scenariosVal)) {
			if (!isRecord(v)) {
				return {
					valid: false,
					reason: `scenario entry '${k}' is not an object`,
				};
			}
			const hashVal = v.hash;
			const testVal = v.test;
			if (typeof hashVal !== "string") {
				return {
					valid: false,
					reason: `scenario '${k}' missing 'hash' string`,
				};
			}
			if (typeof testVal !== "string") {
				return {
					valid: false,
					reason: `scenario '${k}' missing 'test' string`,
				};
			}
		}
	}

	return { valid: true };
}

async function saveManifest(
	specsDir: string,
	manifest: Manifest,
): Promise<void> {
	const manifestPath = path.join(specsDir, ".udd", "manifest.yml");
	await fs.mkdir(path.dirname(manifestPath), { recursive: true });
	const content = yaml.stringify(manifest);
	await fs.writeFile(manifestPath, content);
}

async function scenarioExists(
	rootDir: string,
	scenarioPath: string,
): Promise<boolean> {
	try {
		await fs.access(path.join(rootDir, scenarioPath));
		return true;
	} catch {
		return false;
	}
}

function generateScenarioContent(journey: Journey, step: JourneyStep): string {
	const featureName = journey.name;
	const scenarioName = step.description;

	return `Feature: ${featureName}

  Scenario: ${scenarioName}
    Given I am a ${journey.actor || "User"}
    When I ${step.description.toLowerCase()}
    Then the action is completed successfully
`;
}

function generateTestContent(
	scenarioPath: string,
	scenarioName: string,
): string {
	return `import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { expect } from "vitest";

const feature = await loadFeature("${scenarioPath}");

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
}

export const syncCommand = new Command("sync")
	.description("Sync journeys to BDD scenarios")
	.option("--dry-run", "Preview changes without applying")
	.option("--auto", "Auto-accept all proposals")
	.option("--example <name>", "Sync a specific example project")
	.option("--all", "Sync all projects (product + examples)")
	.action(async (options) => {
		const rootDir = process.cwd();
		const productDir = path.join(rootDir, "product");
		const specsDir = path.join(rootDir, "specs");
		const journeysDir = path.join(productDir, "journeys");

		// If --all flag provided, sync product then all examples
		if (options.all) {
			console.log(chalk.bold("🔄 Syncing all projects...\n"));

			// Sync product (existing behavior)
			console.log(chalk.blue("Syncing product..."));
			await (async function syncProduct() {
				// Reuse existing logic by invoking core sync flow: we'll call into the
				// same code path by keeping current working dir context (product sync uses paths above).
				// For simplicity, call the body below by falling through to default behavior after handling examples.
			})();

			// Sync all examples
			const examples = listExamples();
			for (const example of examples) {
				console.log(chalk.blue(`\nSyncing ${example.name}...`));
				const paths = resolvePaths(example.name);
				console.log(chalk.dim(`  Product: ${paths.product}`));
				console.log(chalk.dim(`  Specs: ${paths.specs}`));
				console.log(chalk.dim(`  Tests: ${paths.tests}`));
				// TODO: Implement example sync (for now just log)
			}
			return;
		}

		// If --example flag provided, show paths for that example and exit
		if (options.example) {
			try {
				const paths = resolvePaths(options.example);
				console.log(chalk.blue(`🔄 Syncing ${options.example}...`));
				console.log(chalk.dim(`  Product: ${paths.product}`));
				console.log(chalk.dim(`  Specs: ${paths.specs}`));
				console.log(chalk.dim(`  Tests: ${paths.tests}`));
				// TODO: Implement example sync (for now just log)
			} catch (err) {
				console.log(chalk.red(String(err)));
				process.exit(1);
			}
			return;
		}

		// Check if initialized
		try {
			await fs.access(journeysDir);
		} catch {
			console.log(chalk.red("No product/journeys/ directory found."));
			console.log(chalk.yellow("Run `udd init` first to set up the project."));
			process.exit(1);
		}

		// Load manifest
		const { manifest } = await loadManifest(specsDir);

		// Check for stale journey references in manifest (journeys that no longer exist on disk)
		for (const journeyKey of Object.keys(manifest.journeys)) {
			const journeyPath = path.join(journeysDir, `${journeyKey}.md`);
			try {
				await fs.access(journeyPath);
			} catch {
				// Journey file no longer exists - stale reference
				userWarn(`manifest references missing journey: ${journeyKey}`);
				console.log(chalk.dim(`  Run 'udd sync' to refresh manifest`));
			}
		}

		// Check manifest scenarios for missing files and hash mismatches
		for (const scenarioPath of Object.keys(manifest.scenarios || {})) {
			const entry = manifest.scenarios[scenarioPath];
			const fullPath = path.join(rootDir, scenarioPath);
			try {
				const content = await fs.readFile(fullPath, "utf-8");
				const currentHash = hashContent(content);
				if (entry?.hash && entry.hash !== currentHash) {
					userWarn(`hash mismatch for ${scenarioPath}`);
					console.log(
						chalk.dim(`  manifest: ${entry.hash}  current: ${currentHash}`),
					);
				}
			} catch {
				// File missing
				userWarn(`manifest references missing scenario: ${scenarioPath}`);
				console.log(
					chalk.dim(
						`  The scenario will be recreated during 'udd sync' if linked from a journey.`,
					),
				);
			}
		}

		// Find journey files
		const journeyFiles = await fs.readdir(journeysDir);
		const mdFiles = journeyFiles.filter(
			(f) => f.endsWith(".md") && !f.startsWith("_"),
		);

		if (mdFiles.length === 0) {
			console.log(chalk.yellow("No journey files found in product/journeys/"));
			process.exit(0);
		}

		console.log(chalk.cyan("\n🔄 Syncing journeys to scenarios...\n"));

		let changesDetected = 0;
		let scenariosCreated = 0;
		const updatedManifest = { ...manifest };

		for (const file of mdFiles) {
			const journeyPath = path.join(journeysDir, file);
			const journey = await parseJourneyFile(journeyPath);

			if (!journey) {
				userWarn(`Could not parse journey file: ${file}`);
				continue;
			}

			const journeyKey = path.basename(file, ".md");
			const existingJourney = manifest.journeys[journeyKey];

			// Check if journey changed
			if (existingJourney && existingJourney.hash === journey.hash) {
				console.log(chalk.dim(`✓ ${journeyKey} (unchanged)`));
				continue;
			}

			changesDetected++;
			console.log(
				chalk.blue(`\n📝 Journey: ${journey.name}`),
				existingJourney ? chalk.yellow("(changed)") : chalk.green("(new)"),
			);

			const scenarios: string[] = [];

			for (const step of journey.steps) {
				if (!step.scenarioPath) {
					console.log(
						chalk.dim(`  - ${step.description} (no scenario linked)`),
					);
					continue;
				}

				const exists = await scenarioExists(rootDir, step.scenarioPath);
				scenarios.push(step.scenarioPath);

				if (exists) {
					console.log(chalk.dim(`  ✓ ${step.scenarioPath} (exists)`));
				} else {
					console.log(chalk.yellow(`  → ${step.scenarioPath} (missing)`));

					if (options.dryRun) {
						console.log(chalk.dim("    (dry-run: would create)"));
						continue;
					}

					const shouldCreate =
						options.auto ||
						(await confirm({
							message: `Create ${step.scenarioPath}?`,
							default: true,
						}));

					if (shouldCreate) {
						// Create scenario file
						const scenarioFullPath = path.join(rootDir, step.scenarioPath);
						await fs.mkdir(path.dirname(scenarioFullPath), { recursive: true });
						const scenarioContent = generateScenarioContent(journey, step);
						await fs.writeFile(scenarioFullPath, scenarioContent);
						console.log(chalk.green(`    ✓ Created ${step.scenarioPath}`));

						// Create test file
						const testPath = step.scenarioPath
							.replace("specs/", "tests/")
							.replace(".feature", ".e2e.test.ts");
						const testFullPath = path.join(rootDir, testPath);
						await fs.mkdir(path.dirname(testFullPath), { recursive: true });
						const testContent = generateTestContent(
							step.scenarioPath,
							step.description,
						);
						await fs.writeFile(testFullPath, testContent);
						console.log(chalk.green(`    ✓ Created ${testPath}`));

						scenariosCreated++;

						// Update manifest scenarios
						updatedManifest.scenarios[step.scenarioPath] = {
							hash: hashContent(scenarioContent),
							test: testPath,
							status: "pending",
						};
					}
				}
			}

			// Update manifest journey
			updatedManifest.journeys[journeyKey] = {
				path: path.relative(rootDir, journeyPath),
				hash: journey.hash,
				scenarios,
			};
		}

		// Save manifest
		if (!options.dryRun) {
			await saveManifest(specsDir, updatedManifest);
		}

		// Summary
		console.log(chalk.cyan("\n📊 Sync Summary:"));
		console.log(`   Journeys processed: ${mdFiles.length}`);
		console.log(`   Changes detected: ${changesDetected}`);
		console.log(`   Scenarios created: ${scenariosCreated}`);

		if (options.dryRun) {
			console.log(chalk.yellow("\n   (dry-run mode - no files modified)"));
		}

		console.log("");
	});


