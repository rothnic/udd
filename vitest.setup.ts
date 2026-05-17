import { setVitestCucumberConfiguration } from "@amiceli/vitest-cucumber";
import phase from "./src/lib/phase";

/**
 * Vitest setup file for UDD project.
 *
 * Reads the current phase from specs/roadmap.yml and excludes
 * scenarios tagged with future phases (e.g., @phase:4, @phase:5)
 * from test runs.
 */

const currentPhase = phase.getCurrentPhase(process.cwd());

const excludeTags = phase.getFuturePhaseTags(currentPhase);

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
