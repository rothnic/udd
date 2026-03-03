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

/**
 * Validate journey markdown files for feature references.
 * Returns an array of error strings (empty if none).
 */
export async function validateJourneyReferences(): Promise<string[]> {
	const errors: string[] = [];
	const rootDir = process.cwd();
	const journeyFiles = await glob("product/journeys/*.md", { cwd: rootDir });
	const re = /→\s*`([^`]+\.feature)`/g;

	for (const file of journeyFiles) {
		try {
			const absPath = path.join(rootDir, file);
			const content = await fs.readFile(absPath, "utf-8");

			for (const match of content.matchAll(re)) {
				const matchedPath = match[1];
				const matchIndex = match.index ?? 0;
				const line = content.slice(0, matchIndex).split("\n").length;

				if (!matchedPath.startsWith("specs/features/")) {
					errors.push(
						`${file}:${line} - Invalid feature reference "${matchedPath}". Must use 'specs/features/' prefix`,
					);
				}
			}
		} catch (err) {
			// If the file disappears between glob and read, skip it
			if ((err as { code?: string }).code === "ENOENT") continue;
			errors.push(`${file}: Error reading file`);
		}
	}

	return errors;
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
						if (outcome.scenarios) {
							for (const scenarioPath of outcome.scenarios) {
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

	// 6. Validate journey references in product/journeys/*.md
	try {
		const journeyErrors = await validateJourneyReferences();
		for (const e of journeyErrors) errors.push(e);
	} catch (err) {
		errors.push("Error validating journey references");
	}

	return {
		valid: errors.length === 0,
		errors,
	};
}
