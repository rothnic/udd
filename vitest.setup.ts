import { resolve } from "node:path";
import { setVitestCucumberConfiguration } from "@amiceli/vitest-cucumber";
import { getCurrentPhase, getFuturePhaseTags } from "./src/lib/phase.js";

/**
 * Vitest setup file for UDD project.
 *
 * Reads the current phase from specs/roadmap.yml and excludes
 * scenarios tagged with future phases (e.g., @phase:4, @phase:5)
 * from test runs.
 */

const currentPhase = getCurrentPhase(resolve(__dirname));
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
