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
		// Accept multiple possible VISION.md formats. Examples seen in repo:
		//   "current_phase: 3"
		//   "Current Phase: Phase 3 - Comprehensive"
		//   "Current Phase: 3"
		let match = content.match(/current_phase:\s*(\d+)/i);
		if (!match)
			match = content.match(/current\s*phase[:\-\s]*?(?:Phase\s*)?(\d+)/i);
		if (!match) match = content.match(/Phase\s*(\d+)/i);
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

// Exclude work-in-progress scenarios by default so unimplemented WIP scenarios
// do not cause test runs to fail with ScenarioNotCalledError.
if (!excludeTags.includes("@wip")) excludeTags.push("@wip");

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
