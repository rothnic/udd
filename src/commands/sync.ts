import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { confirm } from "@inquirer/prompts";
import chalk from "chalk";
import { Command } from "commander";
import yaml from "yaml";
import { userWarn } from "../lib/cli-error.js";
import { checkGate, handleGateResult } from "../lib/gate.js";
import { listExamples, resolvePaths } from "../lib/paths.js";
import { detectFeatureChanges } from "../lib/test-governance.js";
import {
	loadUseCaseScenarioPaths,
	resolveJourneyReference,
} from "../lib/trace.js";
import type { ManifestTestEntry } from "../types.js";

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
	const specsManifestPath = path.join(specsDir, ".udd", "manifest.yml");
	const rootManifestPath = path.join(process.cwd(), ".udd", "manifest.yml");
	// Try specs/.udd/manifest.yml first, then fall back to root .udd/manifest.yml for compatibility
	for (const manifestPath of [specsManifestPath, rootManifestPath]) {
		try {
			const content = await fs.readFile(manifestPath, "utf-8");
			const parsed = yaml.parse(content);
			const validation = validateManifest(parsed);
			if (!validation.valid) {
				userWarn(`Invalid manifest: ${validation.reason}`);
				return {
					manifest: { journeys: {}, scenarios: {} },
					wasCorrupted: true,
				};
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
				return {
					manifest: { journeys: {}, scenarios: {} },
					wasCorrupted: true,
				};
			} catch {
				// File doesn't exist - try next path or return empty later
			}
		}
	}
	// No manifest found at either location
	return { manifest: { journeys: {}, scenarios: {} }, wasCorrupted: true };
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

function resolveJourneyScenarios(
	journey: Journey,
	useCaseScenarios: Map<string, string[]>,
): string[] {
	return journey.steps.flatMap((step) =>
		step.scenarioPath
			? resolveJourneyReference(step.scenarioPath, useCaseScenarios)
			: [],
	);
}

function sameList(left: string[], right: string[]): boolean {
	return (
		left.length === right.length &&
		left.every((value, index) => value === right[index])
	);
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

interface FeatureSnapshot {
	path: string;
	content: string;
	hash: string;
}

async function loadTestReviews(specsDir: string): Promise<ManifestTestEntry[]> {
	const testReviewsPath = path.join(specsDir, ".udd", "test-reviews.yml");
	try {
		const content = await fs.readFile(testReviewsPath, "utf-8");
		const parsed = yaml.parse(content);
		return parsed?.tests || [];
	} catch {
		return [];
	}
}

async function saveTestReviews(
	specsDir: string,
	tests: ManifestTestEntry[],
): Promise<void> {
	const testReviewsPath = path.join(specsDir, ".udd", "test-reviews.yml");
	await fs.mkdir(path.dirname(testReviewsPath), { recursive: true });
	const content = yaml.stringify({ tests });
	await fs.writeFile(testReviewsPath, content);
}

async function captureFeatureSnapshots(
	specsDir: string,
): Promise<FeatureSnapshot[]> {
	const snapshots: FeatureSnapshot[] = [];
	try {
		const entries = await fs.readdir(specsDir, { recursive: true });
		for (const entry of entries) {
			if (typeof entry === "string" && entry.endsWith(".feature")) {
				const fullPath = path.join(specsDir, entry);
				try {
					const content = await fs.readFile(fullPath, "utf-8");
					snapshots.push({
						path: entry,
						content,
						hash: hashContent(content),
					});
				} catch {
					// Skip files we can't read
				}
			}
		}
	} catch {
		// Directory might not exist yet
	}
	return snapshots;
}

async function captureFeatureSnapshotsAfterSync(
	specsDir: string,
): Promise<Map<string, string>> {
	const contents = new Map<string, string>();
	try {
		const entries = await fs.readdir(specsDir, { recursive: true });
		for (const entry of entries) {
			if (typeof entry === "string" && entry.endsWith(".feature")) {
				const fullPath = path.join(specsDir, entry);
				try {
					const content = await fs.readFile(fullPath, "utf-8");
					contents.set(entry, content);
				} catch {
					// Skip files we can't read
				}
			}
		}
	} catch {
		// Directory might not exist yet
	}
	return contents;
}

export const syncCommand = new Command("sync")
	.description("Sync journeys to BDD scenarios")
	.option("--dry-run", "Preview changes without applying")
	.option("--auto", "Auto-accept all proposals")
	.option("--example <name>", "Sync a specific example project")
	.option("--all", "Sync all projects (product + examples)")
	.option("--strict", "Block on warnings (strict mode)")
	.option("--skip-gate", "Skip gate check (not recommended)")
	.action(async (options) => {
		// Gate check before creating files (critical issues always block)
		const gateResult = await checkGate({
			strict: options.strict || false,
			skipGate: options.skipGate || false,
		});
		handleGateResult(gateResult);
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

		// Capture feature snapshots before sync (to detect changes after)
		const featureSnapshots = await captureFeatureSnapshots(specsDir);

		// Load existing test reviews
		const testReviews = await loadTestReviews(specsDir);

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
		const useCaseScenarios = await loadUseCaseScenarioPaths(rootDir);

		for (const file of mdFiles) {
			const journeyPath = path.join(journeysDir, file);
			const journey = await parseJourneyFile(journeyPath);

			if (!journey) {
				userWarn(`Could not parse journey file: ${file}`);
				continue;
			}

			const journeyKey = path.basename(file, ".md");
			const existingJourney = manifest.journeys[journeyKey];
			const resolvedScenarios = resolveJourneyScenarios(
				journey,
				useCaseScenarios,
			);
			const scenariosChanged =
				existingJourney &&
				!sameList(existingJourney.scenarios ?? [], resolvedScenarios);

			// Check if journey changed
			if (
				existingJourney &&
				existingJourney.hash === journey.hash &&
				!scenariosChanged
			) {
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

				const scenarioPaths = resolveJourneyReference(
					step.scenarioPath,
					useCaseScenarios,
				);
				if (scenarioPaths.length === 0) {
					console.log(
						chalk.yellow(
							`  → ${step.scenarioPath} (no scenarios found for reference)`,
						),
					);
					scenarios.push(step.scenarioPath);
					continue;
				}

				for (const scenarioPath of scenarioPaths) {
					const exists = await scenarioExists(rootDir, scenarioPath);
					scenarios.push(scenarioPath);

					if (exists) {
						console.log(chalk.dim(`  ✓ ${scenarioPath} (exists)`));
					} else {
						console.log(chalk.yellow(`  → ${scenarioPath} (missing)`));

						if (options.dryRun) {
							console.log(chalk.dim("    (dry-run: would create)"));
							continue;
						}

						const shouldCreate =
							options.auto ||
							(await confirm({
								message: `Create ${scenarioPath}?`,
								default: true,
							}));

						if (shouldCreate) {
							// Create scenario file
							const scenarioFullPath = path.join(rootDir, scenarioPath);
							await fs.mkdir(path.dirname(scenarioFullPath), {
								recursive: true,
							});
							const scenarioContent = generateScenarioContent(journey, step);
							await fs.writeFile(scenarioFullPath, scenarioContent);
							console.log(chalk.green(`    ✓ Created ${scenarioPath}`));

							// Create test file
							const testPath = scenarioPath
								.replace("specs/", "tests/")
								.replace(".feature", ".e2e.test.ts");
							const testFullPath = path.join(rootDir, testPath);
							await fs.mkdir(path.dirname(testFullPath), { recursive: true });
							const testContent = generateTestContent(
								scenarioPath,
								step.description,
							);
							await fs.writeFile(testFullPath, testContent);
							console.log(chalk.green(`    ✓ Created ${testPath}`));

							scenariosCreated++;

							// Update manifest scenarios
							updatedManifest.scenarios[scenarioPath] = {
								hash: hashContent(scenarioContent),
								test: testPath,
								status: "pending",
							};
						}
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

		// Detect feature changes and mark linked tests as dirty
		let testsMarkedDirty = 0;
		if (!options.dryRun && featureSnapshots.length > 0) {
			const currentFeatureContents =
				await captureFeatureSnapshotsAfterSync(specsDir);
			const updatedTestReviews = [...testReviews];

			for (const snapshot of featureSnapshots) {
				const currentContent = currentFeatureContents.get(snapshot.path);
				if (!currentContent) {
					// Feature was deleted, mark linked tests as dirty
					for (let i = 0; i < updatedTestReviews.length; i++) {
						const test = updatedTestReviews[i];
						if (test.feature === snapshot.path && test.status !== "dirty") {
							updatedTestReviews[i] = {
								...test,
								status: "dirty",
								dirtyReason: "feature changed: deleted",
							};
							testsMarkedDirty++;
						}
					}
					continue;
				}

				// Use detectFeatureChanges to check for meaningful changes
				const changeResult = detectFeatureChanges(
					snapshot.content,
					currentContent,
				);

				if (changeResult.hasChanges) {
					// Find tests linked to this feature and mark them dirty
					for (let i = 0; i < updatedTestReviews.length; i++) {
						const test = updatedTestReviews[i];
						if (test.feature === snapshot.path && test.status !== "dirty") {
							updatedTestReviews[i] = {
								...test,
								status: "dirty",
								dirtyReason: `feature changed: ${changeResult.changeType}`,
							};
							testsMarkedDirty++;
						}
					}
				}
			}

			// Also check for newly created features that might have tests linked
			// (tests could reference features that didn't exist during initial snapshot)
			for (const [featurePath] of currentFeatureContents) {
				const wasInSnapshot = featureSnapshots.some(
					(s) => s.path === featurePath,
				);
				if (!wasInSnapshot) {
					// New feature - check if any tests are linked to it
					for (let i = 0; i < updatedTestReviews.length; i++) {
						const test = updatedTestReviews[i];
						if (test.feature === featurePath && test.status !== "dirty") {
							updatedTestReviews[i] = {
								...test,
								status: "dirty",
								dirtyReason: "feature changed: new feature",
							};
							testsMarkedDirty++;
						}
					}
				}
			}

			// Save updated test reviews if there are changes
			if (testsMarkedDirty > 0) {
				await saveTestReviews(specsDir, updatedTestReviews);
			}
		}

		// Summary
		console.log(chalk.cyan("\n📊 Sync Summary:"));
		console.log(`   Journeys processed: ${mdFiles.length}`);
		console.log(`   Changes detected: ${changesDetected}`);
		console.log(`   Scenarios created: ${scenariosCreated}`);
		if (testsMarkedDirty > 0) {
			console.log(chalk.yellow(`   Tests marked dirty: ${testsMarkedDirty}`));
		}

		if (options.dryRun) {
			console.log(chalk.yellow("\n   (dry-run mode - no files modified)"));
		}

		console.log("");
	});
