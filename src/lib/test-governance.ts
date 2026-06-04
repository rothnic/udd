import fs from "node:fs/promises";
import path from "node:path";
import { glob } from "glob";
import ts from "typescript";
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
	proof_state:
		| "reviewed"
		| "stale"
		| "missing_review"
		| "stubbed"
		| "orphaned"
		| "unlinked";
	review_status?: TestReviewRecord["status"];
	gate_blocking: boolean;
	source_references: {
		test: string;
		feature?: string;
		review_manifest?: string;
	};
}

export interface MissingProofEntry {
	feature: string;
	proof_state: "missing";
	gate_blocking: false;
	source_references: {
		feature: string;
	};
}

export interface TestGovernanceSummary {
	total: number;
	linked: number;
	unlinked: number;
	orphaned: number;
	stubbed: number;
	reviewed: number;
	stale: number;
	missing: number;
	gate_blocking: number;
}

export interface TestGovernanceReport {
	summary: TestGovernanceSummary;
	tests: TestScanEntry[];
	missing_proof: MissingProofEntry[];
	reviews: {
		source: string;
		tests: TestReviewRecord[];
		issues: string[];
	};
	generated_at: string;
}

export interface TestGateResult {
	passed: boolean;
	entries: TestScanEntry[];
	dirtyReviews: TestReviewRecord[];
	stubbedTests: TestScanEntry[];
	orphanedTests: TestScanEntry[];
	reviewManifestIssues: string[];
	summary: TestGovernanceSummary;
	blockingFindings: Array<{
		type:
			| "review_manifest"
			| "stubbed_test"
			| "orphaned_test"
			| "unlinked_test"
			| "dirty_review";
		path: string;
		message: string;
		source_references: Record<string, string>;
	}>;
}

export const TEST_REVIEW_MANIFEST = "specs/test-reviews.yml";
export const LOCAL_TEST_REVIEW_CACHE = ".udd/test-reviews.yml";

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
	const matches = new Set<string>();
	const sourceFile = ts.createSourceFile(
		"test.ts",
		content,
		ts.ScriptTarget.Latest,
		true,
		ts.ScriptKind.TSX,
	);

	function literalValue(
		node: ts.Expression,
	): string | number | boolean | null | undefined {
		if (node.kind === ts.SyntaxKind.TrueKeyword) return true;
		if (node.kind === ts.SyntaxKind.FalseKeyword) return false;
		if (node.kind === ts.SyntaxKind.NullKeyword) return null;
		if (ts.isStringLiteralLike(node)) return node.text;
		if (ts.isNumericLiteral(node)) return Number(node.text);
		return undefined;
	}

	function visit(node: ts.Node): void {
		if (
			ts.isCallExpression(node) &&
			ts.isPropertyAccessExpression(node.expression) &&
			["toBe", "toEqual", "toStrictEqual"].includes(node.expression.name.text) &&
			node.arguments.length === 1
		) {
			const matcherTarget = node.expression.expression;
			if (
				ts.isCallExpression(matcherTarget) &&
				ts.isIdentifier(matcherTarget.expression) &&
				matcherTarget.expression.text === "expect" &&
				matcherTarget.arguments.length === 1
			) {
				const expected = literalValue(node.arguments[0]);
				const actual = literalValue(matcherTarget.arguments[0]);
				if (expected !== undefined && actual !== undefined && expected === actual) {
					matches.add(node.getText(sourceFile));
				}
			}
		}

		ts.forEachChild(node, visit);
	}

	visit(sourceFile);
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
			proof_state:
				status === "orphaned"
					? "orphaned"
					: status === "unlinked"
						? "unlinked"
						: stubAssertions.length > 0
							? "stubbed"
							: "missing_review",
			gate_blocking: status === "orphaned" || stubAssertions.length > 0,
			source_references: {
				test: toPosix(file),
				...(feature ? { feature } : {}),
			},
		});
	}

	return entries;
}

async function findFeatureFiles(rootDir = process.cwd()): Promise<string[]> {
	return (
		await glob("specs/features/**/*.feature", {
			cwd: rootDir,
			nodir: true,
		})
	)
		.map(toPosix)
		.sort();
}

export async function loadTestReviewManifest(
	rootDir = process.cwd(),
): Promise<TestReviewManifest> {
	const result = await readTestReviewManifest(rootDir);
	return result.manifest;
}

export async function buildTestGovernanceReport(
	rootDir = process.cwd(),
	now = new Date(),
): Promise<TestGovernanceReport> {
	const [entries, manifestResult, featureFiles] = await Promise.all([
		scanTests(rootDir),
		readTestReviewManifest(rootDir),
		findFeatureFiles(rootDir),
	]);
	const reviewByPath = new Map(
		manifestResult.manifest.tests.map((record) => [record.path, record]),
	);
	const linkedFeatures = new Set(
		entries
			.map((entry) => entry.feature)
			.filter((feature): feature is string => Boolean(feature)),
	);
	const tests = entries.map((entry) => {
		const review = reviewByPath.get(entry.path);
		const proofState: TestScanEntry["proof_state"] =
			entry.status === "orphaned"
				? "orphaned"
				: entry.status === "unlinked"
					? "unlinked"
					: entry.stubAssertions.length > 0
						? "stubbed"
						: review?.status === "clean"
							? "reviewed"
							: review?.status === "dirty"
								? "stale"
								: "missing_review";
			const gateBlocking =
				entry.status === "orphaned" ||
				entry.status === "unlinked" ||
				entry.stubAssertions.length > 0 ||
				review?.status === "dirty";

		return {
			...entry,
			proof_state: proofState,
			review_status: review?.status,
			gate_blocking: gateBlocking,
			source_references: {
				...entry.source_references,
				...(review ? { review_manifest: TEST_REVIEW_MANIFEST } : {}),
			},
		};
	});
	const missingProof = featureFiles
		.filter((feature) => !linkedFeatures.has(feature))
		.map((feature) => ({
			feature,
			proof_state: "missing" as const,
			gate_blocking: false as const,
			source_references: { feature },
		}));
	const summary: TestGovernanceSummary = {
		total: tests.length,
		linked: tests.filter((entry) => entry.status === "linked").length,
		unlinked: tests.filter((entry) => entry.status === "unlinked").length,
		orphaned: tests.filter((entry) => entry.status === "orphaned").length,
		stubbed: tests.filter((entry) => entry.stubAssertions.length > 0).length,
		reviewed: tests.filter((entry) => entry.proof_state === "reviewed").length,
		stale: tests.filter((entry) => entry.proof_state === "stale").length,
		missing: missingProof.length,
		gate_blocking: tests.filter((entry) => entry.gate_blocking).length,
	};

	return {
		summary,
		tests,
		missing_proof: missingProof,
		reviews: {
			source: TEST_REVIEW_MANIFEST,
			tests: manifestResult.manifest.tests,
			issues: manifestResult.issues,
		},
		generated_at: now.toISOString(),
	};
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
	if (!feature) {
		throw new Error(
			`Cannot review ${normalizedPath}: test is not linked to a feature.`,
		);
	}

	try {
		await fs.access(path.join(rootDir, feature));
	} catch {
		throw new Error(
			`Cannot review ${normalizedPath}: linked feature does not exist (${feature}).`,
		);
	}

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
	const report = await buildTestGovernanceReport(rootDir);
	const dirtyReviews = report.reviews.tests.filter(
		(entry) => entry.status === "dirty",
	);
	const stubbedTests = report.tests.filter(
		(entry) => entry.stubAssertions.length > 0,
	);
	const orphanedTests = report.tests.filter((entry) => entry.status === "orphaned");
	const unlinkedTests = report.tests.filter((entry) => entry.status === "unlinked");
	const blockingFindings: TestGateResult["blockingFindings"] = [
		...report.reviews.issues.map((issue) => ({
			type: "review_manifest" as const,
			path: TEST_REVIEW_MANIFEST,
			message: issue,
			source_references: { review_manifest: TEST_REVIEW_MANIFEST },
		})),
		...stubbedTests.map((entry) => ({
			type: "stubbed_test" as const,
			path: entry.path,
			message: `Stub assertions: ${entry.path}`,
			source_references: entry.source_references,
		})),
		...orphanedTests.map((entry) => ({
			type: "orphaned_test" as const,
			path: entry.path,
			message: `Orphaned feature link: ${entry.path} -> ${entry.feature}`,
			source_references: entry.source_references,
		})),
		...unlinkedTests.map((entry) => ({
			type: "unlinked_test" as const,
			path: entry.path,
			message: `Unlinked test proof: ${entry.path}`,
			source_references: entry.source_references,
		})),
		...dirtyReviews.map((entry) => ({
			type: "dirty_review" as const,
			path: entry.path,
			message: `Dirty review: ${entry.path}`,
			source_references: {
				test: entry.path,
				review_manifest: TEST_REVIEW_MANIFEST,
				...(entry.feature ? { feature: entry.feature } : {}),
			},
		})),
	];

	return {
		passed:
			report.reviews.issues.length === 0 &&
				dirtyReviews.length === 0 &&
				stubbedTests.length === 0 &&
				orphanedTests.length === 0 &&
				unlinkedTests.length === 0,
		entries: report.tests,
		dirtyReviews,
		stubbedTests,
		orphanedTests,
		reviewManifestIssues: report.reviews.issues,
		summary: report.summary,
		blockingFindings,
	};
}
