import { describe, expect, it, afterAll, beforeEach } from "vitest";
import { runUdd } from "../../../utils.js";
import {
	cleanupProject,
	enterProject,
	linkedTest,
	runUddFailure,
	writeFeature,
	writeGovernanceFixture,
	writeTest,
} from "./governance-fixtures.js";

// @feature udd/test-governance/quality-gate.feature
describe("test governance quality gate", () => {
	beforeEach(enterProject);
	afterAll(cleanupProject);

	it("reports identical findings in advisory and strict modes", async () => {
		await writeGovernanceFixture();

		const advisory = JSON.parse(
			(await runUdd("gate test-governance --json")).stdout,
		);
		const strict = JSON.parse(
			(await runUddFailure("gate test-governance --strict --json")).stdout,
		);

		expect(advisory.passed).toBe(false);
		expect(advisory.blockingFindings.length).toBe(4);
		expect(strict.passed).toBe(false);
		expect(strict.blockingFindings).toEqual(advisory.blockingFindings);
	});

	it("passes strict gate with reviewed linked non-stub proof", async () => {
		await writeFeature("specs/features/auth/login.feature");
		await writeTest(
			"tests/auth/login.e2e.test.ts",
			linkedTest("specs/features/auth/login.feature"),
		);
		await runUdd("test review tests/auth/login.e2e.test.ts");

		const strict = JSON.parse(
			(await runUdd("gate test-governance --strict --json")).stdout,
		);

		expect(strict.passed).toBe(true);
		expect(strict.blockingFindings).toEqual([]);
		expect(strict.summary).toMatchObject({
			linked: 1,
			reviewed: 1,
			stubbed: 0,
			gate_blocking: 0,
		});
	});
});
