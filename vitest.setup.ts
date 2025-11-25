import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { setVitestCucumberConfiguration } from "@amiceli/vitest-cucumber";

/**
 * Vitest setup file for UDD project.
 *
 * Reads the current phase from specs/VISION.md and excludes
 * scenarios tagged with future phases (e.g., @phase:4, @phase:5)
 * from test runs.
 */

function getCurrentPhase(): number {
	try {
		const visionPath = resolve(__dirname, "specs/VISION.md");
		const content = readFileSync(visionPath, "utf-8");
		const match = content.match(/current_phase:\s*(\d+)/);
		return match ? Number.parseInt(match[1], 10) : 1;
	} catch {
		// Default to phase 1 if VISION.md can't be read
		return 1;
	}
}

function getFuturePhaseTags(currentPhase: number): string[] {
	// Generate tags for phases beyond current (up to phase 10)
	const futureTags: string[] = [];
	for (let phase = currentPhase + 1; phase <= 10; phase++) {
		futureTags.push(`@phase:${phase}`);
	}
	return futureTags;
}

const currentPhase = getCurrentPhase();
const excludeTags = getFuturePhaseTags(currentPhase);

if (excludeTags.length > 0) {
	console.log(
		`[vitest-cucumber] Current phase: ${currentPhase}, excluding tags: ${excludeTags.join(", ")}`,
	);
}

setVitestCucumberConfiguration({
	excludeTags,
	predefinedSteps: [],
	mappedExamples: {},
});
