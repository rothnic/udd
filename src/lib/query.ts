import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { glob } from "glob";
import yaml from "yaml";

export interface Actor {
	name: string;
	use_cases: string[];
}

export interface Journey {
	id: string;
	name: string;
	actor: string;
	goal: string;
	scenario_count: number;
	scenarios_missing: number;
	scenarios_passing: number;
	is_stale: boolean;
}

export interface Feature {
	id: string;
	path: string;
	scenarios: {
		slug: string;
		status: "missing" | "failing" | "passing" | "stale" | "deferred";
	}[];
	has_tests: boolean;
	all_passing: boolean;
}

export interface QueryStatus {
	features: {
		total: number;
		with_tests: number;
		passing: number;
	};
	scenarios: {
		total: number;
		with_tests: number;
		passing: number;
		failing: number;
		stale: number;
		deferred: number;
	};
	gaps: {
		features_without_tests: string[];
		scenarios_without_tests: string[];
		failing_scenarios: string[];
	};
	completeness: number;
}

interface TestResult {
	name: string;
	status: string;
}

/**
 * Get all actors from use cases
 */
export async function getActors(): Promise<Actor[]> {
	const rootDir = process.cwd();
	const useCaseFiles = await glob("specs/use-cases/*.yml", { cwd: rootDir });
	const actorMap = new Map<string, Set<string>>();

	for (const file of useCaseFiles) {
		const content = await fs.readFile(path.join(rootDir, file), "utf-8");
		const data = yaml.parse(content) as {
			id: string;
			actors?: string[];
		};

		if (data.actors) {
			for (const actor of data.actors) {
				if (!actorMap.has(actor)) {
					actorMap.set(actor, new Set());
				}
				actorMap.get(actor)?.add(data.id);
			}
		}
	}

	const actors: Actor[] = [];
	for (const [name, useCases] of actorMap.entries()) {
		actors.push({
			name,
			use_cases: Array.from(useCases).sort(),
		});
	}

	return actors.sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Get all journeys from product/journeys/ directory
 */
export async function getJourneys(): Promise<Journey[]> {
	const rootDir = process.cwd();
	const journeys: Journey[] = [];

	try {
		const journeysDir = path.join(rootDir, "product/journeys");
		await fs.access(journeysDir);

		const journeyFiles = await fs.readdir(journeysDir);
		const manifestPath = path.join(rootDir, "specs/.udd/manifest.yml");
		let manifest: { journeys?: Record<string, { hash: string }> } = {};
		try {
			const manifestContent = await fs.readFile(manifestPath, "utf-8");
			manifest = yaml.parse(manifestContent) || {};
		} catch {
			// No manifest yet
		}

		for (const file of journeyFiles) {
			if (!file.endsWith(".md") || file.startsWith("_")) continue;

			const journeyPath = path.join(journeysDir, file);
			const content = await fs.readFile(journeyPath, "utf-8");
			const hash = crypto
				.createHash("sha256")
				.update(content)
				.digest("hex")
				.slice(0, 12);

			const journeyKey = path.basename(file, ".md");
			const manifestEntry = manifest.journeys?.[journeyKey];
			const isStale = !manifestEntry || manifestEntry.hash !== hash;

			// Parse journey content
			let name = journeyKey.replace(/_/g, " ");
			let actor = "";
			let goal = "";
			const linkedScenarios: string[] = [];

			for (const line of content.split("\n")) {
				if (line.startsWith("# ")) {
					name = line.replace(/^#\s*(Journey:\s*)?/, "").trim();
				}
				if (line.includes("**Actor:**")) {
					actor = line.replace(/.*\*\*Actor:\*\*\s*/, "").trim();
				}
				if (line.includes("**Goal:**")) {
					goal = line.replace(/.*\*\*Goal:\*\*\s*/, "").trim();
				}
				const stepMatch = line.match(/→\s*`([^`]+)`/);
				if (stepMatch) {
					linkedScenarios.push(stepMatch[1]);
				}
			}

			// Check scenario statuses
			let scenariosMissing = 0;
			let scenariosPassing = 0;

			for (const scenarioPath of linkedScenarios) {
				try {
					await fs.access(path.join(rootDir, scenarioPath));
					scenariosPassing++;
				} catch {
					scenariosMissing++;
				}
			}

			journeys.push({
				id: journeyKey,
				name,
				actor,
				goal,
				scenario_count: linkedScenarios.length,
				scenarios_missing: scenariosMissing,
				scenarios_passing: scenariosPassing,
				is_stale: isStale,
			});
		}
	} catch {
		// product/journeys/ doesn't exist or error reading
	}

	return journeys;
}

/**
 * Get all features with their scenario and test status
 */
export async function getFeatures(): Promise<Feature[]> {
	const rootDir = process.cwd();
	const featureFiles = await glob("specs/features/**/_feature.yml", {
		cwd: rootDir,
	});
	const features: Feature[] = [];

	// Load test results to determine scenario status
	const resultsPath = path.join(rootDir, ".udd/results.json");
	let resultsMtime = 0;
	let results: {
		testResults?: TestResult[];
	} | null = null;
	try {
		const stats = await fs.stat(resultsPath);
		resultsMtime = stats.mtimeMs;
		const resultsContent = await fs.readFile(resultsPath, "utf-8");
		results = JSON.parse(resultsContent);
	} catch {
		// Ignore if missing
	}

	// Get current phase
	let currentPhase = 1;
	try {
		const visionPath = path.join(rootDir, "specs/VISION.md");
		const visionContent = await fs.readFile(visionPath, "utf-8");
		const frontmatterMatch = visionContent.match(/^---\n([\s\S]*?)\n---/);
		if (frontmatterMatch) {
			const frontmatter = yaml.parse(frontmatterMatch[1]);
			currentPhase = frontmatter.current_phase || 1;
		}
	} catch {
		// Default to phase 1
	}

	for (const file of featureFiles) {
		let content: string;
		try {
			content = await fs.readFile(path.join(rootDir, file), "utf-8");
		} catch {
			continue;
		}
		const data = yaml.parse(content) as { id: string };
		const featureId = data.id;
		const featureDir = path.dirname(file);

		// Find scenarios for this feature
		const scenarioFiles = await glob("*.feature", {
			cwd: path.join(rootDir, featureDir),
		});

		const scenarios: Feature["scenarios"] = [];
		let hasTests = false;
		let allPassing = true;

		for (const scenarioFile of scenarioFiles) {
			const slug = path.basename(scenarioFile, ".feature");
			const absScenarioPath = path.join(rootDir, featureDir, scenarioFile);

			// Check for @phase:N tag
			let scenarioPhase: number | undefined;
			try {
				const featureContent = await fs.readFile(absScenarioPath, "utf-8");
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

			const isDeferred =
				scenarioPhase !== undefined && scenarioPhase > currentPhase;

			// Check if E2E test exists
			const relativeFeatureDir = path.relative("specs/features", featureDir);
			const testPath = path.join(
				"tests/e2e",
				relativeFeatureDir,
				`${slug}.e2e.test.ts`,
			);
			const absTestPath = path.resolve(rootDir, testPath);

			let status: "missing" | "failing" | "passing" | "stale" | "deferred" =
				"missing";
			try {
				const testStats = await fs.stat(absTestPath);
				const scenarioStats = await fs.stat(absScenarioPath);
				hasTests = true;

				if (isDeferred) {
					status = "deferred";
				} else if (!results) {
					status = "stale";
				} else {
					if (
						testStats.mtimeMs > resultsMtime ||
						scenarioStats.mtimeMs > resultsMtime
					) {
						status = "stale";
					} else {
						const testResult = results.testResults?.find(
							(r: TestResult) => r.name === absTestPath,
						);
						if (testResult) {
							status = testResult.status === "passed" ? "passing" : "failing";
						} else {
							status = "stale";
						}
					}
				}
			} catch {
				status = isDeferred ? "deferred" : "missing";
			}

			if (status !== "passing" && status !== "deferred") {
				allPassing = false;
			}

			scenarios.push({ slug, status });
		}

		features.push({
			id: featureId,
			path: file,
			scenarios,
			has_tests: hasTests,
			all_passing: allPassing && scenarios.length > 0,
		});
	}

	return features;
}

/**
 * Get project status with gap analysis
 */
export async function getQueryStatus(): Promise<QueryStatus> {
	const features = await getFeatures();

	let totalFeatures = 0;
	let featuresWithTests = 0;
	let featuresPassing = 0;
	let totalScenarios = 0;
	let scenariosWithTests = 0;
	let scenariosPassing = 0;
	let scenariosFailing = 0;
	let scenariosStale = 0;
	let scenariosDeferred = 0;

	const featuresWithoutTests: string[] = [];
	const scenariosWithoutTests: string[] = [];
	const failingScenarios: string[] = [];

	for (const feature of features) {
		totalFeatures++;
		if (feature.has_tests) {
			featuresWithTests++;
		} else {
			featuresWithoutTests.push(feature.id);
		}
		if (feature.all_passing) {
			featuresPassing++;
		}

		for (const scenario of feature.scenarios) {
			totalScenarios++;
			const scenarioId = `${feature.id}/${scenario.slug}`;

			if (scenario.status === "missing") {
				scenariosWithoutTests.push(scenarioId);
			} else {
				scenariosWithTests++;
			}

			if (scenario.status === "passing") {
				scenariosPassing++;
			} else if (scenario.status === "failing") {
				scenariosFailing++;
				failingScenarios.push(scenarioId);
			} else if (scenario.status === "stale") {
				scenariosStale++;
			} else if (scenario.status === "deferred") {
				scenariosDeferred++;
			}
		}
	}

	// Calculate completeness (passing scenarios / non-deferred scenarios)
	const nonDeferredScenarios = totalScenarios - scenariosDeferred;
	const completeness =
		nonDeferredScenarios > 0
			? Math.round((scenariosPassing / nonDeferredScenarios) * 100)
			: 0;

	return {
		features: {
			total: totalFeatures,
			with_tests: featuresWithTests,
			passing: featuresPassing,
		},
		scenarios: {
			total: totalScenarios,
			with_tests: scenariosWithTests,
			passing: scenariosPassing,
			failing: scenariosFailing,
			stale: scenariosStale,
			deferred: scenariosDeferred,
		},
		gaps: {
			features_without_tests: featuresWithoutTests,
			scenarios_without_tests: scenariosWithoutTests,
			failing_scenarios: failingScenarios,
		},
		completeness,
	};
}
