import fs from "node:fs/promises";
import path from "node:path";
import { glob } from "glob";
import yaml from "yaml";

function toScenarioPath(reference: string): string {
	if (reference.endsWith(".feature")) return reference;
	return `specs/features/${reference}.feature`;
}

export async function loadUseCaseScenarioPaths(
	rootDir: string,
): Promise<Map<string, string[]>> {
	const useCaseScenarios = new Map<string, string[]>();
	const useCaseFiles = await glob("specs/use-cases/*.yml", { cwd: rootDir });

	for (const file of useCaseFiles) {
		const content = await fs.readFile(path.join(rootDir, file), "utf-8");
		const data = (yaml.parse(content) ?? {}) as {
			id?: string;
			outcomes?: (
				| string
				| { scenarios?: string[]; scenario_paths?: string[] }
			)[];
			scenarios?: string[];
			scenario_paths?: string[];
		};
		const scenarioPaths: string[] = [];

		const addReference = (reference: string) => {
			const scenarioPath = toScenarioPath(reference);
			if (!scenarioPaths.includes(scenarioPath)) {
				scenarioPaths.push(scenarioPath);
			}
		};

		const addPreferredReferences = (
			paths: string[] | undefined,
			scenarios: string[] | undefined,
		) => {
			if (paths && paths.length > 0) {
				for (const scenarioPath of paths) {
					addReference(scenarioPath);
				}
				return;
			}

			for (const scenario of scenarios ?? []) {
				addReference(scenario);
			}
		};

		for (const outcome of data.outcomes ?? []) {
			if (typeof outcome === "string") continue;
			addPreferredReferences(outcome.scenario_paths, outcome.scenarios);
		}

		addPreferredReferences(data.scenario_paths, data.scenarios);

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
