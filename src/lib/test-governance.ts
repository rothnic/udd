import fs from "node:fs/promises";
import path from "node:path";
import { glob } from "glob";
import yaml from "yaml";
import {
	type TestReviewManifest,
	TestReviewManifestSchema,
	type TestReviewRecord,
} from "../types.js";

export interface TestScanEntry {
	path: string;
	feature?: string;
	stubAssertions: string[];
	status: "linked" | "unlinked" | "orphaned";
}

export interface TestGateResult {
	passed: boolean;
	entries: TestScanEntry[];
	dirtyReviews: TestReviewRecord[];
	stubbedTests: TestScanEntry[];
	orphanedTests: TestScanEntry[];
	reviewManifestIssues: string[];
}

export const TEST_REVIEW_MANIFEST = ".udd/test-reviews.yml";

function toPosix(filePath: string): string {
	return filePath.replace(/\\/g, "/");
}

function normalizeFeatureReference(reference: string): string {
	if (reference.startsWith("specs/features/")) {
		return reference.endsWith(".feature")
			? toPosix(reference)
			: `${toPosix(reference)}.feature`;
	}
	const normalized = toPosix(reference);
	return `specs/features/${normalized.endsWith(".feature") ? normalized : `${normalized}.feature`}`;
}

export function detectStubAssertions(content: string): string[] {
	const patterns = [
		/expect\(\s*true\s*\)\s*\.\s*(?:toBe|toEqual|toStrictEqual)\s*\(\s*true\s*\)/g,
		/expect\(\s*false\s*\)\s*\.\s*(?:toBe|toEqual|toStrictEqual)\s*\(\s*false\s*\)/g,
		/expect\(\s*(['"`])([^'"`]+)\1\s*\)\s*\.\s*(?:toBe|toEqual|toStrictEqual)\s*\(\s*\1\2\1\s*\)/g,
		/expect\(\s*(\d+)\s*\)\s*\.\s*(?:toBe|toEqual|toStrictEqual)\s*\(\s*\1\s*\)/g,
	];

	const matches = new Set<string>();
	for (const pattern of patterns) {
		for (;;) {
			const match = pattern.exec(content);
			if (!match) break;
			matches.add(match[0]);
		}
	}
	return [...matches];
}

export function extractFeatureReference(content: string): string | undefined {
	const loadFeature = content.match(
		/loadFeature\(\s*["']([^"']+\.feature)["']/,
	);
	if (loadFeature?.[1]) {
		return normalizeFeatureReference(loadFeature[1]);
	}

	const featureComment =
		content.match(/@feature\s+([^\s]+?\.feature)\b/) ??
		content.match(/@feature\s+([^\s]+)/);
	if (featureComment?.[1]) {
		return normalizeFeatureReference(featureComment[1]);
	}

	return undefined;
}

export async function scanTests(
	rootDir = process.cwd(),
): Promise<TestScanEntry[]> {
	const files = await glob("tests/**/*.{test,e2e.test}.{ts,tsx,js,jsx}", {
		cwd: rootDir,
		nodir: true,
	});
	const entries: TestScanEntry[] = [];

	for (const file of files.sort()) {
		const content = await fs.readFile(path.join(rootDir, file), "utf-8");
		const feature = extractFeatureReference(content);
		const stubAssertions = detectStubAssertions(content);
		let status: TestScanEntry["status"] = "unlinked";

		if (feature) {
			try {
				await fs.access(path.join(rootDir, feature));
				status = "linked";
			} catch {
				status = "orphaned";
			}
		}

		entries.push({
			path: toPosix(file),
			feature,
			stubAssertions,
			status,
		});
	}

	return entries;
}

export async function loadTestReviewManifest(
	rootDir = process.cwd(),
): Promise<TestReviewManifest> {
	const result = await readTestReviewManifest(rootDir);
	return result.manifest;
}

async function readTestReviewManifest(rootDir = process.cwd()): Promise<{
	manifest: TestReviewManifest;
	issues: string[];
}> {
	const manifestPath = path.join(rootDir, TEST_REVIEW_MANIFEST);
	try {
		const parsed = yaml.parse(await fs.readFile(manifestPath, "utf-8"));
		const result = TestReviewManifestSchema.safeParse(parsed);
		if (result.success) return { manifest: result.data, issues: [] };
		return {
			manifest: { tests: [] },
			issues: [`${TEST_REVIEW_MANIFEST} does not match the review schema.`],
		};
	} catch (error) {
		try {
			await fs.access(manifestPath);
		} catch {
			return { manifest: { tests: [] }, issues: [] };
		}
		const message = error instanceof Error ? error.message : String(error);
		return {
			manifest: { tests: [] },
			issues: [`${TEST_REVIEW_MANIFEST} could not be parsed: ${message}`],
		};
	}
}

export async function saveTestReviewManifest(
	manifest: TestReviewManifest,
	rootDir = process.cwd(),
): Promise<void> {
	const manifestPath = path.join(rootDir, TEST_REVIEW_MANIFEST);
	await fs.mkdir(path.dirname(manifestPath), { recursive: true });
	await fs.writeFile(manifestPath, yaml.stringify(manifest));
}

export async function reviewTest(
	testPath: string,
	rootDir = process.cwd(),
): Promise<TestReviewRecord> {
	const absolutePath = path.isAbsolute(testPath)
		? testPath
		: path.join(rootDir, testPath);
	const normalizedPath = toPosix(path.relative(rootDir, absolutePath));
	const content = await fs.readFile(absolutePath, "utf-8");
	const stubAssertions = detectStubAssertions(content);

	if (stubAssertions.length > 0) {
		throw new Error(
			`Stub assertions detected in ${normalizedPath}: ${stubAssertions.join(", ")}`,
		);
	}

	const feature = extractFeatureReference(content);
	const manifest = await loadTestReviewManifest(rootDir);
	const previous = manifest.tests.find(
		(entry) => entry.path === normalizedPath,
	);
	const record: TestReviewRecord = {
		path: normalizedPath,
		feature,
		status: "clean",
		lastReviewed: new Date().toISOString(),
		reviewCount: (previous?.reviewCount ?? 0) + 1,
		dirtyReason: null,
	};

	manifest.tests = [
		...manifest.tests.filter((entry) => entry.path !== normalizedPath),
		record,
	].sort((left, right) => left.path.localeCompare(right.path));
	await saveTestReviewManifest(manifest, rootDir);
	return record;
}

export async function checkTestGate(
	rootDir = process.cwd(),
): Promise<TestGateResult> {
	const entries = await scanTests(rootDir);
	const manifestResult = await readTestReviewManifest(rootDir);
	const manifest = manifestResult.manifest;
	const dirtyReviews = manifest.tests.filter(
		(entry) => entry.status === "dirty",
	);
	const stubbedTests = entries.filter(
		(entry) => entry.stubAssertions.length > 0,
	);
	const orphanedTests = entries.filter((entry) => entry.status === "orphaned");

	return {
		passed:
			manifestResult.issues.length === 0 &&
			dirtyReviews.length === 0 &&
			stubbedTests.length === 0 &&
			orphanedTests.length === 0,
		entries,
		dirtyReviews,
		stubbedTests,
		orphanedTests,
		reviewManifestIssues: manifestResult.issues,
	};
}
