# Goal 010 Completion Evidence

Goal: `goals/010-shared-agent-execution-control-plane.md`
Branch: `codex/goal-010-agent-control-plane`
Date: 2026-06-04

## User-Facing Result

UDD now has reviewable shared agent-control evidence for status, next-work
routing, diagnostic issue listing, and handoff packages. OpenCode remains a
dogfooded adapter surface, while shared behavior is documented under the agent
operator and shared evidence contracts. Codex hook guidance remains scoped to
the PR #46 installer path and does not define source-controlled goal-command
behavior.

## Scope Completed

- Shared command surfaces: `udd opencode status --json`, `next --json`,
  `issues --json`, and `evidence --json`.
- Adapter-neutral handoff evidence includes next work, user impact, blockers,
  proof status, verification commands, pause reasons, and changed-file impact
  recommendations.
- Root-local OpenCode state is classified in
  `integrations/opencode/root-local-audit.md`.
- Shared JSON shape and failure modes are documented in
  `integrations/shared/evidence-contract.md` and enforced by
  `integrations/shared/agent-payload.schema.json`.
- Agent noisy-status guidance is documented in
  `docs/agent-operator-contract.md`.
- E2E assertions now validate the shared payload schema and distinguish
  adapter-specific command contracts from ordinary project metadata such as Git
  branch names or goal-document paths.

## Command Evidence

### `./bin/udd opencode status --json`

Captured through `jq`:

```json
{
  "project": "udd",
  "phase": {
    "current": 3,
    "name": "Agent Integration"
  },
  "health": {
    "critical": 0,
    "warning": 0,
    "info": 48,
    "total": 48
  },
  "scenarios": {
    "total": 42,
    "passing": 4,
    "failing": 0,
    "missing": 0,
    "stale": 38,
    "deferred": 0
  }
}
```

The command also reported the dirty Goal 010 branch state, which is expected
while this evidence file and related docs/tests are uncommitted.

### `./bin/udd opencode next --json`

```json
{
  "recommended": "udd/strategic-program/strategic_program_commands",
  "reason": "Current-phase scenario result is stale.",
  "user_impact": "A current behavior changed or lacks fresh proof; rerun the targeted test before handoff.",
  "blocks_work": false,
  "verification_commands": [
    "npm test -- --run tests/e2e/udd/strategic-program/strategic_program_commands.e2e.test.ts"
  ]
}
```

### `./bin/udd opencode issues --json`

```json
{
  "status": "healthy",
  "healthy": true,
  "summary": {
    "critical": 0,
    "warning": 0,
    "info": 48,
    "total": 48
  },
  "issue_count": 48
}
```

### `./bin/udd opencode evidence --json --goal goals/010-shared-agent-execution-control-plane.md`

The evidence package included all ten changed files and produced impact
recommendations for the edited shared-contract docs and adapter-neutral tests.
It also correctly reported `handoff.proof_status.test_governance_gate` as
`blocked` because the repository still has broader stub/unlinked test-governance
findings. Those findings are carried forward to the test-governance/recovery
upgrade goals rather than hidden by Goal 010.

### `./bin/udd lint`

```text
All specs are valid
Trace graph: 210 node(s), 227 edge(s), 28 diagnostic(s)
```

### Focused Tests

```text
npm test -- --run tests/e2e/opencode/tools/status_deep.e2e.test.ts tests/e2e/opencode/tools/next_recommendation.e2e.test.ts tests/e2e/opencode/tools/issues_list.e2e.test.ts tests/e2e/opencode/tools/agent_handoff_evidence.e2e.test.ts tests/lib/agent-integration.test.ts tests/lib/opencode.test.ts
```

Result:

```text
Test Files  6 passed (6)
Tests       19 passed (19)
```

### Schema/Format Check

```text
npx biome check tests/utils.ts tests/e2e/opencode/tools/status_deep.e2e.test.ts tests/e2e/opencode/tools/agent_handoff_evidence.e2e.test.ts integrations/shared/agent-payload.schema.json
```

Result:

```text
Checked 4 files in 10ms. No fixes applied.
```

### Typecheck

```text
npm run typecheck --if-present
```

Result: exited successfully with no output.

## Residual Risks

- The test-governance gate remains blocked by known repository-wide stub and
  unlinked proof findings. Goal 010 does not claim those are resolved.
- Optional discovery drift remains informational in status/doctor output. Goal
  014 owns the remaining status-trust and health-baseline cleanup.
- Orchestration integration tests that require a real OpenCode server remain
  outside the default local verification path.

## Reviewer Blocking Criteria

Block this goal if:

- Shared payloads contain Codex hook installer fields, OpenCode slash-command
  definitions, or goal-command shortcuts.
- A new root-local OpenCode file lacks classification in the audit document.
- The Goal 010 evidence hides the current blocked test-governance gate.
- The adapter-neutral E2E tests fail on a branch name containing `/goal`.
