import { describe, expect, it, afterAll, beforeEach } from "vitest";
import {
	cleanupProject,
	enterProject,
	runUddFailure,
	writeStaleReviewFixture,
} from "./governance-fixtures.js";

// @feature udd/test-governance/regression-detection.feature
describe("test governance regression detection", () => {
	beforeEach(enterProject);
	afterAll(cleanupProject);

	it("blocks strict gates on stale reviewed proof without local cache input", async () => {
		await writeStaleReviewFixture();

		const strict = JSON.parse(
			(await runUddFailure("gate test-governance --strict --json")).stdout,
		);

		expect(strict.blockingFindings).toContainEqual(
			expect.objectContaining({
				type: "dirty_review",
				path: "tests/billing/pay.e2e.test.ts",
			}),
		);
	});
});

