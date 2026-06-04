import { expect, test } from "vitest";
import { parseGitPorcelainChangedFiles } from "../../src/commands/opencode.js";

test("opencode evidence parses porcelain rename and copy destinations", () => {
	const changed = parseGitPorcelainChangedFiles(
		[
			" M src/lib/trace-graph.ts",
			"R  old/name.feature -> specs/features/udd/new/name.feature",
			"C  old/test.ts -> tests/e2e/udd/new/name.e2e.test.ts",
			" M docs/name -> literal.md",
			"?? docs/project/reviews/2026-06-03/change-impact.md",
			"",
		].join("\n"),
	);

	expect(changed).toEqual([
		"docs/name -> literal.md",
		"docs/project/reviews/2026-06-03/change-impact.md",
		"specs/features/udd/new/name.feature",
		"src/lib/trace-graph.ts",
		"tests/e2e/udd/new/name.e2e.test.ts",
	]);
});
