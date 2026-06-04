import { describe, expect, it, afterAll, beforeEach } from "vitest";
import { runUdd } from "../../../utils.js";
import {
	cleanupProject,
	enterProject,
	writeGovernanceFixture,
} from "./governance-fixtures.js";

// @feature udd/test-governance/health-metrics.feature
describe("test governance health metrics", () => {
	beforeEach(enterProject);
	afterAll(cleanupProject);

	it("summarizes reviewed, stale, missing, and blocking proof states", async () => {
		await writeGovernanceFixture();

		const scan = JSON.parse((await runUdd("test-scan --json")).stdout);

		expect(scan.summary).toMatchObject({
			reviewed: 1,
			stale: 1,
			missing: 1,
			gate_blocking: 4,
		});
	});
});
