import { describe, expect, it, afterAll, beforeEach } from "vitest";
import { runUdd } from "../../../utils.js";
import {
	cleanupProject,
	enterProject,
	writeGovernanceFixture,
} from "./governance-fixtures.js";

// @feature udd/test-governance/test-status.feature
describe("test governance status", () => {
	beforeEach(enterProject);
	afterAll(cleanupProject);

	it("surfaces governance summary in status and agent evidence", async () => {
		await writeGovernanceFixture();

		const status = JSON.parse((await runUdd("status --json")).stdout);
		const evidence = JSON.parse(
			(
				await runUdd(
					"opencode evidence --json --goal goals/015-test-governance-upgrade.md",
				)
			).stdout,
		);

		expect(status.test_governance.summary).toMatchObject({
			reviewed: 1,
			stale: 1,
			missing: 1,
		});
		expect(evidence.test_governance.summary).toEqual(
			status.test_governance.summary,
		);
		expect(evidence.test_governance.blocking_findings.length).toBeGreaterThan(0);
		expect(evidence.test_governance.next_action).toContain(":");
	});
});
