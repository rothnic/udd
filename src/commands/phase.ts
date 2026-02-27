import fs from "node:fs/promises";
import path from "node:path";
import chalk from "chalk";
import { Command } from "commander";
import yaml from "yaml";
import { getPhaseFromTest } from "../lib/test-governance.js";
import type { ManifestTestEntry } from "../types.js";

const VISION_FILE = "specs/VISION.md";
const TEST_MANIFEST_FILE = ".udd/test-reviews.yml";

async function loadVision(rootDir: string): Promise<{
	current_phase: number;
	phases: Record<string, string>;
}> {
	const visionPath = path.join(rootDir, VISION_FILE);
	const content = await fs.readFile(visionPath, "utf-8");
	const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
	if (!frontmatterMatch) {
		throw new Error("VISION.md missing frontmatter");
	}
	const frontmatter = yaml.parse(frontmatterMatch[1]);
	return {
		current_phase: frontmatter.current_phase ?? 1,
		phases: frontmatter.phases ?? {},
	};
}

async function saveVision(
	rootDir: string,
	vision: { current_phase: number; phases: Record<string, string> },
): Promise<void> {
	const visionPath = path.join(rootDir, VISION_FILE);
	const content = await fs.readFile(visionPath, "utf-8");
	const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
	if (!frontmatterMatch) throw new Error("VISION.md missing frontmatter");

	const newFrontmatter = {
		...yaml.parse(frontmatterMatch[1]),
		current_phase: vision.current_phase,
	};
	const newContent = `---\n${yaml.stringify(newFrontmatter)}---${content.slice(frontmatterMatch[0].length)}`;
	await fs.writeFile(visionPath, newContent);
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

				// 1. Load current vision
				const vision = await loadVision(rootDir);
				const oldPhase = vision.current_phase;

				// 2. Validate phase exists
				if (!vision.phases[phaseNum]) {
					console.error(
						chalk.red(`✗ Phase ${phaseNum} not defined in VISION.md`),
					);
					console.log(chalk.dim("  Available phases:"));
					for (const [num, desc] of Object.entries(vision.phases)) {
						console.log(chalk.dim(`    ${num}: ${desc}`));
					}
					process.exit(1);
				}

				// 3. Update vision
				vision.current_phase = phaseNum;
				await saveVision(rootDir, vision);
				console.log(
					chalk.green(`✓ Phase set to ${phaseNum}: ${vision.phases[phaseNum]}`),
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
				const vision = await loadVision(rootDir);
				console.log(chalk.blue.bold("\n📊 Current Phase\n"));
				console.log(
					`Phase ${vision.current_phase}: ${vision.phases[vision.current_phase] ?? "Unknown"}`,
				);
				console.log(chalk.dim("\nAvailable phases:"));
				for (const [num, desc] of Object.entries(vision.phases)) {
					const marker =
						Number(num) === vision.current_phase ? chalk.green("→ ") : "  ";
					console.log(`${marker}${num}: ${desc}`);
				}
			}),
	)

	// Subcommand: list
	.addCommand(
		new Command("list").description("List all phases").action(async () => {
			const rootDir = process.cwd();
			const vision = await loadVision(rootDir);
			console.log(chalk.blue.bold("\n📋 Development Phases\n"));
			for (const [num, desc] of Object.entries(vision.phases)) {
				const marker =
					Number(num) === vision.current_phase ? chalk.green("→ ") : "  ";
				const status =
					Number(num) === vision.current_phase ? chalk.green(" (current)") : "";
				console.log(`${marker}${num}: ${desc}${status}`);
			}
		}),
	);
