# Goal 014 Completion Evidence: Status Trust and Health Baseline

Date: 2026-06-04

Goal: `goals/014-status-trust-and-health-baseline.md`

Branch: `codex/goal-014-status-trust-health`

## User-Facing Outcome

Goal 014 makes the first-run health story trustworthy for maintainers,
reviewers, and agents. A healthy source-controlled project can now be cloned
and checked without reporting optional generated manifest state as a critical
product-health blocker.

## Baseline Before the Upgrade Pipeline

The user-gap review at
`docs/project/reviews/2026-06-02/user-gap-upgrade-review.md` captured remote
head `34773dbac1b63d489ce04abd322e5083c2b52325` with the core contradiction
that motivated this goal:

- `udd doctor --json`: `drift-detected`, `healthy: false`, 1 critical issue,
  34 warnings, total 35 issues.
- `udd status --json`: 38 stale scenarios.
- `udd opencode evidence --json --goal goals/000-strategic-execution-master-goal.md`:
  goal status `blocked`, next recommendation `specs/.udd/manifest.yml`.

The user-visible friction was that a strategic program could look proved while
default health commands still directed users toward generated-state cleanup as
if it were a product-proof blocker.

## Current Fresh-Checkout Evidence

Validated in a fresh shallow checkout of current remote `master` at
`aa5b429f095b682c95cdd09c57e66ea1f5cbbe61`:

```bash
git clone --depth 1 https://github.com/rothnic/udd.git /tmp/udd-goal014-fresh-sXaL1A
cd /tmp/udd-goal014-fresh-sXaL1A
npm ci
./bin/udd doctor --json
./bin/udd status --json
./bin/udd repair --dry-run --json
./bin/udd opencode evidence --json --goal goals/014-status-trust-and-health-baseline.md
./bin/udd lint
```

Fresh `doctor` summary:

```json
{
  "status": "healthy",
  "healthy": true,
  "summary": {
    "critical": 0,
    "warning": 0,
    "info": 29,
    "total": 29
  },
  "issue_types": [
    "manifest_missing",
    "missing_scenario"
  ]
}
```

Fresh `status` health summary:

```json
{
  "health": {
    "status": "healthy",
    "healthy": true,
    "summary": {
      "critical": 0,
      "warning": 0,
      "info": 29,
      "total": 29
    },
    "advisory_count": 29,
    "blocking_count": 0
  },
  "current_phase": 3
}
```

Fresh `repair --dry-run` summary:

```json
{
  "mode": "dry-run",
  "proposed": 1,
  "advisory": 28,
  "refused": 0,
  "applied": 0,
  "evidence": {
    "path": "docs/project/reviews/repair/latest-repair-evidence.md",
    "written": false
  },
  "would_write": [
    "specs/.udd/manifest.yml",
    "docs/project/reviews/repair/latest-repair-evidence.md"
  ]
}
```

Fresh agent evidence summary:

```json
{
  "goal": {
    "path": "goals/014-status-trust-and-health-baseline.md",
    "status": "in_progress"
  },
  "issues": {
    "critical": 0,
    "warning": 0,
    "info": 29,
    "total": 29
  },
  "next": {
    "recommended": "udd/strategic-program/strategic_program_commands",
    "reason": "Current-phase scenario result is stale.",
    "blocking": 0,
    "verification_commands": [
      "npm test -- --run tests/e2e/udd/strategic-program/strategic_program_commands.e2e.test.ts"
    ]
  },
  "handoff": {
    "health": "healthy",
    "test_governance_gate": "blocked",
    "verification_claims": "explicit-evidence-required"
  }
}
```

Fresh `udd lint` passed:

```text
All specs are valid
Trace graph: 210 node(s), 229 edge(s), 74 diagnostic(s)
```

## Current Working-Branch Evidence

Commands run on `codex/goal-014-status-trust-health`:

```bash
./bin/udd doctor --json
./bin/udd status --json
./bin/udd repair --dry-run --json
./bin/udd opencode evidence --json --goal goals/014-status-trust-and-health-baseline.md
./bin/udd lint
npm test -- --run tests/e2e/udd/recovery/diagnose_project_health.e2e.test.ts tests/lib/agent-integration.test.ts tests/e2e/udd/strategic-program/strategic_program_commands.e2e.test.ts
npm run typecheck --if-present
```

Working-branch `doctor` summary:

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
  "issue_types": [
    "journey_stale",
    "missing_scenario"
  ]
}
```

Working-branch `status` health summary:

```json
{
  "health": {
    "status": "healthy",
    "healthy": true,
    "summary": {
      "critical": 0,
      "warning": 0,
      "info": 48,
      "total": 48
    },
    "advisory_count": 48,
    "blocking_count": 0
  },
  "current_phase": 3,
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

Working-branch `repair --dry-run` summary:

```json
{
  "mode": "dry-run",
  "proposed": 1,
  "advisory": 28,
  "refused": 0,
  "applied": 0,
  "evidence": {
    "path": "docs/project/reviews/repair/latest-repair-evidence.md",
    "written": false
  },
  "would_write": [
    "specs/.udd/manifest.yml",
    "docs/project/reviews/repair/latest-repair-evidence.md"
  ]
}
```

Working-branch agent evidence summary:

```json
{
  "goal": {
    "path": "goals/014-status-trust-and-health-baseline.md",
    "status": "in_progress"
  },
  "issues": {
    "critical": 0,
    "warning": 0,
    "info": 48,
    "total": 48
  },
  "next": {
    "recommended": "udd/reference-rebuild/task_board_rebuild",
    "reason": "Current-phase scenario result is stale.",
    "blocking": 0,
    "verification_commands": [
      "npm test -- --run tests/e2e/udd/reference-rebuild/task_board_rebuild.e2e.test.ts"
    ]
  },
  "handoff": {
    "health": "healthy",
    "test_governance_gate": "blocked",
    "verification_claims": "explicit-evidence-required"
  }
}
```

The exact stale scenario selected by agent evidence can move as local
`.udd/results.json` changes during verification. The Goal 014 proof is the
stable classification: `blocking` is `0`, health is `healthy`, and the
recommendation points at user-visible stale proof rather than generated-state
cleanup such as `specs/.udd/manifest.yml`.

Working-branch validation passed:

```text
All specs are valid
Trace graph: 210 node(s), 229 edge(s), 28 diagnostic(s)

Test Files  3 passed (3)
Tests       53 passed (53)
```

`npm run typecheck --if-present` exited successfully.

## Review Notes

This goal intentionally does not remove every advisory item. It changes the
classification so optional discovery drift and generated state are visible
without blocking normal work or obscuring real source-controlled proof.

The remaining `test_governance_gate: blocked` signal is expected and belongs to
Goal 015, which covers missing governance flows and strict/non-strict gate
proof.

## Reviewer Blocking Checklist

- Clean valid checkout does not report missing generated manifest state as a
  critical product-health issue.
- Optional journey drift is classified as advisory and is distinguishable from
  canonical source-of-truth failure.
- Agent evidence recommends user-visible current-phase proof before generated
  state cleanup.
- Fresh-checkout evidence is recorded in this artifact.
