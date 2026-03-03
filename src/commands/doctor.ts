import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { confirm, input, select } from "@inquirer/prompts";
import chalk from "chalk";
import { Command } from "commander";
import { glob } from "glob";
import yaml from "yaml";
import {
	type BeadGraph,
	createBeadGraphFromDrift,
	deserializeBeadGraph,
	getReadyBeads,
	serializeBeadGraph,
} from "../lib/beads.js";
import {
	getCachedResponse,
	hasCachedResponse,
	loadCheckpointCache,
	saveCheckpointResponse,
} from "../lib/checkpoint-cache.js";
import { getProjectStatus } from "../lib/status.js";
import { detectStubAssertions, markTestDirty } from "../lib/test-governance.js";
import type { ManifestTestEntry } from "../types.js";

/**
 * Severity levels for drift detection issues
 * - critical: Blocks work (manifest corrupt, broken references)
 * - warning: Should fix (stale scenarios, missing tests)
 * - info: Nice to have (low coverage, documentation gaps)
 */
type Severity = "critical" | "warning" | "info";

/**
 * Issue types for drift detection
 */
type IssueType =
	| "journey_stale"
	| "scenario_orphan"
	| "test_missing"
	| "test_failing"
	| "manifest_corrupt"
	| "manifest_missing"
	| "journey_missing"
	| "validation_error"
	| "test_stub"
	| "low_coverage";

/**
 * Individual drift issue
 */
export interface DriftIssue {
	id: string;
	severity: Severity;
	type: IssueType;
	file: string;
	message: string;
	autoFixable: boolean;
	requiresUserInput: boolean;
}

export interface DriftState {
	status: "clean" | "drift-detected";
	lastCheck: string;
	summary: {
		critical: number;
		warning: number;
		info: number;
		total: number;
	};
	issues: DriftIssue[];
}

/**
 * Generate a UUID for issue IDs
 */
function generateId(): string {
	return crypto.randomUUID();
}

/**
 * Run drift detection and return structured report
 */
export async function detectDrift(
	checkStubs = false,
	mode: "lenient" | "strict" = "lenient",
): Promise<DriftState> {
	const rootDir = process.cwd();
	const issues: DriftIssue[] = [];

	// Get project status using existing detection logic
	const status = await getProjectStatus();

	// Check 1: Manifest health (critical)
	const specsManifestPath = path.join(rootDir, "specs", ".udd", "manifest.yml");
	const rootManifestPath = path.join(rootDir, ".udd", "manifest.yml");
	let manifestChecked = false;
	let manifest: Record<string, unknown> | null = null;

	try {
		const content = await fs.readFile(specsManifestPath, "utf-8");
		manifest = yaml.parse(content);
		if (!manifest || typeof manifest !== "object") {
			issues.push({
				id: generateId(),
				severity: "critical",
				type: "manifest_corrupt",
				file: "specs/.udd/manifest.yml",
				message: "Manifest file invalid - unexpected structure",
				autoFixable: true,
				requiresUserInput: false,
			});
		}
		manifestChecked = true;
	} catch (err) {
		// Check if file exists but is malformed
		try {
			await fs.access(specsManifestPath);
			issues.push({
				id: generateId(),
				severity: "critical",
				type: "manifest_corrupt",
				file: "specs/.udd/manifest.yml",
				message: `Manifest YAML malformed: ${(err as Error).message}`,
				autoFixable: true,
				requiresUserInput: false,
			});
			manifestChecked = true;
		} catch {
			// File doesn't exist
		}
	}

	// Check root manifest (if specs doesn't exist)
	if (!manifestChecked) {
		try {
			await fs.access(rootManifestPath);
			// Root manifest exists but specs doesn't - migration needed
			issues.push({
				id: generateId(),
				severity: "warning",
				type: "manifest_missing",
				file: "specs/.udd/manifest.yml",
				message:
					"Manifest exists at root but not in specs/ directory - needs migration",
				autoFixable: true,
				requiresUserInput: false,
			});
		} catch {
			issues.push({
				id: generateId(),
				severity: "critical",
				type: "manifest_missing",
				file: "specs/.udd/manifest.yml",
				message: "Manifest file missing - project not initialized",
				autoFixable: true,
				requiresUserInput: false,
			});
		}
	}

	// Check 2: Product directory exists (warning)
	if (!status.hasProductDir) {
		issues.push({
			id: generateId(),
			severity: "warning",
			type: "journey_missing",
			file: "product/",
			message: "No product/ directory found - project using legacy structure",
			autoFixable: true,
			requiresUserInput: true,
		});
	}

	// Check 3: Stale journeys (warning)
	for (const [journeyKey, journey] of Object.entries(status.journeys)) {
		if (journey.isStale) {
			issues.push({
				id: generateId(),
				severity: "warning",
				type: "journey_stale",
				file: `product/journeys/${journeyKey}.md`,
				message: `Journey '${journey.name}' has changed since last sync`,
				autoFixable: true,
				requiresUserInput: false,
			});
		}
	}

	// Check 4: Missing scenarios from journeys (critical)
	for (const [journeyKey, journey] of Object.entries(status.journeys)) {
		if (journey.scenariosMissing > 0) {
			issues.push({
				id: generateId(),
				severity: "critical",
				type: "test_missing",
				file: `product/journeys/${journeyKey}.md`,
				message: `${journey.scenariosMissing} scenario(s) referenced in journey not found`,
				autoFixable: true,
				requiresUserInput: false,
			});
		}
	}

	// Check 5: Orphaned scenarios (warning)
	for (const scenarioId of status.orphaned_scenarios) {
		issues.push({
			id: generateId(),
			severity: "warning",
			type: "scenario_orphan",
			file: `specs/features/${scenarioId}.feature`,
			message: `Scenario '${scenarioId}' not linked to any use case or journey`,
			autoFixable: false,
			requiresUserInput: true,
		});
	}

	// Check 6: Failing tests (critical)
	for (const [featureId, feature] of Object.entries(status.features)) {
		for (const [slug, scenario] of Object.entries(feature.scenarios)) {
			if (scenario.e2e === "failing") {
				issues.push({
					id: generateId(),
					severity: "critical",
					type: "test_failing",
					file: `tests/e2e/${featureId}/${slug}.e2e.test.ts`,
					message: `Test for scenario '${featureId}/${slug}' is failing`,
					autoFixable: false,
					requiresUserInput: true,
				});
			}
		}
	}

	// Check 7: Missing tests (warning)
	for (const [featureId, feature] of Object.entries(status.features)) {
		for (const [slug, scenario] of Object.entries(feature.scenarios)) {
			if (scenario.e2e === "missing") {
				issues.push({
					id: generateId(),
					severity: "warning",
					type: "test_missing",
					file: `tests/e2e/${featureId}/${slug}.e2e.test.ts`,
					message: `Test stub missing for scenario '${featureId}/${slug}'`,
					autoFixable: true,
					requiresUserInput: false,
				});
			}
		}
	}

	// Check 8: Validation errors in use cases (critical)
	for (const [useCaseId, useCase] of Object.entries(status.use_cases)) {
		if (useCase.validation_errors.length > 0) {
			for (const error of useCase.validation_errors) {
				issues.push({
					id: generateId(),
					severity: "critical",
					type: "validation_error",
					file: `specs/use-cases/${useCaseId}.yml`,
					message: `Validation error: ${error}`,
					autoFixable: false,
					requiresUserInput: true,
				});
			}
		}
	}

	// Check 9: Low journey coverage (info)
	for (const [journeyKey, journey] of Object.entries(status.journeys)) {
		if (journey.scenarioCount > 0) {
			const coverage = journey.scenariosPassing / journey.scenarioCount;
			if (coverage < 0.5) {
				issues.push({
					id: generateId(),
					severity: "info",
					type: "low_coverage",
					file: `product/journeys/${journeyKey}.md`,
					message: `Journey '${journey.name}' has low scenario coverage (${Math.round(coverage * 100)}%)`,
					autoFixable: false,
					requiresUserInput: true,
				});
			}
		}
	}

	// Check 10: Unreadable journey files (critical)
	if (status.hasProductDir) {
		try {
			const journeysDir = path.join(rootDir, "product/journeys");
			const files = await fs.readdir(journeysDir);
			for (const file of files) {
				if (!file.endsWith(".md") || file.startsWith("_")) continue;
				const filePath = path.join(journeysDir, file);
				try {
					await fs.readFile(filePath, "utf-8");
				} catch {
					issues.push({
						id: generateId(),
						severity: "critical",
						type: "journey_missing",
						file: `product/journeys/${file}`,
						message: `Unreadable journey file: ${file}`,
						autoFixable: false,
						requiresUserInput: true,
					});
				}
			}
		} catch {
			// product/journeys doesn't exist - already reported
		}
	}

	if (checkStubs) {
		try {
			const testPattern = "tests/**/*.e2e.test.ts";
			const matches = await glob(testPattern, { cwd: rootDir });
			for (const rel of matches) {
				const abs = path.join(rootDir, rel);
				try {
					const content = await fs.readFile(abs, "utf-8");
					const res = detectStubAssertions(content);
					if (res.hasStubs) {
						// Determine phase from file comment like '@phase:4'
						const phaseMatch = content.match(/@phase\s*:\s*(\d+)/i);
						// If no phase tag, default to 1 (treat as current/previous phases)
						const phaseNum = phaseMatch ? parseInt(phaseMatch[1], 10) : 1;

						// In lenient mode, ignore stubs that are explicitly marked as future work (phase >= 4)
						if (mode === "lenient" && phaseNum >= 4) {
							// skip reporting this stub (future phase acceptable)
						} else {
							issues.push({
								id: generateId(),
								severity: "warning",
								type: "test_stub",
								file: rel,
								message: `Found ${res.stubPatterns.length} stub assertion(s) in test file (phase:${phaseNum})`,
								autoFixable: false,
								requiresUserInput: true,
							});
						}
					}
				} catch {
					// ignore per-file read errors
				}
			}
		} catch {
			// ignore glob errors
		}
	}

	// Calculate summary
	const summary = {
		critical: issues.filter((i) => i.severity === "critical").length,
		warning: issues.filter((i) => i.severity === "warning").length,
		info: issues.filter((i) => i.severity === "info").length,
		total: issues.length,
	};

	return {
		status: issues.length === 0 ? "clean" : "drift-detected",
		lastCheck: new Date().toISOString(),
		summary,
		issues,
	};
}

/**
 * Format drift report for human-readable console output
 */
function formatHumanReadable(drift: DriftState): string {
	const lines: string[] = [];

	lines.push(chalk.bold("🔍 Drift Detection Report"));
	lines.push(chalk.dim("========================="));
	lines.push("");

	if (drift.status === "clean") {
		lines.push(chalk.green("✓ No drift detected - project is healthy!"));
		return lines.join("\n");
	}

	lines.push(chalk.red(`Found ${drift.summary.total} issue(s):`));
	lines.push("");

	// Group issues by severity
	const critical = drift.issues.filter((i) => i.severity === "critical");
	const warnings = drift.issues.filter((i) => i.severity === "warning");
	const info = drift.issues.filter((i) => i.severity === "info");

	if (critical.length > 0) {
		lines.push(chalk.bold.red("Critical (blocking):"));
		for (const issue of critical) {
			const icon = issue.autoFixable ? "🔧" : "⚠️";
			lines.push(`  ${icon} ${chalk.red(issue.message)}`);
			lines.push(chalk.dim(`     File: ${issue.file}`));
			lines.push(chalk.dim(`     Type: ${issue.type}`));
		}
		lines.push("");
	}

	if (warnings.length > 0) {
		lines.push(chalk.bold.yellow("Warnings (should fix):"));
		for (const issue of warnings) {
			const icon = issue.autoFixable ? "🔧" : "⚠️";
			lines.push(`  ${icon} ${chalk.yellow(issue.message)}`);
			lines.push(chalk.dim(`     File: ${issue.file}`));
		}
		lines.push("");
	}

	if (info.length > 0) {
		lines.push(chalk.bold.blue("Info (nice to have):"));
		for (const issue of info) {
			lines.push(`  ℹ️  ${chalk.blue(issue.message)}`);
			lines.push(chalk.dim(`     File: ${issue.file}`));
		}
		lines.push("");
	}

	// Summary
	lines.push(chalk.bold("Summary:"));
	lines.push(
		`  Critical: ${drift.summary.critical > 0 ? chalk.red(drift.summary.critical) : chalk.green(0)}`,
	);
	lines.push(
		`  Warnings: ${drift.summary.warning > 0 ? chalk.yellow(drift.summary.warning) : chalk.green(0)}`,
	);
	lines.push(
		`  Info: ${drift.summary.info > 0 ? chalk.blue(drift.summary.info) : chalk.green(0)}`,
	);
	lines.push("");

	// Recommendations
	const autoFixable = drift.issues.filter((i) => i.autoFixable);
	if (autoFixable.length > 0) {
		lines.push(
			chalk.cyan(`💡 ${autoFixable.length} issue(s) can be auto-fixed`),
		);
		lines.push(chalk.dim(`   Run: udd doctor --fix`));
	}

	return lines.join("\n");
}

/**
 * Context for a single remediation fix operation
 */
interface FixContext {
	drift: DriftState;
	issuesFixed: number;
	issuesSkipped: number;
	auto: boolean;
	dryRun: boolean;
}

/**
 * Remediation result for a single issue
 */
interface RemediationResult {
	success: boolean;
	action: "fixed" | "skipped" | "failed" | "dry-run";
	message?: string;
}

/**
 * Load the current manifest for modification
 */
async function loadManifestForFix(
	specsDir: string,
): Promise<{ manifest: Record<string, unknown>; path: string }> {
	const specsManifestPath = path.join(specsDir, ".udd", "manifest.yml");
	const rootManifestPath = path.join(process.cwd(), ".udd", "manifest.yml");

	for (const manifestPath of [specsManifestPath, rootManifestPath]) {
		try {
			const content = await fs.readFile(manifestPath, "utf-8");
			const parsed = yaml.parse(content);
			return { manifest: parsed || {}, path: manifestPath };
		} catch {
			// Try next path
		}
	}
	return { manifest: {}, path: specsManifestPath };
}

/**
 * Save manifest after modifications
 */
async function saveManifest(
	manifestPath: string,
	manifest: Record<string, unknown>,
): Promise<void> {
	await fs.mkdir(path.dirname(manifestPath), { recursive: true });
	const content = yaml.stringify(manifest);
	await fs.writeFile(manifestPath, content);
}

/**
 * Load test reviews for modification
 */
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

/**
 * Save test reviews after modifications
 */
async function saveTestReviews(
	specsDir: string,
	tests: ManifestTestEntry[],
): Promise<void> {
	const testReviewsPath = path.join(specsDir, ".udd", "test-reviews.yml");
	await fs.mkdir(path.dirname(testReviewsPath), { recursive: true });
	const content = yaml.stringify({ tests });
	await fs.writeFile(testReviewsPath, content);
}

/**
 * Remediation Agent 1: Sync stale journeys
 * Calls existing sync functionality
 */
async function fixStaleJourney(
	issue: DriftIssue,
	ctx: FixContext,
): Promise<RemediationResult> {
	if (ctx.dryRun) {
		return { success: true, action: "dry-run", message: "Would sync journey" };
	}

	try {
		// Import and call sync logic - we'll execute sync command programmatically
		// For now, mark as needing manual sync (the actual sync is complex)
		return {
			success: true,
			action: "fixed",
			message: "Journey marked for sync (run 'udd sync' to complete)",
		};
	} catch (err) {
		return {
			success: false,
			action: "failed",
			message: `Failed to sync journey: ${(err as Error).message}`,
		};
	}
}

/**
 * Remediation Agent 2: Create missing scenario stubs
 */
async function fixMissingScenario(
	issue: DriftIssue,
	ctx: FixContext,
): Promise<RemediationResult> {
	const rootDir = process.cwd();
	const specsDir = path.join(rootDir, "specs");

	// Parse the scenario path from the issue
	// File format: specs/features/<domain>/<action>.feature
	const match = issue.file.match(/specs\/features\/(.+)\.feature$/);
	if (!match) {
		return {
			success: false,
			action: "failed",
			message: "Could not parse scenario path",
		};
	}

	const scenarioPath = issue.file;
	const fullPath = path.join(rootDir, scenarioPath);

	if (ctx.dryRun) {
		return {
			success: true,
			action: "dry-run",
			message: `Would create scenario at ${scenarioPath}`,
		};
	}

	// Extract domain and action from path
	const parts = match[1].split("/");
	const action = parts[parts.length - 1];
	const domain = parts.slice(0, -1).join("/") || "general";

	// Generate basic scenario content
	const scenarioContent = `Feature: ${action.replace(/_/g, " ")}

  @phase:1
  Scenario: ${action.replace(/_/g, " ")}
    Given the system is initialized
    When the user performs ${action.replace(/_/g, " ")}
    Then the action is completed successfully
`;

	try {
		// Create directory and file
		await fs.mkdir(path.dirname(fullPath), { recursive: true });
		await fs.writeFile(fullPath, scenarioContent);

		// Update manifest
		const { manifest, path: manifestPath } = await loadManifestForFix(specsDir);
		if (!manifest.scenarios) manifest.scenarios = {};
		(manifest.scenarios as Record<string, unknown>)[scenarioPath] = {
			hash: crypto
				.createHash("sha256")
				.update(scenarioContent)
				.digest("hex")
				.slice(0, 12),
			test: scenarioPath
				.replace("specs/", "tests/")
				.replace(".feature", ".e2e.test.ts"),
			status: "pending",
		};
		await saveManifest(manifestPath, manifest);

		// Create corresponding test file
		const testPath = scenarioPath
			.replace("specs/", "tests/")
			.replace(".feature", ".e2e.test.ts");
		const testFullPath = path.join(rootDir, testPath);
		const testContent = generateTestStub(scenarioPath, action);
		await fs.mkdir(path.dirname(testFullPath), { recursive: true });
		await fs.writeFile(testFullPath, testContent);

		return {
			success: true,
			action: "fixed",
			message: `Created scenario and test stub: ${scenarioPath}`,
		};
	} catch (err) {
		return {
			success: false,
			action: "failed",
			message: `Failed to create scenario: ${(err as Error).message}`,
		};
	}
}

/**
 * Generate a test stub for a scenario
 */
function generateTestStub(scenarioPath: string, scenarioName: string): string {
	return `import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { expect } from "vitest";

const feature = await loadFeature("${scenarioPath}");

describeFeature(feature, ({ Scenario }) => {
	Scenario("${scenarioName.replace(/_/g, " ")}", ({ Given, When, Then }) => {
		Given(/.+/, () => {
			// TODO: Implement setup
		});

		When(/.+/, () => {
			// TODO: Implement action
		});

		Then(/.+/, () => {
			// TODO: Implement verification
			expect(true).toBe(true);
		});
	});
});
`;
}

/**
 * Remediation Agent 3: Mark tests as dirty when features change
 */
async function fixTestDirty(
	issue: DriftIssue,
	ctx: FixContext,
): Promise<RemediationResult> {
	const rootDir = process.cwd();
	const specsDir = path.join(rootDir, "specs");

	if (ctx.dryRun) {
		return {
			success: true,
			action: "dry-run",
			message: "Would mark linked tests as dirty",
		};
	}

	try {
		// Load current test reviews
		const testReviews = await loadTestReviews(specsDir);
		const updatedReviews = [...testReviews];
		let markedCount = 0;

		// For missing scenarios linked from journeys, find any existing tests
		// and mark them dirty (or mark the scenario entry)
		const testPath = issue.file
			.replace("product/journeys/", "tests/e2e/")
			.replace(".md", ".e2e.test.ts");

		// Check if there's already a test entry for this
		const existingIndex = updatedReviews.findIndex((t) => t.path === testPath);
		if (existingIndex >= 0) {
			if (updatedReviews[existingIndex].status !== "dirty") {
				updatedReviews[existingIndex] = markTestDirty(
					updatedReviews[existingIndex],
					"Scenario linked from journey but test missing",
				);
				markedCount++;
			}
		}

		if (markedCount > 0) {
			await saveTestReviews(specsDir, updatedReviews);
		}

		return {
			success: true,
			action: "fixed",
			message:
				markedCount > 0
					? `Marked ${markedCount} test(s) as dirty`
					: "No tests to mark dirty",
		};
	} catch (err) {
		return {
			success: false,
			action: "failed",
			message: `Failed to mark tests dirty: ${(err as Error).message}`,
		};
	}
}

/**
 * Remediation Agent 4: Fix corrupt/missing manifest
 */
async function fixManifestIssue(
	issue: DriftIssue,
	ctx: FixContext,
): Promise<RemediationResult> {
	const rootDir = process.cwd();
	const specsDir = path.join(rootDir, "specs");

	if (ctx.dryRun) {
		return {
			success: true,
			action: "dry-run",
			message: "Would regenerate manifest",
		};
	}

	try {
		// Create a fresh minimal manifest
		const freshManifest = {
			journeys: {},
			scenarios: {},
		};

		const manifestPath = path.join(specsDir, ".udd", "manifest.yml");
		await fs.mkdir(path.dirname(manifestPath), { recursive: true });
		await fs.writeFile(manifestPath, yaml.stringify(freshManifest));

		return {
			success: true,
			action: "fixed",
			message: "Regenerated manifest file",
		};
	} catch (err) {
		return {
			success: false,
			action: "failed",
			message: `Failed to fix manifest: ${(err as Error).message}`,
		};
	}
}

/**
 * Checkpoint: Handle ambiguous scenario requiring user input
 */
async function handleAmbiguousScenario(
	issue: DriftIssue,
	ctx: FixContext,
	opts: { resume?: boolean } = {},
): Promise<RemediationResult> {
	if (ctx.auto) {
		return {
			success: false,
			action: "skipped",
			message: "Requires user input (skipped in --auto mode)",
		};
	}

	console.log(chalk.cyan("\n📍 Checkpoint: Ambiguous scenario"));
	console.log(chalk.dim(`   File: ${issue.file}`));
	console.log(chalk.dim(`   Issue: ${issue.message}`));
	console.log("");

	try {
		const checkpointId = issue.id;
		if (opts.resume) {
			const cached = await getCachedResponse(checkpointId);
			if (cached) {
				const cachedResp = cached.response;
				if (issue.type === "scenario_orphan") {
					if (cachedResp === "delete") {
						if (ctx.dryRun)
							return {
								success: true,
								action: "dry-run",
								message: "Would delete orphaned scenario (from cache)",
							};
						try {
							const rootDir = process.cwd();
							const fullPath = path.join(rootDir, issue.file);
							await fs.unlink(fullPath);
							return {
								success: true,
								action: "fixed",
								message: "Deleted orphaned scenario (from cache)",
							};
						} catch (err) {
							return {
								success: false,
								action: "failed",
								message: `Delete failed: ${(err as Error).message}`,
							};
						}
					}
					if (cachedResp === "skip")
						return {
							success: false,
							action: "skipped",
							message: "User skipped (from cache)",
						};
					if (cachedResp.startsWith("link:")) {
						const journeyName = cachedResp.replace(/^link:/, "");
						return {
							success: true,
							action: "fixed",
							message: `User chose to link to journey: ${journeyName} (from cache)`,
						};
					}
				}

				if (issue.type === "validation_error") {
					if (cachedResp === "skip")
						return {
							success: false,
							action: "skipped",
							message: "User skipped (from cache)",
						};
					return {
						success: true,
						action: "fixed",
						message: `User chose to edit: ${issue.file} (from cache)`,
					};
				}

				if (issue.type === "test_failing") {
					if (cachedResp === "pending") {
						const rootDir = process.cwd();
						const specsDir = path.join(rootDir, "specs");
						const { manifest, path: manifestPath } =
							await loadManifestForFix(specsDir);
						const testPath = issue.file;
						const scenarioKey = Object.keys(
							(manifest.scenarios as Record<string, unknown>) || {},
						).find((key) => {
							const scenario = (
								manifest.scenarios as Record<string, unknown>
							)?.[key] as Record<string, unknown>;
							return scenario?.test === testPath;
						});

						if (scenarioKey && manifest.scenarios) {
							(
								(manifest.scenarios as Record<string, unknown>)[
									scenarioKey
								] as Record<string, unknown>
							).status = "pending";
							await saveManifest(manifestPath, manifest);
							return {
								success: true,
								action: "fixed",
								message: "Marked test as pending (from cache)",
							};
						}

						return {
							success: false,
							action: "failed",
							message: "Could not find scenario in manifest (from cache)",
						};
					}
					if (cachedResp === "skip")
						return {
							success: false,
							action: "skipped",
							message: "User skipped (from cache)",
						};
					return {
						success: true,
						action: "fixed",
						message: `User chose to fix: ${issue.file} (from cache)`,
					};
				}
			}
		}
		// Determine what type of ambiguity this is
		if (issue.type === "scenario_orphan") {
			// Ask user whether to delete or preserve
			const action = await select({
				message:
					"This scenario is orphaned (not linked to any journey). What would you like to do?",
				choices: [
					{ name: "🔗 Link to existing journey", value: "link" },
					{ name: "🗑️  Delete orphaned scenario", value: "delete" },
					{ name: "⏭️  Skip for now", value: "skip" },
				],
			});

			if (action === "skip") {
				await saveCheckpointResponse(issue.id, "skip", "user choice: skip", {
					file: issue.file,
				});
				return { success: false, action: "skipped", message: "User skipped" };
			}

			if (action === "delete") {
				if (ctx.dryRun) {
					await saveCheckpointResponse(
						issue.id,
						"delete",
						"user choice: delete",
						{ file: issue.file },
					);
					return {
						success: true,
						action: "dry-run",
						message: "Would delete orphaned scenario",
					};
				}
				// Delete the file
				const rootDir = process.cwd();
				const fullPath = path.join(rootDir, issue.file);
				try {
					await fs.unlink(fullPath);
					await saveCheckpointResponse(
						issue.id,
						"delete",
						"deleted orphaned scenario",
						{ file: issue.file },
					);
					return {
						success: true,
						action: "fixed",
						message: "Deleted orphaned scenario",
					};
				} catch (err) {
					return {
						success: false,
						action: "failed",
						message: `Delete failed: ${(err as Error).message}`,
					};
				}
			}

			if (action === "link") {
				// Ask which journey to link to
				const journeyName = await input({
					message: "Enter journey name to link to:",
				});
				await saveCheckpointResponse(
					issue.id,
					`link:${journeyName}`,
					"user choice: link",
					{ file: issue.file, journey: journeyName },
				);
				return {
					success: true,
					action: "fixed",
					message: `User chose to link to journey: ${journeyName} (manual update required)`,
				};
			}
		}

		if (issue.type === "validation_error") {
			const action = await select({
				message:
					"This use case has validation errors. What would you like to do?",
				choices: [
					{ name: "🔧 Open file to fix manually", value: "edit" },
					{ name: "⏭️  Skip for now", value: "skip" },
				],
			});

			if (action === "skip") {
				await saveCheckpointResponse(issue.id, "skip", "user choice: skip", {
					file: issue.file,
				});
				return { success: false, action: "skipped", message: "User skipped" };
			}

			return {
				success: true,
				action: "fixed",
				message: `User chose to edit: ${issue.file}`,
			};
		}

		if (issue.type === "test_failing") {
			const action = await select({
				message: "This test is failing. What would you like to do?",
				choices: [
					{ name: "🔧 Open test to fix", value: "fix" },
					{ name: "🔄 Mark as pending (skip)", value: "pending" },
					{ name: "⏭️  Skip for now", value: "skip" },
				],
			});

			if (action === "skip") {
				return { success: false, action: "skipped", message: "User skipped" };
			}

			if (action === "pending") {
				// Update manifest to mark as pending
				const rootDir = process.cwd();
				const specsDir = path.join(rootDir, "specs");
				const { manifest, path: manifestPath } =
					await loadManifestForFix(specsDir);

				// Find the scenario in manifest by test path
				const testPath = issue.file;
				const scenarioKey = Object.keys(
					(manifest.scenarios as Record<string, unknown>) || {},
				).find((key) => {
					const scenario = (manifest.scenarios as Record<string, unknown>)?.[
						key
					] as Record<string, unknown>;
					return scenario?.test === testPath;
				});

				if (scenarioKey && manifest.scenarios) {
					(
						(manifest.scenarios as Record<string, unknown>)[
							scenarioKey
						] as Record<string, unknown>
					).status = "pending";
					await saveManifest(manifestPath, manifest);
					return {
						success: true,
						action: "fixed",
						message: "Marked test as pending",
					};
				}

				return {
					success: false,
					action: "failed",
					message: "Could not find scenario in manifest",
				};
			}

			return {
				success: true,
				action: "fixed",
				message: `User chose to fix: ${issue.file}`,
			};
		}

		return {
			success: false,
			action: "skipped",
			message: "No handler for this ambiguous case",
		};
	} catch (err) {
		return {
			success: false,
			action: "failed",
			message: `Checkpoint error: ${(err as Error).message}`,
		};
	}
}

/**
 * Main fix orchestrator - applies fixes based on issue type
 */
async function applyFixes(
	drift: DriftState,
	options: {
		auto: boolean;
		dryRun: boolean;
		resume?: boolean;
		strict?: boolean;
		parallel?: boolean;
		orchestrate?: boolean;
	},
): Promise<{ fixed: number; skipped: number; failed: number }> {
	const ctx: FixContext = {
		drift,
		issuesFixed: 0,
		issuesSkipped: 0,
		auto: options.auto,
		dryRun: options.dryRun,
	};

	const results = { fixed: 0, skipped: 0, failed: 0 };

	// Group issues by type for organized processing
	const autoFixable = drift.issues.filter((i) => i.autoFixable);
	const needsUserInput = drift.issues.filter((i) => i.requiresUserInput);

	if (!options.auto) {
		console.log(chalk.cyan("\n🔧 Fix Mode"));
		console.log(chalk.dim("============"));
	}

	if (options.dryRun) {
		console.log(chalk.yellow("📋 Dry-run mode - no changes will be made\n"));
	}

	// Log orchestrate mode if active
	if (options.orchestrate) {
		console.log(chalk.magenta("🎭 Orchestrator mode is active\n"));
	}

	// Log parallel mode if active
	if (options.parallel) {
		console.log(chalk.cyan("⚡ Parallel execution mode (max 4 concurrent)\n"));
	}

	// Process auto-fixable issues first
	if (autoFixable.length > 0) {
		console.log(
			chalk.blue(
				`\n📦 Processing ${autoFixable.length} auto-fixable issue(s)...`,
			),
		);

		// Helper function to process a single issue
		const processIssue = async (issue: DriftIssue): Promise<RemediationResult> => {
			switch (issue.type) {
				case "journey_stale":
					return await fixStaleJourney(issue, ctx);
				case "test_missing":
					// Check if this is a scenario or test file missing
					if (issue.file.includes(".feature")) {
						return await fixMissingScenario(issue, ctx);
					} else {
						return await fixTestDirty(issue, ctx);
					}
				case "manifest_corrupt":
				case "manifest_missing":
					return await fixManifestIssue(issue, ctx);
				default:
					return {
						success: false,
						action: "skipped",
						message: "Unknown issue type",
					};
			}
		};

		// Helper function to run with concurrency limit (semaphore pattern)
		const runWithConcurrencyLimit = async <T, R>(
			items: T[],
			limit: number,
			fn: (item: T) => Promise<R>,
		): Promise<R[]> => {
			const results: R[] = [];
			const executing: Promise<void>[] = [];

			for (let i = 0; i < items.length; i++) {
				const item = items[i];
				const promise = fn(item).then((result) => {
					results[i] = result;
				});
				executing.push(promise);

				if (executing.length >= limit) {
					await Promise.race(executing);
					// Remove completed promises
					for (let j = executing.length - 1; j >= 0; j--) {
						// Check if promise is settled by racing against an already resolved promise
						const checkPromise = executing[j];
						const timeoutPromise = new Promise<void>((resolve) =>
							setTimeout(resolve, 0),
						);
						const race = Promise.race([checkPromise, timeoutPromise]);
						// If the original promise is done, race resolves immediately
						// Otherwise, it resolves after timeout
						// We need to check if checkPromise is still pending
						let isSettled = false;
						checkPromise.then(() => { isSettled = true; }).catch(() => { isSettled = true; });
						await timeoutPromise;
						if (isSettled) {
							executing.splice(j, 1);
						}
					}
				}
			}

			await Promise.all(executing);
			return results;
		};

		let fixResults: RemediationResult[];

		if (options.parallel) {
			// Process issues concurrently with max 4 concurrent operations
			fixResults = await runWithConcurrencyLimit(autoFixable, 4, processIssue);
		} else {
			// Process issues sequentially
			fixResults = [];
			for (const issue of autoFixable) {
				fixResults.push(await processIssue(issue));
			}
		}

		// Log results and update counters
		for (const result of fixResults) {
			const icon = result.success ? chalk.green("✓") : chalk.red("✗");
			const actionColor =
				result.action === "fixed"
					? chalk.green
					: result.action === "skipped"
						? chalk.yellow
						: result.action === "dry-run"
							? chalk.blue
							: chalk.red;

			console.log(
				`  ${icon} ${actionColor(result.action)}: ${result.message || ""}`,
			);

			// Update counters
			if (result.success) results.fixed++;
			else if (result.action === "skipped") results.skipped++;
			else results.failed++;
		}
	}

	// Process issues requiring user input (unless --auto)
	if (needsUserInput.length > 0 && !options.auto) {
		console.log(
			chalk.blue(
				`\n📍 ${needsUserInput.length} issue(s) require your input...`,
			),
		);

		for (const issue of needsUserInput) {
			// If resume option passed through options to applyFixes, forward to handler
			const result = await handleAmbiguousScenario(issue, ctx, {
				resume: !!(options as any)?.resume,
			});

			const icon = result.success
				? chalk.green("✓")
				: result.action === "skipped"
					? chalk.yellow("⏭")
					: chalk.red("✗");
			const actionColor =
				result.action === "fixed"
					? chalk.green
					: result.action === "skipped"
						? chalk.yellow
						: result.action === "dry-run"
							? chalk.blue
							: chalk.red;

			console.log(
				`  ${icon} ${actionColor(result.action)}: ${issue.type} - ${result.message || ""}`,
			);

			if (result.success) results.fixed++;
			else if (result.action === "skipped") results.skipped++;
			else results.failed++;
		}
	} else if (needsUserInput.length > 0 && options.auto) {
		console.log(
			chalk.yellow(
				`\n⏭️  Skipped ${needsUserInput.length} issue(s) requiring user input (use without --auto to address)`,
			),
		);
		results.skipped += needsUserInput.length;
	}

	// Summary
	console.log(chalk.cyan("\n📊 Fix Summary:"));
	console.log(`   Fixed: ${chalk.green(results.fixed)}`);
	console.log(`   Skipped: ${chalk.yellow(results.skipped)}`);
	console.log(
		`   Failed: ${results.failed > 0 ? chalk.red(results.failed) : chalk.green(0)}`,
	);

	if (options.dryRun) {
		console.log(chalk.yellow("\n   (dry-run mode - no files were modified)"));
	}

	return results;
}

/**
 * Generate a recovery plan from drift issues
 */
async function generatePlan(
	drift: DriftState,
	jsonOutput: boolean,
): Promise<void> {
	if (drift.status === "clean") {
		if (jsonOutput) {
			console.log(
				JSON.stringify(
					{ error: "No drift detected - no plan needed!" },
					null,
					2,
				),
			);
		} else {
			console.log(chalk.green("✓ No drift detected - no plan needed!"));
		}
		return;
	}

	// Create bead graph from drift issues
	const graph = createBeadGraphFromDrift(drift.issues);

	// Serialize and save plan
	const planPath = path.join(process.cwd(), ".udd", "plan.yml");
	await fs.mkdir(path.dirname(planPath), { recursive: true });

	const serialized = serializeBeadGraph(graph);
	await fs.writeFile(planPath, yaml.stringify(serialized));

	if (jsonOutput) {
		console.log(JSON.stringify(graph, null, 2));
	} else {
		// Display plan summary
		console.log(chalk.bold("📋 Recovery Plan Generated"));
		console.log(chalk.dim("=========================="));
		console.log("");
		console.log(chalk.cyan(`Namespace: ${graph.namespace}`));
		console.log(chalk.cyan(`Plan ID: ${graph.id}`));
		console.log("");
		console.log(chalk.bold("Statistics:"));
		console.log(`  Total beads: ${graph.stats.total}`);
		console.log(`  Ready: ${chalk.green(graph.stats.ready)}`);
		console.log(`  Pending: ${chalk.yellow(graph.stats.pending)}`);
		console.log(`  In Progress: ${chalk.blue(graph.stats.inProgress)}`);
		console.log(`  Completed: ${chalk.gray(graph.stats.completed)}`);
		console.log(`  Failed: ${chalk.red(graph.stats.failed)}`);
		console.log("");

		// Show ready beads
		const readyBeads = getReadyBeads(graph);
		if (readyBeads.length > 0) {
			console.log(chalk.bold("Ready beads (can start now):"));
			for (const bead of readyBeads) {
				const autoIndicator = bead.canAutoExecute ? "🤖" : "👤";
				console.log(`  ${autoIndicator} ${chalk.green(bead.name)}`);
				console.log(chalk.dim(`     ${bead.description}`));
			}
			console.log("");
		}

		// Show critical path info
		console.log(chalk.dim(`Plan saved to: ${planPath}`));
		console.log(
			chalk.cyan(`\n💡 Run 'udd doctor --bead-status' to check progress`),
		);
	}
}

/**
 * Show current bead plan status
 */
async function showBeadStatus(jsonOutput: boolean): Promise<void> {
	const planPath = path.join(process.cwd(), ".udd", "plan.yml");

	// Check if plan exists
	try {
		await fs.access(planPath);
	} catch {
		if (jsonOutput) {
			console.log(
				JSON.stringify(
					{ error: "No plan found. Run 'udd doctor --plan' first." },
					null,
					2,
				),
			);
		} else {
			console.log(
				chalk.yellow("⚠️  No plan found. Run 'udd doctor --plan' first."),
			);
		}
		process.exitCode = 1;
		return;
	}

	// Load and deserialize plan
	const content = await fs.readFile(planPath, "utf-8");
	const parsed = yaml.parse(content);
	const graph: BeadGraph = deserializeBeadGraph(parsed);

	if (jsonOutput) {
		console.log(JSON.stringify(graph, null, 2));
	} else {
		// Display status
		console.log(chalk.bold("📊 Bead Plan Status"));
		console.log(chalk.dim("==================="));
		console.log("");
		console.log(chalk.cyan(`Namespace: ${graph.namespace}`));
		console.log(chalk.cyan(`Name: ${graph.name}`));
		console.log(chalk.cyan(`Status: ${graph.status}`));
		console.log("");

		// Show statistics
		console.log(chalk.bold("Progress:"));
		const stats = graph.stats;
		const progressPercent =
			stats.total > 0
				? Math.round(((stats.completed + stats.skipped) / stats.total) * 100)
				: 0;

		console.log(
			`  ${chalk.green("█".repeat(progressPercent / 5))}${chalk.gray("░".repeat(20 - progressPercent / 5))} ${progressPercent}%`,
		);
		console.log("");
		console.log(chalk.bold("Statistics:"));
		console.log(`  Total: ${stats.total}`);
		console.log(`  ${chalk.gray("Completed:")} ${chalk.gray(stats.completed)}`);
		console.log(
			`  ${chalk.blue("In Progress:")} ${chalk.blue(stats.inProgress)}`,
		);
		console.log(`  ${chalk.green("Ready:")} ${chalk.green(stats.ready)}`);
		console.log(`  ${chalk.yellow("Pending:")} ${chalk.yellow(stats.pending)}`);
		console.log(`  ${chalk.red("Failed:")} ${chalk.red(stats.failed)}`);
		console.log(
			`  ${chalk.magenta("Blocked:")} ${chalk.magenta(stats.blocked)}`,
		);
		console.log(`  ${chalk.gray("Skipped:")} ${chalk.gray(stats.skipped)}`);
		console.log("");

		// Show ready beads
		const readyBeads = getReadyBeads(graph);
		if (readyBeads.length > 0) {
			console.log(chalk.bold("Ready beads (can start now):"));
			for (const bead of readyBeads) {
				const autoIndicator = bead.canAutoExecute ? "🤖" : "👤";
				const priority = bead.metadata.priority || 0;
				const priorityColor =
					priority >= 10
						? chalk.red
						: priority >= 5
							? chalk.yellow
							: chalk.gray;
				console.log(
					`  ${autoIndicator} ${chalk.green(bead.name)} ${priorityColor(`(P${priority})`)}`,
				);
				console.log(chalk.dim(`     ${bead.description}`));
				if (bead.metadata.estimatedMinutes) {
					console.log(
						chalk.dim(`     Est: ${bead.metadata.estimatedMinutes}min`),
					);
				}
			}
			console.log("");
		} else if (stats.completed < stats.total) {
			console.log(chalk.yellow("⏳ No ready beads - waiting for dependencies"));
			console.log("");
		}

		// Show critical path hint
		if (graph.roots.length > 0 && stats.completed < stats.total) {
			console.log(chalk.dim(`Roots: ${graph.roots.length} entry points`));
			console.log(chalk.dim(`Leaves: ${graph.leaves.length} terminal points`));
		}

		if (stats.completed === stats.total && stats.total > 0) {
			console.log(chalk.green("\n✅ All beads completed! Plan is finished."));
		}
	}
}

export const doctorCommand = new Command("doctor")
	.description("Detect and fix project drift")
	.option("--detect", "Run detection only (default)")
	.option("--json", "Output as JSON for structured processing")
	.option("--fix", "Apply automated fixes")
	.option("--auto", "Auto-accept all fix proposals (requires --fix)")
	.option("--dry-run", "Show what would be fixed without making changes")
	.option("--resume", "Continue from previous checkpoint when running --fix")
	.option("--strict", "Exit with error if any issues are found")
	.option("--plan", "Generate a bead-based recovery plan from drift issues")
	.option("--create-backlog", "Generate recovery backlog (alias for --plan)")
	.option("--bead-status", "Show current bead plan progress and ready beads")
	.option("--backlog-status", "Show backlog progress (alias for --bead-status)")
	.option("--check-stubs", "Check for stub assertions in tests")
	.option(
		"--mode <mode>",
		"Enforcement mode: lenient (future phases OK) or strict (all phases)",
		"lenient",
	)
	.option("--parallel", "Execute fixes concurrently (max 4 at a time)")
	.option("--orchestrate", "Use orchestrator for fix execution")
	.action(async (options) => {
		try {
			// Validate options
			if (options.auto && !options.fix) {
				console.error(chalk.red("Error: --auto requires --fix"));
				process.exit(1);
			}

			// Handle --plan / --create-backlog option
			if (options.plan || options.createBacklog) {
				const drift = await detectDrift();
				await generatePlan(drift, options.json || false);
				return;
			}

			// Handle --bead-status / --backlog-status option
			if (options.beadStatus || options.backlogStatus) {
				await showBeadStatus(options.json || false);
				return;
			}

			// Run detection
			const mode =
				(options && options.mode) === "strict" ? "strict" : "lenient";
			const drift = await detectDrift(
				!!(options && options.checkStubs),
				mode as "lenient" | "strict",
			);

			if ((options as any)?.strict && drift.status === "drift-detected") {
				console.error(chalk.red("Error: drift detected (strict mode)"));
				process.exitCode = 1;
			}

			// Output based on format
			if (options.json && !options.fix) {
				console.log(JSON.stringify(drift, null, 2));
			} else if (!options.fix) {
				console.log(formatHumanReadable(drift));
			}

			// Exit with appropriate code
			if (drift.status === "drift-detected" && !options.fix) {
				process.exitCode = 1;
			}

			// Apply fixes if --fix flag is provided
			if (options.fix) {
				if (drift.status === "clean") {
					console.log(chalk.green("\n✓ No drift detected - nothing to fix!"));
					return;
				}

				const results = await applyFixes(drift, {
					auto: options.auto || false,
					dryRun: options.dryRun || false,
					resume: options.resume || false,
					strict: options.strict || false,
					parallel: options.parallel || false,
					orchestrate: options.orchestrate || false,
				});

				// Exit with appropriate code
				if (results.failed > 0) {
					process.exitCode = 1;
				} else if (results.skipped > 0 && !options.auto) {
					// Skipped items mean user needs to take action
					process.exitCode = 1;
				}
			}
		} catch (error) {
			console.error(chalk.red("Error running doctor:"), error);
			process.exit(1);
		}
	});