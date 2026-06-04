# Goal 018 Agent Operator Upgrade Review

Date: 2026-06-03
Branch: `codex/agent-operator-upgrade`
Goal: `goals/018-agent-operator-upgrade.md`

## User-Perspective Findings

### Agent Operator

Promise reviewed: "Let an agent choose useful UDD work, explain why it chose
it, and hand me evidence I can review."

Current upgrade coverage:

- `udd opencode next --json` includes `user_impact`, `blocks_work`,
  `verification_commands`, and `pause_reasons`.
- `udd opencode evidence --json --goal goals/018-agent-operator-upgrade.md`
  includes `handoff`, `pause_reasons`, changed-file impact, proof status, and
  adapter-neutral review notes.
- Handoff `next_action` prioritizes pause/review gates when proof governance is
  blocked.
- Handoff verification commands exclude not-run placeholders and keep only
  actionable commands from explicit evidence, next-work recommendations, or
  changed-file impact.
- Changed implementation and docs paths that are otherwise untraceable receive
  operator-specific fallback test recommendations.

Evidence excerpt:

```json
{
  "next": {
    "recommended": "udd/strategic-program/strategic_program_commands",
    "user_impact": "A current behavior changed or lacks fresh proof; rerun the targeted test before handoff.",
    "verification_commands": [
      "npm test -- --run tests/e2e/udd/strategic-program/strategic_program_commands.e2e.test.ts"
    ]
  },
  "handoff": {
    "test_governance_gate": "blocked",
    "review_required": true,
    "next_action": "Unlinked test proof: tests/e2e/opencode/integration/opencode.integration.test.ts"
  }
}
```

### Maintainer / Reviewer

The new `docs/agent-operator-contract.md` documents the shared contract for
Codex, OpenCode, and future adapters. It states that generated local state is
not proof and that adapters should preserve shared JSON shape rather than adding
adapter-only control fields.

### Test Governance Owner

Pause reasons normalize unresolved test-governance findings into reviewable
blockers. Evidence marks `proof_status.verification_claims` as
`explicit-evidence-required`, so agents do not claim proof from `.udd/results`
or chat history.

## Independent Review Follow-Up

Independent review by Faraday found four issues before PR packaging:

- Handoff said review was required but still selected the stale-test action as
  `next_action`.
- Changed-file impact for `src/lib/agent-integration.ts` and
  `docs/agent-operator-contract.md` only recommended `./bin/udd lint`.
- Handoff verification commands included the generic not-run placeholder
  `npm test -- --run`.
- E2E tests only asserted field shape and did not catch the above blockers.

Fixes made:

- Handoff `next_action` now chooses pause/review-gate action before ordinary
  next-work file actions.
- Operator implementation/docs fallbacks add focused tests to changed-file
  impact recommendations.
- Handoff commands filter supplied verification to `passed` or `failed` command
  evidence and exact output no longer includes bare `npm test -- --run`.
- E2E and unit tests now assert pause precedence, placeholder exclusion, and
  implementation fallback commands.

Gemini review then found a portability issue: operator fallback path matching
used direct POSIX string comparisons. The implementation now normalizes
backslashes before matching, and the unit test covers a Windows-style
`docs\\agent-operator-contract.md` changed path.

## Verification

Commands run:

```bash
./bin/udd status --json
./bin/udd lint
npx tsc --noEmit
npm test -- --run tests/e2e/opencode/tools/agent_handoff_evidence.e2e.test.ts tests/e2e/opencode/tools/next_recommendation.e2e.test.ts tests/lib/agent-integration.test.ts
npm test -- --run tests/e2e/opencode tests/e2e/udd/strategic-program
./bin/udd opencode next --json
./bin/udd opencode evidence --json --goal goals/018-agent-operator-upgrade.md
./bin/udd doctor --json
./bin/udd impact specs/use-cases/agent_customization.yml --json
```

Observed results:

- `udd status --json`: healthy, 0 blocking health issues.
- `udd lint`: pass.
- TypeScript: pass.
- Focused agent-operator tests: 3 files passed, 12 tests passed.
- Broad OpenCode and strategic-program tests: 9 files passed, 118 tests passed.
- `opencode next`: includes user impact and targeted verification command.
- `opencode evidence`: includes handoff proof status, pause reasons,
  actionable changed-file impact, and no exact bare `npm test -- --run` command.

## Reviewer Blocking Criteria Check

- Evidence does not rely on chat history or generated local proof.
- Next-work recommendation explains user impact.
- Codex/OpenCode behavior is represented through a shared adapter-neutral
  contract.
- Agents get explicit pause reasons for unresolved review gates and unverified
  test claims.
