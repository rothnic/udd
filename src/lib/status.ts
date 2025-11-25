import { exec } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import { glob } from "glob";
import yaml from "yaml";

const execAsync = promisify(exec);

export interface GitStatus {
	branch: string;
	clean: boolean;
	modified: number;
	staged: number;
	untracked: number;
}

export interface ScenarioStatus {
	e2e: "missing" | "failing" | "passing" | "stale" | "deferred";
	phase?: number;
	isDeferred: boolean;
}
export interface RequirementStatus {
	tests: "missing" | "failing" | "passing" | "stale";
}

export interface FeatureStatus {
	scenarios: Record<string, ScenarioStatus>;
	requirements: Record<string, RequirementStatus>;
}

export interface UseCaseOutcome {
	description: string;
	status: "satisfied" | "unsatisfied" | "unknown" | "deferred";
	scenarios: string[];
}

export interface UseCaseStatus {
	name: string;
	scenarios: Record<
		string,
		"missing" | "failing" | "passing" | "stale" | "deferred"
	>;
	outcomes: UseCaseOutcome[];
	validation_errors: string[];
}

export interface ProjectStatus {
	git: GitStatus;
	current_phase: number;
	phases: Record<string, string>;
	active_features: string[];
	features: Record<string, FeatureStatus>;
	use_cases: Record<string, UseCaseStatus>;
	orphaned_scenarios: string[];
}

async function getGitStatus(): Promise<GitStatus> {
	try {
		const { stdout: branchOut } = await execAsync("git branch --show-current");
		const branch = branchOut.trim();

		const { stdout: statusOut } = await execAsync("git status --porcelain");
		const lines = statusOut.split("\n").filter((l) => l.trim() !== "");

		let modified = 0;
		let staged = 0;
		let untracked = 0;

		for (const line of lines) {
			const code = line.substring(0, 2);
			if (code === "??") untracked++;
			else {
				if (code[0] !== " " && code[0] !== "?") staged++;
				if (code[1] !== " " && code[1] !== "?") modified++;
			}
		}

		return {
			branch,
			clean: lines.length === 0,
			modified,
			staged,
			untracked,
		};
	} catch {
		return {
			branch: "unknown",
			clean: false,
			modified: 0,
			staged: 0,
			untracked: 0,
		};
	}
}

export async function getProjectStatus(): Promise<ProjectStatus> {
	const rootDir = process.cwd();
	const gitStatus = await getGitStatus();

	// Read current phase from VISION.md
	let currentPhase = 1;
	let phases: Record<string, string> = {};
	try {
		const visionPath = path.join(rootDir, "specs/VISION.md");
		const visionContent = await fs.readFile(visionPath, "utf-8");
		const frontmatterMatch = visionContent.match(/^---\n([\s\S]*?)\n---/);
		if (frontmatterMatch) {
			const frontmatter = yaml.parse(frontmatterMatch[1]);
			currentPhase = frontmatter.current_phase || 1;
			phases = frontmatter.phases || {};
		}
	} catch {
		// Default to phase 1 if VISION.md is missing
	}

	const status: ProjectStatus = {
		git: gitStatus,
		current_phase: currentPhase,
		phases,
		active_features: [],
		features: {},
		use_cases: {},
		orphaned_scenarios: [],
	};

	// 1. Find all features
	const featureFiles = await glob("specs/features/**/_feature.yml", {
		cwd: rootDir,
	});

	// Load results metadata once
	const resultsPath = path.join(rootDir, ".udd/results.json");
	let resultsMtime = 0;
	let results: {
		testResults?: { name: string; status: string }[];
	} | null = null;
	try {
		const stats = await fs.stat(resultsPath);
		resultsMtime = stats.mtimeMs;
		const resultsContent = await fs.readFile(resultsPath, "utf-8");
		results = JSON.parse(resultsContent);
	} catch {
		// Ignore if missing
	}
	for (const file of featureFiles) {
		let content: string;
		try {
			content = await fs.readFile(path.join(rootDir, file), "utf-8");
		} catch {
			// Skip if file disappeared (race condition in tests)
			continue;
		}
		const data = yaml.parse(content) as { id: string };
		const featureId = data.id;

		status.active_features.push(featureId);
		status.features[featureId] = {
			scenarios: {},
			requirements: {},
		};

		// Find scenarios for this feature
		const featureDir = path.dirname(file);
		const scenarioFiles = await glob("*.feature", {
			cwd: path.join(rootDir, featureDir),
		});

		for (const scenarioFile of scenarioFiles) {
			const slug = path.basename(scenarioFile, ".feature");
			const absScenarioPath = path.join(rootDir, featureDir, scenarioFile);

			// Read feature file to check for @phase:N tag at the start (before Feature:)
			let scenarioPhase: number | undefined;
			try {
				const featureContent = await fs.readFile(absScenarioPath, "utf-8");
				// @phase:N must appear before the Feature: keyword to be a tag
				const featureIndex = featureContent.indexOf("Feature:");
				if (featureIndex !== -1) {
					const preamble = featureContent.substring(0, featureIndex);
					const phaseMatch = preamble.match(/@phase:(\d+)/);
					if (phaseMatch) {
						scenarioPhase = Number.parseInt(phaseMatch[1], 10);
					}
				}
			} catch {
				// Ignore read errors
			}

			// Scenario is deferred if its phase is greater than current project phase
			const isDeferred =
				scenarioPhase !== undefined && scenarioPhase > status.current_phase;

			// Check if E2E test exists
			// Expected path: tests/e2e/<area>/<feature>/<slug>.e2e.test.ts
			// featureDir is specs/features/<area>/<feature>
			// We need to map specs/features -> tests/e2e
			const relativeFeatureDir = path.relative("specs/features", featureDir);
			const testPath = path.join(
				"tests/e2e",
				relativeFeatureDir,
				`${slug}.e2e.test.ts`,
			);
			const absTestPath = path.resolve(rootDir, testPath);

			let e2eStatus: "missing" | "failing" | "passing" | "stale" | "deferred" =
				"missing";
			try {
				const testStats = await fs.stat(absTestPath);
				const scenarioStats = await fs.stat(absScenarioPath);

				if (isDeferred) {
					e2eStatus = "deferred";
				} else if (!results) {
					e2eStatus = "stale"; // No results yet, need to run tests
				} else {
					// Check for staleness
					if (
						testStats.mtimeMs > resultsMtime ||
						scenarioStats.mtimeMs > resultsMtime
					) {
						e2eStatus = "stale";
					} else {
						const testResult = results.testResults?.find(
							(r: { name: string; status: string }) => r.name === absTestPath,
						);
						if (testResult) {
							e2eStatus =
								testResult.status === "passed" ? "passing" : "failing";
						} else {
							e2eStatus = "stale"; // Test exists but not in results, need to run
						}
					}
				}
			} catch {
				e2eStatus = isDeferred ? "deferred" : "missing";
			}

			status.features[featureId].scenarios[slug] = {
				e2e: e2eStatus,
				phase: scenarioPhase,
				isDeferred,
			};
		}
	}

	// 2. Find requirements
	const reqFiles = await glob("specs/requirements/*.yml", { cwd: rootDir });
	for (const file of reqFiles) {
		const content = await fs.readFile(path.join(rootDir, file), "utf-8");
		const data = yaml.parse(content) as { feature: string; key: string };
		const featureId = data.feature;
		const reqKey = data.key;

		if (status.features[featureId]) {
			// Check if test exists
			// Expected path: tests/unit/<domain>/<key>.test.ts or similar
			// For now, let's just look for any test file with the key in filename in tests/
			const testFiles = await glob(`tests/**/${reqKey}.test.ts`, {
				cwd: rootDir,
			});

			status.features[featureId].requirements[reqKey] = {
				tests: testFiles.length > 0 ? "passing" : "missing", // Stub logic
			};
		}
	}

	// 3. Find use cases
	const useCaseFiles = await glob("specs/use-cases/*.yml", { cwd: rootDir });
	const referencedScenarios = new Set<string>();

	for (const file of useCaseFiles) {
		const content = await fs.readFile(path.join(rootDir, file), "utf-8");
		const data = yaml.parse(content) as {
			id: string;
			name: string;
			scenarios?: string[];
			outcomes?: (string | { description: string; scenarios?: string[] })[];
		};

		const useCaseStatus: UseCaseStatus = {
			name: data.name,
			scenarios: {},
			outcomes: [],
			validation_errors: [],
		};

		// Validate outcomes format
		if (data.outcomes) {
			for (const outcome of data.outcomes) {
				if (typeof outcome === "string") {
					useCaseStatus.outcomes.push({
						description: outcome,
						status: "unknown",
						scenarios: [],
					});
					useCaseStatus.validation_errors.push(
						`Outcome "${outcome}" is in legacy format. Expected object with 'description' and 'scenarios'.`,
					);
				} else {
					const scenarios = outcome.scenarios || [];
					let isSatisfied = true;
					let hasDeferred = false;
					if (scenarios.length === 0) {
						isSatisfied = false;
					}

					for (const scenarioId of scenarios) {
						referencedScenarios.add(scenarioId);
						// Check scenario status... logic duplicated below, should refactor but keeping simple for now
						const lastSlashIndex = scenarioId.lastIndexOf("/");
						if (lastSlashIndex !== -1) {
							const featureId = scenarioId.substring(0, lastSlashIndex);
							const slug = scenarioId.substring(lastSlashIndex + 1);
							const feature = status.features[featureId];
							if (!feature?.scenarios[slug]) {
								isSatisfied = false;
							} else if (feature.scenarios[slug].isDeferred) {
								hasDeferred = true;
							} else if (feature.scenarios[slug].e2e !== "passing") {
								isSatisfied = false;
							}
						} else {
							isSatisfied = false;
						}
					}

					let outcomeStatus: "satisfied" | "unsatisfied" | "deferred" =
						"unsatisfied";
					if (hasDeferred && isSatisfied) {
						// All non-deferred scenarios pass, but some are deferred
						outcomeStatus = "deferred";
					} else if (hasDeferred && !isSatisfied) {
						// Some non-deferred scenarios fail
						outcomeStatus = "unsatisfied";
					} else if (isSatisfied) {
						outcomeStatus = "satisfied";
					}

					useCaseStatus.outcomes.push({
						description: outcome.description,
						status: outcomeStatus,
						scenarios: scenarios,
					});
				}
			}
		}

		if (data.scenarios) {
			for (const scenarioId of data.scenarios) {
				referencedScenarios.add(scenarioId);
				// scenarioId is like "area/feature/slug"
				// We need to split it. The feature ID is everything up to the last slash.
				const lastSlashIndex = scenarioId.lastIndexOf("/");
				if (lastSlashIndex === -1) {
					useCaseStatus.scenarios[scenarioId] = "missing";
					continue;
				}

				const featureId = scenarioId.substring(0, lastSlashIndex);
				const slug = scenarioId.substring(lastSlashIndex + 1);

				const feature = status.features[featureId];
				if (feature?.scenarios[slug]) {
					useCaseStatus.scenarios[scenarioId] = feature.scenarios[slug].e2e;
				} else {
					useCaseStatus.scenarios[scenarioId] = "missing";
				}
			}
		}
		status.use_cases[data.id] = useCaseStatus;
	}

	// 4. Find orphaned scenarios
	for (const [featureId, feature] of Object.entries(status.features)) {
		for (const slug of Object.keys(feature.scenarios)) {
			const fullId = `${featureId}/${slug}`;
			if (!referencedScenarios.has(fullId)) {
				status.orphaned_scenarios.push(fullId);
			}
		}
	}

	return status;
}
