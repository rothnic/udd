import fs from "node:fs/promises";
import path from "node:path";
import { glob } from "glob";
import yaml from "yaml";

export async function loadUseCaseScenarioPaths(
	rootDir: string,
): Promise<Map<string, string[]>> {
	const useCaseScenarios = new Map<string, string[]>();
	const useCaseFiles = await glob("specs/use-cases/*.yml", { cwd: rootDir });

	for (const file of useCaseFiles) {
		const content = await fs.readFile(path.join(rootDir, file), "utf-8");
		const data = yaml.parse(content) as {
			id?: string;
			outcomes?: (string | { scenarios?: string[] })[];
			scenarios?: string[];
		};
		const scenarioIds = new Set<string>();

		for (const outcome of data.outcomes ?? []) {
			if (typeof outcome !== "string") {
				for (const scenario of outcome.scenarios ?? []) {
					scenarioIds.add(scenario);
				}
			}
		}

		for (const scenario of data.scenarios ?? []) {
			scenarioIds.add(scenario);
		}

		const scenarioPaths = [...scenarioIds].map(
			(scenario) => `specs/features/${scenario}.feature`,
		);
		const fallbackId = path.basename(file, ".yml");
		useCaseScenarios.set(fallbackId, scenarioPaths);
		if (data.id) {
			useCaseScenarios.set(data.id, scenarioPaths);
		}
	}

	return useCaseScenarios;
}

export function resolveJourneyReference(
	reference: string,
	useCaseScenarios: Map<string, string[]>,
): string[] {
	if (reference.endsWith(".feature")) {
		return [reference];
	}

	if (reference.startsWith("specs/use-cases/") && reference.endsWith(".yml")) {
		return useCaseScenarios.get(path.basename(reference, ".yml")) ?? [];
	}

	return useCaseScenarios.get(reference) ?? [];
}
