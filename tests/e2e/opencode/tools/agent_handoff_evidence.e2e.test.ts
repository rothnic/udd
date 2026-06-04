import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { expect } from "vitest";
import {
	assertMatchesJsonSchema,
	loadSharedAgentPayloadSchema,
	runUdd,
} from "../../../utils.js";

const feature = await loadFeature(
	"specs/features/opencode/tools/agent_handoff_evidence.feature",
);
const sharedAgentPayloadSchema = await loadSharedAgentPayloadSchema();

interface EvidencePayload {
	status_snapshot: {
		git?: unknown;
	};
	next_recommendation: {
		verification_commands?: string[];
		suggested_files?: Array<{ action?: string }>;
	};
	verification?: Array<{ command?: string }>;
	review_notes?: string[];
	pause_reasons: unknown[];
	changed_file_impacts: Array<{
		path: string;
		recommended_commands: string[];
	}>;
	handoff: {
		summary: string;
		next_action: string;
		proof_status: Record<string, unknown>;
		blockers: unknown[];
		review_required: boolean;
		verification_commands: unknown[];
	};
}

// @feature opencode/tools/agent_handoff_evidence.feature
describeFeature(feature, ({ Scenario }) => {
	Scenario(
		"Evidence command returns reviewable handoff decisions",
		({ When, Then, And }) => {
			let evidence: EvidencePayload;

			When(
				"the OpenCode adapter requests evidence for the agent operator goal",
				async () => {
					const result = await runUdd(
						"opencode evidence --json --goal goals/018-agent-operator-upgrade.md",
					);
					evidence = JSON.parse(result.stdout);
				},
			);

			Then(
				"the evidence includes next work, user impact, blockers, and verification commands",
				() => {
					assertMatchesJsonSchema(
						evidence,
						sharedAgentPayloadSchema.$defs?.agentEvidencePackage ?? {},
						sharedAgentPayloadSchema,
					);
					expect(evidence.next_recommendation).toEqual(
						expect.objectContaining({
							recommended: expect.any(String),
							reason: expect.any(String),
							user_impact: expect.any(String),
							blocks_work: expect.any(Boolean),
							verification_commands: expect.any(Array),
						}),
					);
					expect(evidence.handoff).toEqual(
						expect.objectContaining({
							summary: expect.any(String),
							next_action: expect.any(String),
							verification_commands: expect.any(Array),
							blockers: expect.any(Array),
						}),
					);
				},
			);

			And(
				"the evidence includes proof status and explicit pause reasons",
				() => {
					expect(evidence.handoff.proof_status).toEqual(
						expect.objectContaining({
							health: expect.any(String),
							test_governance_gate: expect.any(String),
							verification_claims: "explicit-evidence-required",
						}),
					);
					expect(evidence.pause_reasons).toEqual(expect.any(Array));
					expect(evidence.handoff.review_required).toBe(
						evidence.pause_reasons.length > 0,
					);
					if (evidence.handoff.review_required) {
						expect(evidence.handoff.next_action).not.toBe(
							"Run the test to refresh UDD status.",
						);
						expect(evidence.handoff.next_action).toMatch(
							/Stub assertions|Unlinked test proof|Dirty review|review/i,
						);
					}
					expect(evidence.handoff.verification_commands).not.toContain(
						"npm test -- --run",
					);
					const agentIntegrationImpact = evidence.changed_file_impacts.find(
						(impact) => impact.path === "src/lib/agent-integration.ts",
					);
					if (agentIntegrationImpact) {
						expect(agentIntegrationImpact.recommended_commands).toContainEqual(
							expect.stringContaining("tests/lib/agent-integration.test.ts"),
						);
					}
				},
			);

			And(
				"the evidence stays adapter-neutral without Codex-only or OpenCode-only behavior",
				() => {
					expect(evidence).not.toHaveProperty("codex_hook");
					expect(evidence).not.toHaveProperty("goal_command");
					expect(evidence).not.toHaveProperty("adapter_commands");

					const serializedWithoutGit = JSON.stringify({
						...evidence,
						status_snapshot: {
							...evidence.status_snapshot,
							git: undefined,
						},
						changed_files: undefined,
						changed_file_impacts: undefined,
					});
					const commandLikeFields = [
						...(evidence.next_recommendation.verification_commands ?? []),
						...(evidence.next_recommendation.suggested_files ?? []).map(
							(file) => file.action ?? "",
						),
						...(evidence.verification ?? []).map((item) => item.command ?? ""),
						...evidence.handoff.verification_commands.map(String),
						...(evidence.review_notes ?? []),
					].join("\n");
					expect(serializedWithoutGit).not.toContain("install-codex");
					expect(serializedWithoutGit).not.toContain("chat history");
					expect(commandLikeFields).not.toContain("install-codex");
					expect(commandLikeFields).not.toContain("/goal");
				},
			);
		},
	);
});
