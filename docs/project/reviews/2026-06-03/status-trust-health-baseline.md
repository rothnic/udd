# Goal 014 Review: Status Trust And Health Baseline

Date: 2026-06-03

Goal: `goals/014-status-trust-and-health-baseline.md`

Base commit before this implementation:
`d4c4f6ab1c3314839568bc62244cc9d096796ace`

## Purpose

Review the Goal 014 implementation from user and software-engineering
perspectives before PR creation.

## Baseline Before This Goal

The user-gap review at
`docs/project/reviews/2026-06-02/user-gap-upgrade-review.md` captured the
fresh-checkout baseline at remote head
`34773dbac1b63d489ce04abd322e5083c2b52325`:

- `udd doctor --json`: `drift-detected`, `healthy: false`, 1 critical issue,
  34 warnings, total 35 issues.
- `udd status --json`: 38 stale scenarios.
- `udd opencode evidence --json --goal goals/000-strategic-execution-master-goal.md`:
  goal status `blocked`, next recommendation `specs/.udd/manifest.yml`.

After PR #68 merged the upgrade pipeline, the local baseline for Goal 014 was:

- `udd doctor --json`: `drift-detected`, `healthy: false`, 0 critical issues,
  20 warnings, 34 info findings, total 54 issues.
- The remaining warnings came from optional journey metadata drift.

## What Changed

- Generated manifest absence is advisory `info` when source-controlled specs are
  otherwise valid.
- Stale journey hashes are advisory `info`.
- Journey-only references to missing scenario files are advisory `info`.
- Health is now `healthy: true` when there are no critical or warning issues,
  even if advisory info findings remain.
- `udd status --json` now includes a compact `health` object with
  `summary`, `advisory_count`, and `blocking_count`.
- Agent evidence now ranks current user-visible proof work before generated
  state cleanup when there are no blocking diagnostics.
- Recovery documentation explains generated state, optional discovery drift,
  blocking diagnostics, and safe apply-mode expectations.

## Evidence After This Goal

Commands run locally on branch `codex/status-trust-health-baseline`:

```bash
./bin/udd doctor --json > /tmp/udd-goal014-doctor.json
./bin/udd status --json > /tmp/udd-goal014-status.json
./bin/udd repair --dry-run --json > /tmp/udd-goal014-repair.json
./bin/udd opencode evidence --json --goal goals/014-status-trust-and-health-baseline.md > /tmp/udd-goal014-evidence.json
./bin/udd status --doctor > /tmp/udd-goal014-status-doctor.txt
./bin/udd lint
npx tsc --noEmit
npm test -- --run tests/e2e/udd/recovery/diagnose_project_health.e2e.test.ts
npm test -- --run tests/lib/agent-integration.test.ts
npm test -- --run tests/e2e/udd/strategic-program/strategic_program_commands.e2e.test.ts
```

All commands exited successfully. The `/tmp/udd-goal014-*` files were temporary
local evidence captures used to build the durable excerpts below.

Review-critical output excerpts:

```json
{
  "doctor": {
    "status": "healthy",
    "healthy": true,
    "summary": {
      "critical": 0,
      "warning": 0,
      "info": 54,
      "total": 54
    },
    "conditions": [
      {
        "id": "journey_sync",
        "status": "ok",
        "message": "Only advisory journey metadata drift detected.",
        "file": "product/journeys"
      },
      {
        "id": "scenario_links",
        "status": "ok",
        "message": "Only advisory journey-linked missing scenarios detected.",
        "file": "specs/features"
      }
    ]
  },
  "statusHealth": {
    "status": "healthy",
    "healthy": true,
    "summary": {
      "critical": 0,
      "warning": 0,
      "info": 54,
      "total": 54
    },
    "advisory_count": 54,
    "blocking_count": 0
  },
  "evidence": {
    "goal": {
      "path": "goals/014-status-trust-and-health-baseline.md",
      "status": "in_progress"
    },
    "issues": {
      "critical": 0,
      "warning": 0,
      "info": 54,
      "total": 54
    },
    "next": {
      "recommended": "udd/strategic-program/strategic_program_commands",
      "reason": "Current-phase scenario result is stale.",
      "blocking": []
    }
  }
}
```

`udd status --doctor` excerpt:

```text
✓ No issues found - project is healthy!
54 advisory item(s) found; these do not block normal work.
```

Test results:

- Recovery E2E: 1 test file passed, 43 tests passed.
- Agent integration unit regression: warning-level diagnostics block agent
  recommendations before stale scenario work.
- Strategic-program E2E: 1 test file passed, 6 tests passed.
- `udd lint`: `All specs are valid`.
- `npx tsc --noEmit`: passed.

## User-Perspective Review

Passes:

- A maintainer can now run doctor/status and see that optional discovery drift is
  advisory instead of blocking.
- A fresh valid project without generated manifest state is classified as
  healthy while still surfacing advisory metadata refresh work.
- Agent evidence no longer treats generated metadata as the first blocker when
  canonical specs are valid.

Remaining user-visible limits:

- Status can still report stale test result state until targeted tests are run.
  That is expected for Goal 014 because stale test governance is handled by
  later goals.
- Advisory counts can be high. The output now classifies them correctly, but
  later goals should reduce or route them further.

## Software-Engineering Review

Passes:

- The change is narrowly scoped to classification, JSON output, docs, and
  matching E2E scenarios.
- Blocking conditions remain blocking for missing source directories, corrupt
  manifests, manifest references to deleted files, and orphaned canonical
  scenarios.
- Apply-mode repair proof remains in controlled tests, not in the reviewer
  checkout.

Risks to watch:

- Consumers that assumed `healthy === issues.length === 0` must now use
  `summary.critical + summary.warning` for blocking health. This is intentional
  and documented.
- `status --json` gained a `health` object; this is additive and should not
  break consumers that ignore unknown fields.

## Blocking Concerns

No blocker remains for the Goal 014 PR based on the local evidence above.
