import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { glob } from "glob";
import yaml from "yaml";

export type DiagnosticSeverity = "critical" | "warning" | "info";

export type DiagnosticIssueType =
	| "product_missing"
	| "specs_missing"
	| "manifest_missing"
	| "manifest_invalid"
	| "journeys_missing"
	| "missing_journey"
	| "journey_stale"
	| "missing_scenario"
	| "orphan_scenario";

export interface DiagnosticIssue {
	id: string;
	severity: DiagnosticSeverity;
	type: DiagnosticIssueType;
	file: string;
	message: string;
	recommendation: string;
}

export interface DiagnosticSummary {
	critical: number;
	warning: number;
	info: number;
	total: number;
}

export interface DiagnosticReport {
	status: "healthy" | "drift-detected";
	healthy: boolean;
	lastCheck: string;
	summary: DiagnosticSummary;
	issues: DiagnosticIssue[];
}

interface ManifestJourney {
	path?: string;
	hash?: string;
	scenarios?: unknown;
}

interface Manifest {
	journeys?: Record<string, ManifestJourney>;
	scenarios?: Record<string, unknown>;
}

function hashContent(content: string): string {
	return crypto.createHash("sha256").update(content).digest("hex").slice(0, 12);
}

function posixPath(...parts: string[]): string {
	return parts.join("/").replace(/\\/g, "/");
}

function issue(
	type: DiagnosticIssueType,
	severity: DiagnosticSeverity,
	file: string,
	message: string,
	recommendation: string,
): DiagnosticIssue {
	return {
		id: `${severity}:${type}:${file}`,
		severity,
		type,
		file,
		message,
		recommendation,
	};
}

async function exists(filePath: string): Promise<boolean> {
	try {
		await fs.access(filePath);
		return true;
	} catch {
		return false;
	}
}

async function readManifest(
	rootDir: string,
	issues: DiagnosticIssue[],
): Promise<Manifest | null> {
	const manifestPath = path.join(rootDir, "specs", ".udd", "manifest.yml");

	try {
		const content = await fs.readFile(manifestPath, "utf-8");
		const parsed = yaml.parse(content);
		if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
			issues.push(
				issue(
					"manifest_invalid",
					"critical",
					"specs/.udd/manifest.yml",
					"Manifest is not a YAML mapping.",
					"Run 'udd sync' after checking the manifest file.",
				),
			);
			return null;
		}

		const manifest = parsed as Manifest;
		if (
			manifest.journeys !== undefined &&
			(typeof manifest.journeys !== "object" ||
				Array.isArray(manifest.journeys))
		) {
			issues.push(
				issue(
					"manifest_invalid",
					"critical",
					"specs/.udd/manifest.yml",
					"Manifest journeys must be a mapping.",
					"Run 'udd sync' after checking the manifest file.",
				),
			);
			return null;
		}

		return manifest;
	} catch (error) {
		if (await exists(manifestPath)) {
			const message = error instanceof Error ? error.message : String(error);
			issues.push(
				issue(
					"manifest_invalid",
					"critical",
					"specs/.udd/manifest.yml",
					`Manifest could not be parsed: ${message}`,
					"Fix the YAML or run 'udd sync' to regenerate it.",
				),
			);
			return null;
		}

		issues.push(
			issue(
				"manifest_missing",
				"critical",
				"specs/.udd/manifest.yml",
				"Manifest file is missing.",
				"Run 'udd init' or 'udd sync' to create the manifest.",
			),
		);
		return null;
	}
}

function extractJourneyScenarioPaths(content: string): string[] {
	const paths = new Set<string>();
	for (const line of content.split("\n")) {
		const linked = line.match(/(?:→|->)\s*`([^`]+)`/);
		if (linked?.[1]) {
			paths.add(linked[1]);
			continue;
		}

		const unquoted = line.match(/(?:→|->)\s*(specs\/[^\s]+)/);
		if (unquoted?.[1]) {
			paths.add(unquoted[1]);
		}
	}
	return [...paths];
}

async function inspectJourneys(
	rootDir: string,
	manifest: Manifest | null,
	issues: DiagnosticIssue[],
): Promise<Set<string>> {
	const referencedScenarios = new Set<string>();
	const journeysDir = path.join(rootDir, "product", "journeys");
	const manifestJourneys = manifest?.journeys ?? {};

	for (const [key, entry] of Object.entries(manifestJourneys)) {
		const manifestJourneyPath =
			typeof entry.path === "string"
				? entry.path
				: posixPath("product", "journeys", `${key}.md`);
		if (!(await exists(path.join(rootDir, manifestJourneyPath)))) {
			issues.push(
				issue(
					"missing_journey",
					"warning",
					manifestJourneyPath,
					`Manifest references missing journey '${key}'.`,
					"Restore the journey file or run 'udd sync' to refresh the manifest.",
				),
			);
		}
	}

	for (const scenarioPath of Object.keys(manifest?.scenarios ?? {})) {
		if (!(await exists(path.join(rootDir, scenarioPath)))) {
			issues.push(
				issue(
					"missing_scenario",
					"warning",
					scenarioPath,
					"Manifest references a missing scenario.",
					"Restore the scenario file or run 'udd sync' to refresh the manifest.",
				),
			);
		}
	}

	if (!(await exists(journeysDir))) {
		issues.push(
			issue(
				"journeys_missing",
				"warning",
				"product/journeys",
				"Journey directory is missing.",
				"Create product journeys or run 'udd init' to restore the structure.",
			),
		);
		return referencedScenarios;
	}

	const journeyFiles = (await fs.readdir(journeysDir)).filter(
		(file) => file.endsWith(".md") && !file.startsWith("_"),
	);

	for (const file of journeyFiles) {
		const journeyPath = path.join(journeysDir, file);
		const relJourneyPath = posixPath("product", "journeys", file);
		const content = await fs.readFile(journeyPath, "utf-8");
		const hash = hashContent(content);
		const key = path.basename(file, ".md");
		const manifestEntry = manifest?.journeys?.[key];

		if (manifestEntry?.hash && manifestEntry.hash !== hash) {
			issues.push(
				issue(
					"journey_stale",
					"warning",
					relJourneyPath,
					`Journey '${key}' has changed since the manifest was written.`,
					"Run 'udd sync' after reviewing the journey changes.",
				),
			);
		}

		for (const scenarioPath of extractJourneyScenarioPaths(content)) {
			if (!scenarioPath.startsWith("specs/")) {
				continue;
			}

			referencedScenarios.add(
				scenarioPath
					.replace(/^specs\/features\//, "")
					.replace(/\.feature$/, ""),
			);

			if (!(await exists(path.join(rootDir, scenarioPath)))) {
				issues.push(
					issue(
						"missing_scenario",
						"warning",
						scenarioPath,
						`Journey '${key}' references a missing scenario.`,
						"Create the scenario or update the journey reference.",
					),
				);
			}
		}
	}

	return referencedScenarios;
}

async function inspectOrphanScenarios(
	rootDir: string,
	referencedScenarios: Set<string>,
	issues: DiagnosticIssue[],
): Promise<void> {
	const scenarioFiles = await glob("specs/features/**/*.feature", {
		cwd: rootDir,
	});

	const useCaseFiles = await glob("specs/use-cases/*.yml", { cwd: rootDir });
	for (const file of useCaseFiles) {
		try {
			const parsed = yaml.parse(
				await fs.readFile(path.join(rootDir, file), "utf-8"),
			);
			const outcomes = Array.isArray(parsed?.outcomes) ? parsed.outcomes : [];
			for (const outcome of outcomes) {
				const scenarioPaths =
					outcome?.scenario_paths ?? outcome?.scenarios ?? [];
				if (Array.isArray(scenarioPaths)) {
					for (const scenarioPath of scenarioPaths) {
						if (typeof scenarioPath === "string") {
							referencedScenarios.add(scenarioPath);
						}
					}
				}
			}
		} catch {
			// Invalid use cases are reported by lint; doctor stays focused here.
		}
	}

	for (const file of scenarioFiles) {
		const scenarioId = file
			.replace(/^specs\/features\//, "")
			.replace(/\.feature$/, "");
		if (!referencedScenarios.has(scenarioId)) {
			issues.push(
				issue(
					"orphan_scenario",
					"warning",
					file,
					"Scenario is not referenced by a journey or use case outcome.",
					"Link the scenario to a use case outcome or remove it.",
				),
			);
		}
	}
}

export async function analyzeProjectDiagnostics(
	rootDir = process.cwd(),
): Promise<DiagnosticReport> {
	const issues: DiagnosticIssue[] = [];
	const productExists = await exists(path.join(rootDir, "product"));
	const specsExists = await exists(path.join(rootDir, "specs"));

	if (!productExists) {
		issues.push(
			issue(
				"product_missing",
				"critical",
				"product",
				"Product directory is missing.",
				"Run 'udd init' to create product discovery files.",
			),
		);
	}

	if (!specsExists) {
		issues.push(
			issue(
				"specs_missing",
				"critical",
				"specs",
				"Specs directory is missing.",
				"Run 'udd init' to create specs/.udd and add scenarios.",
			),
		);
	}

	const manifest = specsExists ? await readManifest(rootDir, issues) : null;
	let referencedScenarios = new Set<string>();

	if (productExists) {
		referencedScenarios = await inspectJourneys(rootDir, manifest, issues);
	}

	if (specsExists) {
		await inspectOrphanScenarios(rootDir, referencedScenarios, issues);
	}

	const summary: DiagnosticSummary = {
		critical: issues.filter((item) => item.severity === "critical").length,
		warning: issues.filter((item) => item.severity === "warning").length,
		info: issues.filter((item) => item.severity === "info").length,
		total: issues.length,
	};

	return {
		status: issues.length === 0 ? "healthy" : "drift-detected",
		healthy: issues.length === 0,
		lastCheck: new Date().toISOString(),
		summary,
		issues,
	};
}
