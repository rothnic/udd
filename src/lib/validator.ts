import fs from "node:fs/promises";
import path from "node:path";
import { glob } from "glob";
import yaml from "yaml";
import {
	FeatureSpecSchema,
	TechnicalRequirementSchema,
	UseCaseSpecSchema,
	VisionFrontmatterSchema,
} from "../types.js";

export interface ValidationResult {
	valid: boolean;
	errors: string[];
}

export async function validateSpecs(): Promise<ValidationResult> {
	const errors: string[] = [];
	const rootDir = process.cwd();
	const specsDir = path.join(rootDir, "specs");

	// 1. Validate Vision
	let visionUseCases: string[] = [];
	try {
		const visionPath = path.join(specsDir, "VISION.md");
		const visionContent = await fs.readFile(visionPath, "utf-8");
		const frontmatterMatch = visionContent.match(/^---\n([\s\S]*?)\n---/);
		if (!frontmatterMatch) {
			errors.push("specs/VISION.md: Missing frontmatter");
		} else {
			const frontmatter = yaml.parse(frontmatterMatch[1]);
			const result = VisionFrontmatterSchema.safeParse(frontmatter);
			if (!result.success) {
				errors.push(
					`specs/VISION.md: Invalid frontmatter - ${result.error.message}`,
				);
			} else {
				visionUseCases = result.data.use_cases || [];
			}
		}
	} catch {
		errors.push(`specs/VISION.md: File not found or unreadable`);
	}

	// 2. Validate Use Cases
	const useCaseFiles = await glob("specs/use-cases/*.yml", { cwd: rootDir });
	const useCaseIds = new Set<string>();
	// Track scenarios referenced by use cases and requirements so we can detect orphans
	const referencedScenarios = new Set<string>();
	const normalizedFeatureScenarios = new Set<string>();
	for (const file of useCaseFiles) {
		try {
			const content = await fs.readFile(path.join(rootDir, file), "utf-8");
			const data = yaml.parse(content);
			const result = UseCaseSpecSchema.safeParse(data);
			if (!result.success) {
				errors.push(`${file}: Invalid schema - ${result.error.message}`);
			} else {
				useCaseIds.add(result.data.id);
				// Check scenarios exist
				if (result.data.outcomes) {
					for (const outcome of result.data.outcomes) {
						const scenarioPaths = outcome.scenario_paths ?? outcome.scenarios;
						if (scenarioPaths) {
							for (const scenarioPath of scenarioPaths) {
								// Mark as referenced (format: area/feature/slug)
								referencedScenarios.add(scenarioPath);
								const featurePath = path.join(
									specsDir,
									"features",
									`${scenarioPath}.feature`,
								);
								try {
									await fs.access(featurePath);
								} catch {
									errors.push(
										`${file}: References missing scenario ${scenarioPath}`,
									);
								}
							}
						}
					}
				}
			}
		} catch (error) {
			if ((error as { code?: string }).code === "ENOENT") continue;
			errors.push(`${file}: Error reading or parsing`);
		}
	}

	// 2b. Validate VISION.md use_cases references exist
	for (const useCaseId of visionUseCases) {
		if (!useCaseIds.has(useCaseId)) {
			errors.push(
				`specs/VISION.md: References missing use case "${useCaseId}"`,
			);
		}
	}

	// 3. Validate Features
	const featureFiles = await glob("specs/features/**/_feature.yml", {
		cwd: rootDir,
	});
	for (const file of featureFiles) {
		try {
			const content = await fs.readFile(path.join(rootDir, file), "utf-8");
			const data = yaml.parse(content);
			const result = FeatureSpecSchema.safeParse(data);
			if (!result.success) {
				errors.push(`${file}: Invalid schema - ${result.error.message}`);
			}
		} catch (error) {
			if ((error as { code?: string }).code === "ENOENT") continue;
			errors.push(`${file}: Error reading or parsing`);
		}
	}

	// 4. Validate Requirements
	const reqFiles = await glob("specs/requirements/*.yml", { cwd: rootDir });
	for (const file of reqFiles) {
		try {
			const content = await fs.readFile(path.join(rootDir, file), "utf-8");
			const data = yaml.parse(content);
			const result = TechnicalRequirementSchema.safeParse(data);
			if (!result.success) {
				errors.push(`${file}: Invalid schema - ${result.error.message}`);
			} else {
				// Check scenarios exist
				for (const slug of result.data.scenarios) {
					// We need to construct the path. Requirement has 'feature' field e.g. "todos/basic"
					const featurePath = path.join(
						specsDir,
						"features",
						result.data.feature,
						`${slug}.feature`,
					);
					try {
						await fs.access(featurePath);
						// Mark as referenced using feature/slug
						referencedScenarios.add(`${result.data.feature}/${slug}`);
					} catch {
						errors.push(
							`${file}: References missing scenario ${slug} in feature ${result.data.feature}`,
						);
					}
				}
			}
		} catch (error) {
			if ((error as { code?: string }).code === "ENOENT") continue;
			errors.push(`${file}: Error reading or parsing`);
		}
	}

	// 5. Validate Scenarios (Basic check: file exists and has content)
	const scenarioFiles = await glob("specs/features/**/*.feature", {
		cwd: rootDir,
	});
	if (scenarioFiles.length === 0) {
		errors.push("No scenario files found");
	}

	for (const file of scenarioFiles) {
		const relativeToFeatures = file
			.replace(/^specs\/features\//, "")
			.replace(/\.feature$/, "");
		normalizedFeatureScenarios.add(relativeToFeatures);
	}

	// 6. Enforce canonical traceability chain: objective (VISION use_cases) -> use case -> scenario -> e2e test
	for (const scenarioPath of referencedScenarios) {
		if (!normalizedFeatureScenarios.has(scenarioPath)) {
			errors.push(
				`Traceability gap: referenced scenario not found in canonical features path: ${scenarioPath}`,
			);
		}
	}

	for (const scenarioPath of normalizedFeatureScenarios) {
		if (!referencedScenarios.has(scenarioPath)) {
			errors.push(
				`Traceability gap: scenario missing use-case/requirement link: ${scenarioPath}`,
			);
		}

		const scenarioSlug = scenarioPath.split("/").pop();
		if (!scenarioSlug) {
			continue;
		}

		const testPattern = `tests/e2e/**/${scenarioSlug}.e2e.test.ts`;
		const matchingTests = await glob(testPattern, { cwd: rootDir });
		if (matchingTests.length === 0) {
			errors.push(
				`Traceability gap: scenario missing e2e test: ${scenarioPath}`,
			);
		}
	}

	return {
		valid: errors.length === 0,
		errors,
	};
}
