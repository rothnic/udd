import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { rootDir, runUdd } from "../../../utils.js";

let tempDir: string | undefined;

export async function cleanupProject(): Promise<void> {
	process.chdir(rootDir);
	if (tempDir) {
		await fs.rm(tempDir, { recursive: true, force: true });
		tempDir = undefined;
	}
}

export async function enterProject(): Promise<void> {
	await cleanupProject();
	tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "udd-governance-"));
	process.chdir(tempDir);
	await runUdd("init --yes");
}

export async function writeFeature(filePath: string): Promise<void> {
	await fs.mkdir(path.dirname(filePath), { recursive: true });
	await fs.writeFile(
		filePath,
		`Feature: ${path.basename(filePath, ".feature")}
  Scenario: User completes behavior
    Given a user need exists
    When the behavior runs
    Then the user outcome is satisfied
`,
	);
}

export async function writeTest(
	filePath: string,
	content: string,
): Promise<void> {
	await fs.mkdir(path.dirname(filePath), { recursive: true });
	await fs.writeFile(filePath, content);
}

export function linkedTest(
	featurePath: string,
	assertion = "expect(1 + 1).toBe(2)",
): string {
	return `import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { expect } from "vitest";
const feature = await loadFeature("${featurePath}");
describeFeature(feature, ({ Scenario }) => {
  Scenario("User completes behavior", ({ Then }) => {
    Then("the user outcome is satisfied", () => {
      ${assertion};
    });
  });
});
`;
}

export async function writeGovernanceFixture(): Promise<void> {
	await writeFeature("specs/features/auth/login.feature");
	await writeFeature("specs/features/billing/pay.feature");
	await writeFeature("specs/features/reports/export.feature");
	await writeTest(
		"tests/auth/login.e2e.test.ts",
		linkedTest("specs/features/auth/login.feature"),
	);
	await writeTest(
		"tests/billing/pay.e2e.test.ts",
		linkedTest("specs/features/billing/pay.feature"),
	);
	await writeTest(
		"tests/auth/stubbed.e2e.test.ts",
		linkedTest("specs/features/auth/login.feature", "expect(true).toBe(true)"),
	);
	await writeTest(
		"tests/auth/orphaned.test.ts",
		`// @feature auth/missing
import { expect, test } from "vitest";
test("orphaned", () => expect(1 + 1).toBe(2));
`,
	);
	await writeTest(
		"tests/misc/unlinked.test.ts",
		`import { expect, test } from "vitest";
test("unlinked", () => expect(1 + 1).toBe(2));
`,
	);
	await fs.mkdir("specs", { recursive: true });
	await fs.writeFile(
		"specs/test-reviews.yml",
		`tests:
  - path: tests/auth/login.e2e.test.ts
    feature: specs/features/auth/login.feature
    status: clean
    lastReviewed: "2026-06-03T00:00:00.000Z"
    reviewCount: 1
    dirtyReason: null
  - path: tests/billing/pay.e2e.test.ts
    feature: specs/features/billing/pay.feature
    status: dirty
    lastReviewed: "2026-06-03T00:00:00.000Z"
    reviewCount: 1
    dirtyReason: Feature changed after review
`,
	);
}

export async function writeStaleReviewFixture(): Promise<void> {
	await writeFeature("specs/features/billing/pay.feature");
	await writeTest(
		"tests/billing/pay.e2e.test.ts",
		linkedTest("specs/features/billing/pay.feature"),
	);
	await fs.mkdir("specs", { recursive: true });
	await fs.writeFile(
		"specs/test-reviews.yml",
		`tests:
  - path: tests/billing/pay.e2e.test.ts
    feature: specs/features/billing/pay.feature
    status: dirty
    lastReviewed: "2026-06-03T00:00:00.000Z"
    reviewCount: 1
    dirtyReason: Feature changed after review
`,
	);
	await fs.mkdir(".udd", { recursive: true });
	await fs.writeFile(
		".udd/test-reviews.yml",
		`tests:
  - path: tests/billing/pay.e2e.test.ts
    feature: specs/features/billing/pay.feature
    status: clean
    lastReviewed: "2026-06-03T00:00:00.000Z"
    reviewCount: 99
    dirtyReason: null
`,
	);
}

export async function runUddFailure(
	args: string,
): Promise<{ stdout: string; stderr: string }> {
	try {
		await runUdd(args);
		throw new Error(`Expected udd ${args} to fail`);
	} catch (error) {
		const failure = error as { stdout?: string; stderr?: string };
		return {
			stdout: failure.stdout ?? "",
			stderr: failure.stderr ?? "",
		};
	}
}

