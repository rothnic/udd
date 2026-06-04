# Goal 016 Completion Evidence: Recovery Workflow Upgrade

Date: 2026-06-04

Goal: `goals/016-recovery-workflow-upgrade.md`

Branch: `codex/goal-016-recovery-workflow-upgrade`

## User-Facing Outcome

Goal 016 makes recovery a guided, reviewable workflow:

- `udd doctor --json` classifies healthy, partial, stale, corrupt, and drifted
  fixtures with stable issue types.
- `udd repair --dry-run --json` ranks safe writes, manual refusals, advisory
  discovery context, and aggregate `would_write` paths.
- `udd repair --apply --json` is proven only in temp-project fixtures and
  applies safe generated-state or directory repairs.
- Apply-mode evidence now explicitly proves report generation and final doctor
  validation for safe repairs.
- Behavior scenario files are not created or rewritten automatically.

## Current Scope Inventory

Current recovery promise is represented by canonical scenarios:

- `diagnose_project_health`: initialized, partial, stale, corrupt, and drifted
  fixture diagnostics.
- `plan_repair`: ranked dry-run evidence, safe proposals, and manual refusals.
- `apply_safe_repairs`: safe generated-state and missing-directory apply mode,
  durable evidence, and final validation in temp projects.
- `refuse_behavior_rewrites`: explicit refusal for missing behavior scenario
  rewrites.

The broader journey backlog/orchestration steps in
`product/journeys/recover-from-drift.md` remain optional discovery context until
future work implements interactive recovery queues, checkpointing, or external
tracking. Current product proof no longer depends on those missing
journey-referenced scenario files.

## Command Evidence

Commands run on this branch:

```bash
./bin/udd doctor --json
./bin/udd repair --dry-run --json
./bin/udd status --json
./bin/udd opencode evidence --json --goal goals/016-recovery-workflow-upgrade.md
npm test -- --run tests/e2e/udd/recovery
npm run typecheck --if-present
./bin/udd lint
```

Doctor summary:

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

Repair dry-run summary:

```json
{
  "mode": "dry-run",
  "proposed": 1,
  "refused": 0,
  "advisory": 28,
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

Status recovery summary:

```json
{
  "recovery": {
    "refuse_behavior_rewrites": {
      "e2e": "passing"
    },
    "plan_repair": {
      "e2e": "passing"
    },
    "diagnose_project_health": {
      "e2e": "passing"
    },
    "apply_safe_repairs": {
      "e2e": "passing"
    }
  },
  "recover_from_drift_outcomes": "all satisfied"
}
```

## Validation Results

```text
Recovery E2E: 4 files passed (4), 47 tests passed (47).
udd lint: All specs are valid.
Trace graph: 210 node(s), 235 edge(s), 16 diagnostic(s).
npm run typecheck --if-present: passed.
```

Apply-mode validation ran only inside temp-project fixtures:

- `tests/e2e/udd/recovery/apply_safe_repairs.e2e.test.ts`
- temp directories under the OS temp root
- no `udd repair --apply` command was run against the reviewer checkout

## Reviewer Blocking Checklist

- Apply mode does not rewrite or create user-authored behavior specs.
- Apply-mode verification runs only against controlled temp projects.
- Current recovery behavior is represented by canonical use cases, feature
  files, and E2E tests.
- Dry-run output includes ranked safe proposals, refusals, source issues,
  evidence markdown, and aggregate `would_write` predictions.
- Recovery evidence is durable through this review artifact and generated
  apply-mode evidence output.
