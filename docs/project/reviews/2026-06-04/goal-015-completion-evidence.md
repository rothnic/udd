# Goal 015 Completion Evidence: Test Governance Upgrade

Date: 2026-06-04

Goal: `goals/015-test-governance-upgrade.md`

Branch: `codex/goal-015-test-governance-upgrade`

## User-Facing Outcome

Goal 015 turns test-governance from a summary-only signal into reviewable proof:

- `udd test-scan --json` now includes actionable `findings` with source
  references, not only aggregate counts.
- Six CLI E2E files that already proved behavior now link to their feature
  files, removing false `missing_proof` gaps.
- `specs/test-reviews.yml` records source-controlled clean review evidence for
  the current test-governance E2E suite.
- Strict and non-strict gates still behave differently: non-strict reports
  findings for adoption, strict fails on configured blocking findings.

## Baseline Before This Completion Slice

Current `master` before this branch reported:

```json
{
  "test_governance": {
    "total": 60,
    "linked": 46,
    "unlinked": 14,
    "orphaned": 0,
    "stubbed": 10,
    "reviewed": 0,
    "stale": 0,
    "missing": 6,
    "gate_blocking": 24
  }
}
```

The six missing proof entries were:

- `specs/features/udd/cli/codex_hooks.feature`
- `specs/features/udd/cli/init_edge_cases.feature`
- `specs/features/udd/cli/manifest_recovery.feature`
- `specs/features/udd/cli/orphan_detection.feature`
- `specs/features/udd/cli/status_edge_cases.feature`
- `specs/features/udd/cli/sync_edge_cases.feature`

Each had an existing E2E file, but those tests were not linked with `@feature`
comments, so users saw them as missing proof.

## Current Scope Inventory

Current canonical governance scenarios and E2E proof:

- `track_test_quality`: `test-scan`, `local-gate-validation`,
  `health-metrics`.
- `manage_test_lifecycle`: `test-review`, `test-status`,
  `local-gate-validation`.
- `enforce_quality_gates`: `quality-gate`, `local-gate-validation`.
- `monitor_test_health`: `health-metrics`, `test-status`.
- `prevent_regression`: `regression-detection`,
  `feature-change-detection`, `quality-gate`.

Journey-referenced future scope remains explicitly outside this goal:

- `test-linkage`: covered by current `test-scan`; no separate scenario needed
  until the workflow grows beyond inventory/link detection.
- `test-approval`, `hooks-installation`, `pre-commit-validation`,
  `ci-validation`, `status-integration`, `setup-health-check`: retained as
  future scope under `#55`.
- `dirty-marking`, `sync-dirty-marking`: retained for
  `goals/017-change-impact-and-regression-upgrade.md`.
- Historical flake analytics and pass-rate tracking: retained as future scope
  under `#55`.

## Current Command Evidence

Commands run on the branch:

```bash
./bin/udd status --json
./bin/udd test-scan --json
./bin/udd gate test-governance
./bin/udd gate test-governance --json
./bin/udd gate test-governance --strict
./bin/udd gate test-governance --strict --json
./bin/udd opencode evidence --json --goal goals/015-test-governance-upgrade.md
./bin/udd lint
npm test -- --run tests/e2e/udd/test-governance tests/lib/test-governance.test.ts
npm test -- --run tests/lib/agent-integration.test.ts tests/e2e/opencode/tools/agent_handoff_evidence.e2e.test.ts tests/e2e/udd/test-governance
npm run typecheck --if-present
```

Status and scan summary after this branch:

```json
{
  "test_governance": {
    "total": 60,
    "linked": 52,
    "unlinked": 8,
    "orphaned": 0,
    "stubbed": 10,
    "reviewed": 8,
    "stale": 0,
    "missing": 0,
    "gate_blocking": 18
  }
}
```

Scan finding classes:

```json
[
  {
    "type": "stubbed_test",
    "count": 10
  },
  {
    "type": "unlinked_test",
    "count": 8
  }
]
```

Example scan finding:

```json
{
  "type": "stubbed_test",
  "path": "tests/e2e/opencode/orchestration/configurable_iteration.e2e.test.ts",
  "message": "Stub assertions: tests/e2e/opencode/orchestration/configurable_iteration.e2e.test.ts",
  "gate_blocking": true,
  "source_references": {
    "test": "tests/e2e/opencode/orchestration/configurable_iteration.e2e.test.ts",
    "feature": "specs/features/opencode/orchestration/configurable_iteration.feature"
  }
}
```

Gate evidence:

```json
{
  "non_strict": {
    "passed": false,
    "blocking_count": 18
  },
  "strict": {
    "exit": "strict-expected-fail",
    "passed": false,
    "blocking_count": 18
  }
}
```

Agent evidence summary:

```json
{
  "test_governance": {
    "summary": {
      "total": 60,
      "linked": 52,
      "unlinked": 8,
      "orphaned": 0,
      "stubbed": 10,
      "reviewed": 8,
      "stale": 0,
      "missing": 0,
      "gate_blocking": 18
    },
    "review_manifest_issues": [],
    "missing_proof": [],
    "next_action": "Stub assertions: tests/e2e/opencode/orchestration/configurable_iteration.e2e.test.ts"
  },
  "handoff": {
    "next_action": "Stub assertions: tests/e2e/opencode/orchestration/configurable_iteration.e2e.test.ts",
    "health": "healthy",
    "test_governance_gate": "blocked",
    "verification_claims": "explicit-evidence-required"
  }
}
```

The governance and handoff next actions are intentionally the same. This gives
agent operators one canonical next governance action while preserving the full
`blocking_findings` list for secondary triage.

After PR review, critical pause reasons such as missing specs and unsafe repair
now outrank governance findings. The canonical governance next action still
converges when there is no higher-priority critical pause reason.

## Validation Results

```text
Biome changed-file check: passed.
TypeScript typecheck: passed.
Focused governance suite: 9 files passed (9), 52 tests passed (52).
Agent evidence regression suite: 10 files passed (10), 59 tests passed (59).
Post-review agent evidence focus: 2 files passed (2), 10 tests passed (10).
udd lint: All specs are valid.
Trace graph: 210 node(s), 235 edge(s), 16 diagnostic(s).
```

## Reviewer Blocking Checklist

- Governance behavior is represented by canonical use cases, feature files, and
  E2E tests.
- Known journey-referenced gaps are either current scenarios or listed as
  future scope above.
- Ignored local cache non-authority is covered by
  `local-gate-validation.e2e.test.ts` and `regression-detection.e2e.test.ts`.
- Strict and non-strict gate modes are both covered, including strict pass and
  strict fail fixtures.
- Status and agent evidence expose the next governance action with source paths.
