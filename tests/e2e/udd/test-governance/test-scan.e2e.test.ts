import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { runUdd } from "../../../utils.js";
import {
	cleanupProject,
	enterProject,
	writeGovernanceFixture,
} from "./governance-fixtures.js";

// @feature udd/test-governance/test-scan.feature
describe("test governance scan", () => {
	beforeEach(enterProject);
	afterAll(cleanupProject);

	it("reports stable test proof states with source references", async () => {
		await writeGovernanceFixture();

		const scan = JSON.parse((await runUdd("test-scan --json")).stdout);

		expect(scan.summary).toMatchObject({
			linked: 3,
			unlinked: 1,
			orphaned: 1,
			stubbed: 1,
			reviewed: 1,
			stale: 1,
			missing: 1,
			gate_blocking: 4,
		});
		expect(scan.tests).toContainEqual(
			expect.objectContaining({
				path: "tests/auth/login.e2e.test.ts",
				proof_state: "reviewed",
				source_references: expect.objectContaining({
					test: "tests/auth/login.e2e.test.ts",
					feature: "specs/features/auth/login.feature",
					review_manifest: "specs/test-reviews.yml",
				}),
			}),
		);
		expect(scan.findings).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					type: "stubbed_test",
					path: "tests/auth/stubbed.e2e.test.ts",
					gate_blocking: true,
					source_references: expect.objectContaining({
						test: "tests/auth/stubbed.e2e.test.ts",
						feature: "specs/features/auth/login.feature",
					}),
				}),
				expect.objectContaining({
					type: "missing_proof",
					path: "specs/features/reports/export.feature",
					gate_blocking: false,
					source_references: expect.objectContaining({
						feature: "specs/features/reports/export.feature",
					}),
				}),
			]),
		);
	});
});
