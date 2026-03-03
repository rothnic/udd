import fs from "node:fs/promises";
import path from "node:path";
import { glob } from "glob";
import yaml from "yaml";
import {
	type ManifestTestEntry,
	type TestGovernanceConfig,
	TestGovernanceConfigSchema,
	type TestReviewChecklist,
	TestReviewChecklistItem,
	TestReviewChecklistSchema,
	type TestReviewRecord,
	type TestStatus,
} from "../types.js";

// -------------------------
// Helpers
// -------------------------

function unique<T>(arr: T[]): T[] {
	return Array.from(new Set(arr));
}

function isoNow(): string {
	return new Date().toISOString();
}

// -------------------------
// Test State Management
// -------------------------

/**
 * Parse a test file for dependency paths.
 * - Collect import sources from `import ... from '...'` and `require('...')`
 * - Collect feature references via loadFeature("path") or loadFeature('path')
 */
export async function analyzeTestDependencies(
	testPath: string,
): Promise<string[]> {
	const root = process.cwd();
	const abs = path.isAbsolute(testPath) ? testPath : path.join(root, testPath);
	try {
		const content = await fs.readFile(abs, "utf-8");
		const deps: string[] = [];

		// import ... from 'x' or "x"
		const importRe = /import\s+(?:[^'";]+)\s+from\s+['"]([^'"]+)['"]/g;
		for (;;) {
			const m = importRe.exec(content);
			if (!m) break;
			deps.push(m[1]);
		}

		// require('x')
		const reqRe = /require\(\s*['"]([^'"]+)['"]\s*\)/g;
		for (;;) {
			const m = reqRe.exec(content);
			if (!m) break;
			deps.push(m[1]);
		}

		// loadFeature('specs/...') or loadFeature("...")
		const loadFeatureRe = /loadFeature\(\s*['"]([^'"]+)['"]\s*\)/g;
		for (;;) {
			const m = loadFeatureRe.exec(content);
			if (!m) break;
			deps.push(m[1]);
		}

		// Normalize deps: only local files (start with . or / or src/ or specs/ or tests/)
		const normalized = deps
			.filter(Boolean)
			.map((p) => {
				// If it's a relative path, resolve relative to test file
				if (p.startsWith("./") || p.startsWith("../")) {
					return path.normalize(path.join(path.dirname(testPath), p));
				}
				return p;
			})
			.filter((p) => {
				return (
					p.startsWith(".") ||
					p.startsWith("/") ||
					p.startsWith("src/") ||
					p.startsWith("specs/") ||
					p.startsWith("tests/")
				);
			});

		return unique(normalized);
	} catch {
		return [];
	}
}

export function detectStubAssertions(content: string): {
	hasStubs: boolean;
	stubPatterns: string[];
} {
	// Match patterns like: expect(true).toBe(true), expect(false).toBe(false), expect(0).toBe(0), expect('x').toBe('x')
	const re =
		/expect\(\s*([^)\s]+)\s*\)\s*\.\s*(?:toBe|toEqual|toStrictEqual)\s*\(\s*\1\s*\)/g;
	const matches: string[] = [];
	for (;;) {
		const m = re.exec(content);
		if (!m) break;
		matches.push(m[0]);
	}
	return { hasStubs: matches.length > 0, stubPatterns: unique(matches) };
}

/**
 * Compare two feature file contents and detect meaningful changes.
 * Pure function - no side effects.
 */
export function detectFeatureChanges(
	previousContent: string,
	currentContent: string,
): {
	hasChanges: boolean;
	changeType: "none" | "documentation" | "behavioral";
	affectedScenarios: string[];
} {
	// 1. Identical content -> no changes
	if (previousContent === currentContent) {
		return { hasChanges: false, changeType: "none", affectedScenarios: [] };
	}

	// Helpers
	const scenarioRe = /^\s*Scenario:\s*(.+)$/i;
	const stepRe = /^\s*(Given|When|Then|And|But)\s+(.+)$/i;

	function normalizeLine(s: string): string {
		return s.replace(/\s+/g, " ").trim();
	}

	function parseFeature(content: string): Map<string, string[]> {
		const lines = content.split(/\r?\n/);
		const map = new Map<string, string[]>();
		let current: string | null = null;
		for (const raw of lines) {
			const line = raw.replace(/\t/g, " ");
			const scen = line.match(scenarioRe);
			if (scen) {
				current = normalizeLine(scen[1]);
				if (!map.has(current)) map.set(current, []);
				continue;
			}

			if (!current) continue;
			const step = line.match(stepRe);
			if (step) {
				const txt = normalizeLine(step[1] + " " + step[2]);
				map.get(current)!.push(txt);
			}
		}
		return map;
	}

	function stripCommentsAndNormalize(content: string): string {
		const lines = content
			.split(/\r?\n/)
			.map((l) => l.replace(/\t/g, " "))
			.filter((l) => !/^\s*#/.test(l))
			.map((l) => normalizeLine(l))
			.filter(Boolean);
		return lines.join("\n");
	}

	// If only comments/whitespace changed -> documentation
	const prevNoComments = stripCommentsAndNormalize(previousContent);
	const currNoComments = stripCommentsAndNormalize(currentContent);
	if (prevNoComments === currNoComments) {
		return {
			hasChanges: true,
			changeType: "documentation",
			affectedScenarios: [],
		};
	}

	// Parse scenarios and steps
	const prevMap = parseFeature(previousContent);
	const currMap = parseFeature(currentContent);

	const prevNames = Array.from(prevMap.keys());
	const currNames = Array.from(currMap.keys());

	const added = currNames.filter((n) => !prevMap.has(n));
	const removed = prevNames.filter((n) => !currMap.has(n));

	const modified: string[] = [];
	for (const name of currNames) {
		if (!prevMap.has(name)) continue;
		const prevSteps = prevMap.get(name) || [];
		const currSteps = currMap.get(name) || [];
		// normalize steps ordering and text already handled; compare lengths and each step
		if (prevSteps.length !== currSteps.length) {
			modified.push(name);
			continue;
		}
		let diff = false;
		for (let i = 0; i < prevSteps.length; i++) {
			if (prevSteps[i] !== currSteps[i]) {
				diff = true;
				break;
			}
		}
		if (diff) modified.push(name);
	}

	const affected = unique([...added, ...removed, ...modified]);

	if (affected.length === 0) {
		// content differs but no scenario-level diffs detected -> treat as documentation
		return {
			hasChanges: true,
			changeType: "documentation",
			affectedScenarios: [],
		};
	}

	return {
		hasChanges: true,
		changeType: "behavioral",
		affectedScenarios: affected,
	};
}

export function calculateExpirationDate(
	lastReviewed: Date,
	expirationDays: number,
): Date {
	const ms = expirationDays * 24 * 60 * 60 * 1000;
	return new Date(lastReviewed.getTime() + ms);
}

export function isTestExpired(
	lastReviewed: string | null,
	expirationDays: number,
): boolean {
	if (!lastReviewed) return true;
	const last = new Date(lastReviewed);
	if (Number.isNaN(last.getTime())) return true;
	const expires = calculateExpirationDate(last, expirationDays);
	return Date.now() > expires.getTime();
}

// -------------------------
// Test Record Management
// -------------------------

export function markTestDirty(
	test: ManifestTestEntry,
	reason: string,
): ManifestTestEntry {
	return {
		...test,
		status: "dirty",
		dirtyReason: reason,
		lastReviewed: null,
	};
}

export function markTestClean(
	test: ManifestTestEntry,
	reviewer: string,
	answers: Record<string, boolean>,
): ManifestTestEntry {
	const last = isoNow();
	const nextCount = (test.reviewCount ?? 0) + 1;
	return {
		...test,
		status: "clean",
		lastReviewed: last,
		reviewCount: nextCount,
		dirtyReason: null,
	};
}

export function detectDirtyTests(
	tests: ManifestTestEntry[],
	config: TestGovernanceConfig,
	dependenciesChanged?: Map<string, string[]>,
): { dirty: ManifestTestEntry[]; clean: ManifestTestEntry[] } {
	const dirty: ManifestTestEntry[] = [];
	const clean: ManifestTestEntry[] = [];

	const expirationDays = config.settings?.reviewExpirationDays ?? 90;

	for (const t of tests) {
		let isDirty = false;
		let reason: string | null = null;

		if (t.status === "dirty") {
			isDirty = true;
			reason = t.dirtyReason ?? "marked dirty";
		}

		if (!isDirty && isTestExpired(t.lastReviewed ?? null, expirationDays)) {
			isDirty = true;
			reason = `expired after ${expirationDays} days`;
		}

		if (
			!isDirty &&
			dependenciesChanged &&
			dependenciesChanged.has(t.path) &&
			(config.settings?.autoMarkDirtyOnDependencyChange ?? true)
		) {
			const deps = dependenciesChanged.get(t.path) || [];
			if (deps.length > 0) {
				isDirty = true;
				reason = `dependencies changed: ${deps.join(",")}`;
			}
		}

		const entry = isDirty
			? markTestDirty(t, reason ?? "auto-marked dirty")
			: { ...t };

		if (isDirty) dirty.push(entry);
		else clean.push(entry);
	}

	return { dirty, clean };
}

// -------------------------
// Checklist Validation
// -------------------------

export function validateChecklist(
	checklist: TestReviewChecklist,
	answers: Record<string, boolean>,
): { passed: boolean; failed: string[]; missing: string[] } {
	const failed: string[] = [];
	const missing: string[] = [];

	for (const item of checklist.items) {
		const has = Object.hasOwn(answers, item.id);
		if (!has) {
			if (item.required) missing.push(item.id);
			continue;
		}
		const val = answers[item.id];
		if (!val && item.required) failed.push(item.id);
	}

	return {
		passed: failed.length === 0 && missing.length === 0,
		failed,
		missing,
	};
}

export function createReviewRecord(
	testPath: string,
	checklist: string,
	reviewer: string,
	answers: Record<string, boolean>,
	notes: string[] = [],
): TestReviewRecord {
	const cfg = getDefaultTestGovernanceConfig();
	const defaultChecklist = cfg.checklists[cfg.settings.defaultChecklist];
	const checklistObj =
		defaultChecklist && defaultChecklist.name === checklist
			? defaultChecklist
			: cfg.checklists[checklist] || defaultChecklist;

	const now = isoNow();

	// validation should conform to the shape returned by validateChecklist
	let validation: { passed: boolean; failed: string[]; missing: string[] } = {
		passed: true,
		failed: [],
		missing: [],
	};
	if (checklistObj) validation = validateChecklist(checklistObj, answers);

	const status: TestStatus = validation.passed ? "clean" : "dirty";

	const expiresAt = validation.passed
		? calculateExpirationDate(
				new Date(now),
				cfg.settings.reviewExpirationDays,
			).toISOString()
		: null;

	const record: TestReviewRecord = {
		testPath,
		status,
		lastReviewed: now,
		reviewCount: 1,
		reviewedBy: reviewer,
		checklistUsed: checklist,
		answers,
		notes: notes ?? [],
		dependencies: [],
		expiresAt,
		dirtyReason: validation.passed ? null : "checklist failed",
	};

	return record;
}

// -------------------------
// Configuration
// -------------------------

export async function loadTestGovernanceConfig(
	rootDir: string,
): Promise<TestGovernanceConfig> {
	const cfgPath = path.join(rootDir, ".udd", "test-governance.yml");
	try {
		const raw = await fs.readFile(cfgPath, "utf-8");
		const parsed = yaml.parse(raw);
		const result = TestGovernanceConfigSchema.safeParse(parsed);
		if (result.success) return result.data;
		return getDefaultTestGovernanceConfig();
	} catch {
		return getDefaultTestGovernanceConfig();
	}
}

export function getDefaultTestGovernanceConfig(): TestGovernanceConfig {
	const defaultCfg: TestGovernanceConfig = {
		checklists: {
			default: {
				name: "Standard E2E Test Review",
				description: "Standard checklist for E2E test reviews",
				items: [
					{
						id: "no_stub_assertions",
						question: "No expect(true).toBe(true) or similar stub assertions?",
						required: true,
						automated: true,
						validationPattern: "expect\\(true\\)",
					},
					{
						id: "meaningful_assertions",
						question:
							"Do assertions verify actual behavior, not just existence?",
						required: true,
						automated: false,
					},
					{
						id: "scenario_coverage",
						question: "Does test cover all scenarios in feature file?",
						required: true,
						automated: false,
					},
					{
						id: "test_structure",
						question:
							"Does test use describeFeature() and loadFeature() correctly?",
						required: true,
						automated: false,
					},
					{
						id: "error_handling",
						question: "Does test verify error cases if feature has them?",
						required: false,
						automated: false,
					},
					{
						id: "test_isolation",
						question: "Is test isolated (no shared mutable state)?",
						required: true,
						automated: false,
					},
				],
			},
		},
		settings: {
			reviewExpirationDays: 90,
			autoMarkDirtyOnDependencyChange: true,
			requireReviewOnPhaseEntry: true,
			failOnDirtyTests: false,
			defaultChecklist: "default",
			autoDetectDependencies: true,
		},
	};

	// Return as-is (schema consumers may validate)
	return defaultCfg;
}

// -------------------------
// Manifest Operations
// -------------------------

export function findTestForFeature(
	featurePath: string,
	manifestTests: ManifestTestEntry[],
): ManifestTestEntry | undefined {
	return manifestTests.find(
		(t) => t.feature === featurePath || t.path === featurePath,
	);
}

export async function getPhaseFromTest(
	testPath: string,
): Promise<number | undefined> {
	const root = process.cwd();
	const abs = path.isAbsolute(testPath) ? testPath : path.join(root, testPath);
	try {
		const content = await fs.readFile(abs, "utf-8");
		const re = /@phase\s*[:=]?\s*(\d+)/i;
		const m = content.match(re);
		if (m) return Number(m[1]);

		// try to locate referenced feature via loadFeature('specs/...')
		const loadFeatureRe = /loadFeature\(\s*['"]([^'"]+)['"]\s*\)/g;
		const lm = loadFeatureRe.exec(content);
		if (lm) {
			const featureRel = lm[1];
			const featureAbs = path.isAbsolute(featureRel)
				? featureRel
				: path.join(root, featureRel);
			try {
				const fcont = await fs.readFile(featureAbs, "utf-8");
				const phaseModule = await import("./phase.js");
				const fp = phaseModule.getPhaseFromFeature(fcont);
				if (fp !== undefined) return fp;
				const fm = fcont.match(re);
				if (fm) return Number(fm[1]);
			} catch {
				// ignore
			}
		}
	} catch {
		// ignore
	}
	return undefined;
}

/**
 * Build a test manifest by scanning test files and extracting feature linkage
 */
export async function buildTestManifest(
	rootDir: string,
	testPattern = "tests/**/*.e2e.test.ts",
): Promise<ManifestTestEntry[]> {
	// 1. Use glob to find all test files matching pattern
	try {
		const matches = await glob(testPattern, { cwd: rootDir });

		const entries: ManifestTestEntry[] = [];

		for (const rel of matches) {
			const testPath = path.isAbsolute(rel) ? rel : path.join(rootDir, rel);
			try {
				// 2a. Call analyzeTestDependencies(testPath) to get dependencies
				const deps = await analyzeTestDependencies(testPath);

				// 2b. Find the feature file in dependencies (path containing '.feature')
				const feature = deps.find((d) => d.includes(".feature"));

				const entry: ManifestTestEntry = {
					path: path.relative(rootDir, testPath),
					feature: feature ?? undefined,
					status: "dirty",
					lastReviewed: null,
					reviewCount: 0,
					dirtyReason: "Initial scan - requires review",
				};

				entries.push(entry);
			} catch (err) {
				// Log the error for visibility but continue scanning other files.
				// Swallowing silently made debugging difficult; prefer terse log.
				// Use console.debug so normal output remains clean.
				console.debug(`buildTestManifest: failed to analyze ${rel}:`, err);
			}
		}

		return entries;
	} catch (err) {
		return [];
	}
}
