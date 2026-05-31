import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { expect } from "vitest";
import { runUdd } from "../../../utils.js";

const feature = await loadFeature(
	"specs/features/opencode/tools/issues_list.feature",
);

describeFeature(feature, ({ Scenario }) => {
	Scenario(
		"Issues command returns shared diagnostic issues",
		({ When, Then, And }) => {
			let payload: {
				status?: string;
				summary?: { total?: number };
				issues?: Array<{ recommendation?: string }>;
			};

			When("the OpenCode adapter requests issues as JSON", async () => {
				const result = await runUdd("opencode issues --json");
				payload = JSON.parse(result.stdout);
			});

			Then(
				"the payload includes status, summary counts, and issue records",
				() => {
					expect(payload.status).toEqual(expect.any(String));
					expect(payload.summary).toEqual(
						expect.objectContaining({ total: expect.any(Number) }),
					);
					expect(payload.issues).toEqual(expect.any(Array));
				},
			);

			And("each issue record includes a recommendation", () => {
				for (const issue of payload.issues ?? []) {
					expect(issue.recommendation).toEqual(expect.any(String));
				}
			});
		},
	);
});
