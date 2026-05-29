import fs from "node:fs";
import path from "node:path";
import { globSync } from "glob";
import yaml, { isMap, isSeq } from "yaml";

export interface RoadmapPhase {
	id: string;
	name: string;
	number: number;
	status?: string;
}

export interface RoadmapState {
	currentPhase: number;
	currentPhaseId: string;
	phaseNames: Record<string, string>;
	phases: RoadmapPhase[];
	roadmap: Record<string, unknown>;
}

export interface PhaseValidationIssue {
	level: "error" | "warning";
	file?: string;
	phase?: number;
	message: string;
	suggestion?: string;
}

export interface PhaseValidationReport {
	currentPhase: number;
	currentPhaseName: string;
	issues: PhaseValidationIssue[];
}

function isRoadmapPhase(value: unknown): value is RoadmapPhase {
	if (!value || typeof value !== "object") return false;
	const phase = value as { id?: unknown; name?: unknown; number?: unknown };
	return (
		typeof phase.id === "string" &&
		typeof phase.name === "string" &&
		typeof phase.number === "number" &&
		Number.isFinite(phase.number)
	);
}

export function loadRoadmapState(rootDir: string): RoadmapState {
	const roadmapPath = path.join(rootDir, "specs/roadmap.yml");
	const content = fs.readFileSync(roadmapPath, "utf-8");
	const roadmap = (yaml.parse(content) ?? {}) as Record<string, unknown>;
	const phases = Array.isArray(roadmap.phases)
		? roadmap.phases.filter(isRoadmapPhase)
		: [];
	const currentPhaseId = String(roadmap.current_phase ?? "");
	const current = phases.find((phase) => phase.id === currentPhaseId);

	if (!current) {
		throw new Error("roadmap.yml current_phase does not match a phase id");
	}

	return {
		currentPhase: current.number,
		currentPhaseId,
		phaseNames: Object.fromEntries(
			phases.map((phase) => [String(phase.number), phase.name]),
		),
		phases,
		roadmap,
	};
}

export function getCurrentPhase(rootDir: string): number {
	try {
		return loadRoadmapState(rootDir).currentPhase;
	} catch {
		return 1;
	}
}

export function getPhaseNames(rootDir: string): Record<string, string> {
	try {
		return loadRoadmapState(rootDir).phaseNames;
	} catch {
		return {};
	}
}

export function getPhaseFromFeature(
	featureContent: string,
): number | undefined {
	if (!featureContent) return undefined;
	const featureIndex = featureContent.indexOf("Feature:");
	const preamble =
		featureIndex === -1
			? featureContent
			: featureContent.substring(0, featureIndex);
	const match = preamble.match(/@phase[:=]?(-?\d+)/i);
	if (!match) return undefined;
	return Number.parseInt(match[1], 10);
}

export function shouldExcludeForPhase(
	featurePhase: number | undefined,
	currentPhase: number,
): boolean {
	return featurePhase !== undefined && featurePhase > currentPhase;
}

export function getFuturePhaseTags(
	currentPhase: number,
	maxPhase = 10,
): string[] {
	const tags: string[] = [];
	for (let phase = currentPhase + 1; phase <= maxPhase; phase++) {
		tags.push(`@phase:${phase}`);
	}
	return tags;
}

export function setCurrentPhase(
	rootDir: string,
	phaseNumber: number,
): RoadmapState {
	const roadmapPath = path.join(rootDir, "specs/roadmap.yml");
	const content = fs.readFileSync(roadmapPath, "utf-8");
	const state = loadRoadmapState(rootDir);
	const next = state.phases.find((phase) => phase.number === phaseNumber);

	if (!next) {
		throw new Error(`Phase ${phaseNumber} is not defined in specs/roadmap.yml`);
	}

	const doc = yaml.parseDocument(content);
	doc.set("current_phase", next.id);
	const phases = doc.get("phases", true);

	if (isSeq(phases)) {
		for (const phaseNode of phases.items) {
			if (!isMap(phaseNode)) continue;
			const number = phaseNode.get("number");
			if (typeof number !== "number") continue;
			const phase = state.phases.find((entry) => entry.number === number);
			if (!phase) continue;
			phaseNode.set(
				"status",
				phase.number < phaseNumber
					? "completed"
					: phase.number === phaseNumber
						? "active"
						: phase.status === "completed"
							? "planned"
							: (phase.status ?? "planned"),
			);
		}
	}

	fs.writeFileSync(roadmapPath, doc.toString());
	return loadRoadmapState(rootDir);
}

export function validatePhaseConsistency(
	rootDir: string,
): PhaseValidationReport {
	const state = loadRoadmapState(rootDir);
	const phaseNumbers = state.phases
		.map((phase) => phase.number)
		.sort((a, b) => a - b);
	const definedPhaseNumbers = new Set(phaseNumbers);
	const issues: PhaseValidationIssue[] = [];

	for (let index = 0; index < phaseNumbers.length; index++) {
		const expected = index + 1;
		if (phaseNumbers[index] !== expected) {
			issues.push({
				level: "error",
				message: `Roadmap phases must be sequential; expected phase ${expected} but found ${phaseNumbers[index]}`,
				suggestion: "Renumber specs/roadmap.yml phases without gaps.",
			});
			break;
		}
	}

	for (const file of globSync("specs/features/**/*.feature", {
		cwd: rootDir,
	})) {
		const content = fs.readFileSync(path.join(rootDir, file), "utf-8");
		const featurePhase = getPhaseFromFeature(content);
		if (featurePhase === undefined) continue;

		if (featurePhase <= 0) {
			issues.push({
				level: "error",
				file,
				phase: featurePhase,
				message: "Feature phase tags must be positive integers.",
				suggestion: "Use @phase:1 or greater before the Feature declaration.",
			});
			continue;
		}

		if (!definedPhaseNumbers.has(featurePhase)) {
			issues.push({
				level: "error",
				file,
				phase: featurePhase,
				message: `Feature references undefined phase ${featurePhase}.`,
				suggestion: "Add the phase to specs/roadmap.yml or retag the feature.",
			});
			continue;
		}

		if (featurePhase > state.currentPhase) {
			issues.push({
				level: "warning",
				file,
				phase: featurePhase,
				message: `Phase ${featurePhase} work detected but current phase is ${state.currentPhase}.`,
				suggestion:
					"Future-phase planning is allowed; review before implementation to avoid scope creep.",
			});
		}
	}

	return {
		currentPhase: state.currentPhase,
		currentPhaseName: state.phaseNames[String(state.currentPhase)] ?? "Unknown",
		issues,
	};
}
