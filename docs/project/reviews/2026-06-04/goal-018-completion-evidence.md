# Goal 018 Completion Evidence: Agent Operator Upgrade

## Summary

Goal 018 is complete. Agent-facing next-work and evidence surfaces now use the
same shared UDD facts to explain review gates, proof status, blockers,
verification commands, changed-file impact, and pause reasons without relying on
chat history.

## User-Facing Upgrade

An agent operator can run `udd opencode next --json` or
`udd opencode evidence --json --goal <goal>` and get a reviewable handoff that:

- picks the first blocking proof-governance action before stale proof refresh;
- explains user impact and why the agent should pause;
- includes strict governance verification commands;
- keeps changed-file impact recommendations in handoff evidence;
- stays adapter-neutral with no Codex-only or OpenCode-only control fields.

## Implementation Evidence

- Updated `specs/features/opencode/tools/next_recommendation.feature` to state
  that review gates outrank stale proof refresh when they block handoff.
- Added governance-aware next-work ranking in `src/lib/agent-integration.ts`.
- Switched `udd opencode next` in `src/commands/opencode.ts` to use the shared
  governance-aware recommendation.
- Added unit proof in `tests/lib/agent-integration.test.ts`.
- Tightened `tests/e2e/opencode/tools/next_recommendation.e2e.test.ts` so the
  JSON surface proves pause/review gates are explicit.

## Command Evidence

### Live Next Recommendation

Command:

```bash
./bin/udd opencode next --json
```

Result:

- `recommended`: `tests/e2e/opencode/orchestration/configurable_iteration.e2e.test.ts`
- `reason`: `Stub assertions: tests/e2e/opencode/orchestration/configurable_iteration.e2e.test.ts`
- `user_impact`: proof governance blocks trustworthy agent handoff until review.
- `blocks_work`: `true`
- `verification_commands`:

```bash
./bin/udd test-scan --json
./bin/udd gate test-governance --strict --json
```

### Live Handoff Evidence

Command:

```bash
./bin/udd opencode evidence --json --goal goals/018-agent-operator-upgrade.md
```

Result:

- `next_recommendation` and `handoff.next_action` agree on the first governance
  blocker.
- `handoff.proof_status.test_governance_gate` is `blocked`.
- `handoff.review_required` is `true`.
- `pause_reasons` contains the first `unverified_test_claim` with a source path
  and next action.
- `handoff.verification_commands` includes strict governance commands, lint, and
  impacted changed-file proof commands.

### Status, Doctor, Impact, Lint

Commands:

```bash
./bin/udd status --json
./bin/udd doctor --json
./bin/udd impact specs/use-cases/run_tests.yml --json
./bin/udd lint
```

Results:

- Status health: 0 critical, 0 warning, 48 info.
- Test governance: 60 total, 52 linked, 8 unlinked, 0 stale, 0 missing, 18
  gate-blocking findings.
- Doctor: healthy, 0 critical, 0 warning, 48 info.
- Impact for `specs/use-cases/run_tests.yml` resolves objective `udd_tool`, use
  case `run_tests`, scenarios `udd/cli/run_tests` and `udd/cli/check_status`,
  and the two linked E2E tests.
- Lint: passed; trace graph has 232 nodes, 252 edges, and 28 diagnostics.

### Tests

Commands:

```bash
npm test -- --run tests/lib/agent-integration.test.ts tests/e2e/opencode/tools/next_recommendation.e2e.test.ts tests/e2e/opencode/tools/agent_handoff_evidence.e2e.test.ts
npm test -- --run tests/e2e/opencode tests/e2e/udd/strategic-program
npm run typecheck --if-present
```

Results:

- Focused agent tests: 3 files passed, 16 tests passed.
- Goal verification suite: 9 files passed, 119 tests passed.
- Typecheck: passed.

## Reviewer Blocking Criteria Check

- Evidence relies on shared UDD facts, not chat history or generated local
  proof: passed.
- Next-work recommendations explain user impact: passed.
- Codex/OpenCode behavior remains represented in the shared contract: passed.
- Agents pause on unresolved review gates and unverified proof claims: passed.

## Independent Review

Carver reviewed the branch before PR creation. Review scope covered whether
`opencode next` and `opencode evidence` agree on review-gated next work,
whether the JSON remains adapter-neutral, and whether the handoff is useful
without chat history.

Result: no findings.

Gemini Code Assist review posted one medium-priority cleanup after PR creation:
avoid wrapping the synchronous `recommendNextAgentWork` call in
`Promise.resolve` inside `Promise.all`.

Resolution: applied the cleanup and reran Biome, typecheck, and the focused
agent test suite.
