import fs from "node:fs/promises";
import { describe, expect, it } from "vitest";
import {
	detectStubAssertions,
	reviewTest,
} from "../../src/lib/test-governance.js";
import { runUdd, withTempDir } from "../utils.js";

describe("test governance library", () => {
	it("detects executable stub assertions without matching fixture strings", () => {
		const content = `
const fixture = "expect(true).toBe(true)";
test("real behavior", () => {
  expect(1).toBe(1);
  expect(null).toBe(null);
});
`;

		expect(detectStubAssertions(content)).toEqual([
			"expect(1).toBe(1)",
			"expect(null).toBe(null)",
		]);
	});

	it("does not allow clean reviews for unlinked tests", async () => {
		await withTempDir(async () => {
			await runUdd("init --yes");
			await fs.mkdir("tests/auth", { recursive: true });
			await fs.writeFile(
				"tests/auth/unlinked.test.ts",
				`import { expect, test } from "vitest";
test("unlinked", () => expect(1 + 1).toBe(2));
`,
			);

			await expect(reviewTest("tests/auth/unlinked.test.ts")).rejects.toThrow(
				"test is not linked to a feature",
			);
		});
	});
});
