import fs from "node:fs/promises";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { runUdd } from "../../../utils.js";
import {
	cleanupProject,
	enterProject,
	linkedTest,
	writeFeature,
	writeTest,
} from "./governance-fixtures.js";

// @feature udd/test-governance/test-review.feature
describe("test review evidence", () => {
	beforeEach(enterProject);
	afterAll(cleanupProject);

	it("records source-controlled review evidence with scan classification", async () => {
		await writeFeature("specs/features/auth/login.feature");
		await writeTest(
			"tests/auth/login.e2e.test.ts",
			linkedTest("specs/features/auth/login.feature"),
		);

		await runUdd("test review tests/auth/login.e2e.test.ts");
		const manifest = await fs.readFile("specs/test-reviews.yml", "utf-8");
		const scan = JSON.parse((await runUdd("test-scan --json")).stdout);

		expect(manifest).toContain("path: tests/auth/login.e2e.test.ts");
		expect(manifest).toContain("status: clean");
		expect(scan.tests).toContainEqual(
			expect.objectContaining({
				path: "tests/auth/login.e2e.test.ts",
				proof_state: "reviewed",
				review_status: "clean",
			}),
		);
	});

	it("clears source-controlled review evidence", async () => {
		await writeFeature("specs/features/auth/login.feature");
		await writeTest(
			"tests/auth/login.e2e.test.ts",
			linkedTest("specs/features/auth/login.feature"),
		);

		await runUdd("test review tests/auth/login.e2e.test.ts");
		await runUdd("test clear tests/auth/login.e2e.test.ts");
		const manifest = await fs.readFile("specs/test-reviews.yml", "utf-8");
		const scan = JSON.parse((await runUdd("test-scan --json")).stdout);

		expect(manifest).not.toContain("path: tests/auth/login.e2e.test.ts");
		expect(scan.tests).toContainEqual(
			expect.objectContaining({
				path: "tests/auth/login.e2e.test.ts",
				proof_state: "missing_review",
			}),
		);
	});
});
