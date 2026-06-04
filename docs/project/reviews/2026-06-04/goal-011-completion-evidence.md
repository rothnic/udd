# Goal 011 Completion Evidence

Goal: `goals/011-recovery-doctor-and-remediation-suite.md`
Branch: `codex/goal-011-recovery-doctor-remediation`
Date: 2026-06-04

## User-Facing Result

UDD now has a recovery suite that lets a contributor or agent diagnose partial,
drifted, stale, and malformed projects, preview safe repairs without writing
files, apply only explicit reversible repairs, and preserve refusal evidence
when recovery would require rewriting user-authored behavior specs.

## Scope Completed

- Doctor and health-check classify initialized, partial, stale, corrupt,
  deleted-reference, malformed-manifest, null-manifest-entry, and punctuation
  edge-case projects.
- Repair dry-run ranks safe actions, records would-write paths, and refuses
  unsafe behavior rewrites without mutating files.
- Repair apply writes only safe generated-state/directory repairs and emits
  reviewer-visible evidence.
- Missing-directory apply proof covers `product/journeys` creation without
  creating behavior scenario files.
- Recovery use cases and scenarios are current source-of-truth coverage under
  `specs/use-cases/recover_from_drift.yml` and `specs/features/udd/recovery/`.

## Command Evidence

### `./bin/udd doctor --json`

Captured through `jq`:

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
  "condition_count": 10,
  "issue_types": [
    "journey_stale",
    "missing_scenario"
  ]
}
```

This satisfies the goal requirement for at least 8 classified health
conditions; current live output reports 10.

### `./bin/udd repair --dry-run --json`

Captured through `jq`:

```json
{
  "mode": "dry-run",
  "proposed": 1,
  "advisory": 28,
  "refused": 0,
  "applied": 0,
  "would_write": [
    "specs/.udd/manifest.yml",
    "docs/project/reviews/repair/latest-repair-evidence.md"
  ],
  "evidence": {
    "path": "docs/project/reviews/repair/latest-repair-evidence.md",
    "written": false
  }
}
```

Dry-run did not write repair evidence and did not apply actions.

### Focused Tests

```text
npm test -- --run tests/e2e/udd/recovery/diagnose_project_health.e2e.test.ts tests/e2e/udd/recovery/plan_repair.e2e.test.ts tests/e2e/udd/recovery/apply_safe_repairs.e2e.test.ts tests/e2e/udd/recovery/refuse_behavior_rewrites.e2e.test.ts tests/e2e/udd/strategic-program/strategic_program_commands.e2e.test.ts
```

Result:

```text
Test Files  5 passed (5)
Tests       53 passed (53)
```

Covered proof includes:

- `udd doctor --json` and `udd health-check --json` for initialized, partial,
  stale, missing-reference, malformed, null-entry, and punctuation cases.
- `udd repair --dry-run --json` with ranked safe actions, manual refusals, and
  no mutation.
- `udd repair --apply --json` in a temp project, proving safe manifest refresh
  and missing expected directory creation with evidence write, without creating
  missing behavior scenario files.
- Strategic-program smoke proof that doctor/repair behavior is available from
  the current command surface.

### `./bin/udd lint`

```text
All specs are valid
Trace graph: 210 node(s), 227 edge(s), 29 diagnostic(s)
```

## Residual Risks

- The live repository still has 48 informational optional-discovery issues and
  broader test-governance blockers. Goal 011 does not claim to resolve those.
- `repair --apply` was only run in temp-project tests, not against the real
  workspace, to avoid intentional mutation of generated state in this branch.
- Recovery evidence writes to `docs/project/reviews/repair/latest-repair-evidence.md`
  inside the target project; future goals may make that path date-scoped.

## Reviewer Blocking Criteria

Block this goal if:

- Dry-run mutates files or marks evidence as written.
- Apply mode creates missing behavior scenario files.
- Doctor/health-check output lacks file/path evidence for drift conditions.
- The completion claim hides informational drift or test-governance blockers.
