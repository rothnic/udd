import fs from "node:fs/promises";
import path from "node:path";
import chalk from "chalk";
import { Command } from "commander";
import yaml from "yaml";
import { getPhaseFromTest } from "../lib/test-governance.js";
import type { ManifestTestEntry } from "../types.js";

const ROADMAP_FILE = "specs/roadmap.yml";
const TEST_MANIFEST_FILE = ".udd/test-reviews.yml";

interface RoadmapPhase {
	id: string;
	name: string;
	number: number;
	status?: string;
}

interface RoadmapState {
	currentPhase: number;
	currentPhaseId: string;
	phaseNames: Record<string, string>;
	roadmap: Record<string, unknown>;
}

function isRoadmapPhase(value: unknown): value is RoadmapPhase {
	if (!value || typeof value !== "object") return false;
	const phase = value as { id?: unknown; name?: unknown; number?: unknown };
	return (
		typeof phase.id === "string" &&
		typeof phase.name === "string" &&
		typeof phase.number === "number"
	);
}

async function loadRoadmap(rootDir: string): Promise<RoadmapState> {
	const roadmapPath = path.join(rootDir, ROADMAP_FILE);
	const content = await fs.readFile(roadmapPath, "utf-8");
	const roadmap = yaml.parse(content) as Record<string, unknown>;
	const phases = Array.isArray(roadmap.phases)
		? roadmap.phases.filter(isRoadmapPhase)
		: [];
	const currentPhaseId = String(roadmap.current_phase || "");
	const current = phases.find((phase) => phase.id === currentPhaseId);
	if (!current) {
		throw new Error("roadmap.yml current_phase does not match a phase id");
	}

	const phaseNames = Object.fromEntries(
		phases.map((phase) => [String(phase.number), phase.name]),
	);
	return {
		currentPhase: current.number,
		currentPhaseId,
		phaseNames,
		roadmap,
	};
}

async function saveRoadmapCurrentPhase(
	rootDir: string,
	roadmap: Record<string, unknown>,
	phaseNum: number,
): Promise<RoadmapState> {
	const phases = Array.isArray(roadmap.phases)
		? roadmap.phases.filter(isRoadmapPhase)
		: [];
	const next = phases.find((phase) => phase.number === phaseNum);
	if (!next) {
		throw new Error(`Phase ${phaseNum} not defined in roadmap.yml`);
	}

	const updated = {
		...roadmap,
		current_phase: next.id,
		phases: phases.map((phase) => ({
			...phase,
			status:
				phase.number < phaseNum
					? "completed"
					: phase.number === phaseNum
						? "active"
						: phase.status === "completed"
							? "planned"
							: phase.status,
		})),
	};
	const roadmapPath = path.join(rootDir, ROADMAP_FILE);
	await fs.writeFile(roadmapPath, yaml.stringify(updated));
	return loadRoadmap(rootDir);
}

async function loadTestManifest(rootDir: string): Promise<ManifestTestEntry[]> {
	const manifestPath = path.join(rootDir, TEST_MANIFEST_FILE);
	try {
		const content = await fs.readFile(manifestPath, "utf-8");
		const parsed = yaml.parse(content);
		if (Array.isArray(parsed?.tests)) return parsed.tests;
		return [];
	} catch {
		return [];
	}
}

async function saveTestManifest(
	rootDir: string,
	tests: ManifestTestEntry[],
): Promise<void> {
	const manifestPath = path.join(rootDir, TEST_MANIFEST_FILE);
	await fs.mkdir(path.dirname(manifestPath), { recursive: true });
	await fs.writeFile(manifestPath, yaml.stringify({ tests }));
}

export const phaseCommand = new Command("phase")
	.description("Manage development phases")

	// Subcommand: set
	.addCommand(
		new Command("set")
			.description("Set current phase and mark phase-specific tests as dirty")
			.argument("<n>", "Phase number", (val) => Number.parseInt(val, 10))
			.action(async (phaseNum: number) => {
				const rootDir = process.cwd();

				// 1. Load current roadmap state
				const roadmap = await loadRoadmap(rootDir);
				const oldPhase = roadmap.currentPhase;

				// 2. Validate phase exists
				if (!roadmap.phaseNames[phaseNum]) {
					console.error(
						chalk.red(`✗ Phase ${phaseNum} not defined in roadmap.yml`),
					);
					console.log(chalk.dim("  Available phases:"));
					for (const [num, desc] of Object.entries(roadmap.phaseNames)) {
						console.log(chalk.dim(`    ${num}: ${desc}`));
					}
					process.exit(1);
				}

				// 3. Update roadmap
				const updated = await saveRoadmapCurrentPhase(
					rootDir,
					roadmap.roadmap,
					phaseNum,
				);
				console.log(
					chalk.green(
						`✓ Phase set to ${phaseNum}: ${updated.phaseNames[phaseNum]}`,
					),
				);

				// 4. If phase increased, mark phase-specific tests as dirty
				if (phaseNum > oldPhase) {
					console.log(chalk.blue(`\n📋 Checking for tests to mark dirty...`));

					const tests = await loadTestManifest(rootDir);
					let markedCount = 0;

					for (const test of tests) {
						const testPhase = await getPhaseFromTest(
							path.join(rootDir, test.path),
						);
						if (testPhase === phaseNum && test.status !== "dirty") {
							test.status = "dirty";
							test.dirtyReason = `Phase ${phaseNum} entered`;
							test.lastReviewed = null;
							markedCount++;
						}
					}

					if (markedCount > 0) {
						await saveTestManifest(rootDir, tests);
						console.log(
							chalk.yellow(
								`⚠ ${markedCount} test(s) marked dirty for phase ${phaseNum} review`,
							),
						);
					} else {
						console.log(chalk.dim("  No tests to mark dirty"));
					}
				}
			}),
	)

	// Subcommand: current
	.addCommand(
		new Command("current")
			.description("Show current phase")
			.action(async () => {
				const rootDir = process.cwd();
				const roadmap = await loadRoadmap(rootDir);
				console.log(chalk.blue.bold("\n📊 Current Phase\n"));
				console.log(
					`Phase ${roadmap.currentPhase}: ${roadmap.phaseNames[roadmap.currentPhase] ?? "Unknown"}`,
				);
				console.log(chalk.dim("\nAvailable phases:"));
				for (const [num, desc] of Object.entries(roadmap.phaseNames)) {
					const marker =
						Number(num) === roadmap.currentPhase ? chalk.green("→ ") : "  ";
					console.log(`${marker}${num}: ${desc}`);
				}
			}),
	)

	// Subcommand: list
	.addCommand(
		new Command("list").description("List all phases").action(async () => {
			const rootDir = process.cwd();
			const roadmap = await loadRoadmap(rootDir);
			console.log(chalk.blue.bold("\n📋 Development Phases\n"));
			for (const [num, desc] of Object.entries(roadmap.phaseNames)) {
				const marker =
					Number(num) === roadmap.currentPhase ? chalk.green("→ ") : "  ";
				const status =
					Number(num) === roadmap.currentPhase ? chalk.green(" (current)") : "";
				console.log(`${marker}${num}: ${desc}${status}`);
			}
		}),
	);
