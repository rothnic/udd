import fs from "node:fs";
import path from "node:path";
import yaml from "yaml";

/**
 * Read current phase from specs/VISION.md. Supports frontmatter with
 * `current_phase: N` and fallback simple lines like "Current Phase: Phase N - Name"
 */
export function getCurrentPhase(rootDir: string): number {
	try {
		const visionPath = path.join(rootDir, "specs/VISION.md");
		const content = fs.readFileSync(visionPath, "utf-8");

		const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
		if (frontmatterMatch) {
			try {
				const fm = yaml.parse(frontmatterMatch[1]);
				const v = fm?.current_phase ?? fm?.currentPhase ?? fm?.phase;
				if (typeof v === "number" && Number.isFinite(v)) return v;
				if (typeof v === "string" && /\d+/.test(v))
					return Number.parseInt(String(v).match(/(\d+)/)![1], 10);
			} catch {
				// fallthrough to regex parsing
			}
		}

		// Accept multiple textual formats seen in repo
		let match = content.match(/current_phase:\s*(\d+)/i);
		if (!match)
			match = content.match(/current\s*phase[:\-\s]*?(?:Phase\s*)?(\d+)/i);
		if (!match) match = content.match(/Phase\s*(\d+)/i);
		if (match) return Number.parseInt(match[1], 10);
	} catch {
		// ignore and default
	}
	return 1;
}

/**
 * Parse a feature file content and return numeric phase if present via @phase:N tag
 * The tag must appear before the Feature: keyword to be considered a tag.
 */
export function getPhaseFromFeature(
	featureContent: string,
): number | undefined {
	if (!featureContent) return undefined;
	const featureIndex = featureContent.indexOf("Feature:");
	const preamble =
		featureIndex !== -1
			? featureContent.substring(0, featureIndex)
			: featureContent;
	const m = preamble.match(/@phase[:=]?(\d+)/i);
	if (m) return Number.parseInt(m[1], 10);
	return undefined;
}

export function shouldExcludeForPhase(
	featurePhase: number | undefined,
	currentPhase: number,
): boolean {
	if (featurePhase === undefined) return false;
	return featurePhase > currentPhase;
}

/**
 * Generate exclusion tags for phases strictly greater than currentPhase.
 * By default generates up to phase 10 unless maxPhase provided.
 */
export function getFuturePhaseTags(
	currentPhase: number,
	maxPhase = 10,
): string[] {
	const tags: string[] = [];
	for (let p = currentPhase + 1; p <= maxPhase; p++) tags.push(`@phase:${p}`);
	return tags;
}

export default {
	getCurrentPhase,
	getPhaseFromFeature,
	shouldExcludeForPhase,
	getFuturePhaseTags,
};
