# Goal 016 Recovery Workflow Upgrade Review

Date: 2026-06-03
Branch: `codex/recovery-workflow-upgrade`
Goal: `goals/016-recovery-workflow-upgrade.md`

## User-Perspective Findings

### Recovery User

Promise reviewed: "This UDD project is messy. Tell me what is broken, safely
fix what you can, and leave behavior decisions for review."

Current upgrade coverage:

- `udd doctor --json` classifies healthy, partial, stale, corrupt, and drifted
  fixtures with stable issue types.
- `udd repair --dry-run --json` returns ranked safe actions, unsafe manual
  refusals, advisory optional discovery context, and aggregate `would_write`
  predictions without writing evidence.
- `udd repair --apply --json` applies only safe reversible repairs in temp
  project fixtures and writes durable repair evidence.
- Missing behavior scenarios are refused as manual work and are not created by
  apply mode.

### Maintainer / Reviewer

Recovery is now represented by canonical source-controlled scenarios instead of
being inferred from missing journey references:

- `specs/features/udd/recovery/diagnose_project_health.feature`
- `specs/features/udd/recovery/plan_repair.feature`
- `specs/features/udd/recovery/apply_safe_repairs.feature`
- `specs/features/udd/recovery/refuse_behavior_rewrites.feature`

Matching E2E proof:

- `tests/e2e/udd/recovery/diagnose_project_health.e2e.test.ts`
- `tests/e2e/udd/recovery/plan_repair.e2e.test.ts`
- `tests/e2e/udd/recovery/apply_safe_repairs.e2e.test.ts`
- `tests/e2e/udd/recovery/refuse_behavior_rewrites.e2e.test.ts`

Status evidence from this branch:

```json
{
  "recovery": {
    "scenarios": {
      "refuse_behavior_rewrites": { "e2e": "passing" },
      "plan_repair": { "e2e": "passing" },
      "diagnose_project_health": { "e2e": "passing" },
      "apply_safe_repairs": { "e2e": "passing" }
    }
  },
  "recover_from_drift_outcomes": "all satisfied"
}
```

### Agent Operator

Dry-run evidence is reviewable without applying writes:

```json
{
  "mode": "dry-run",
  "proposed": 1,
  "refused": 0,
  "advisory": 29,
  "would_write": [
    "specs/.udd/manifest.yml",
    "docs/project/reviews/repair/latest-repair-evidence.md"
  ],
  "firstProposed": {
    "kind": "refresh_manifest",
    "safe": true,
    "reversible": true,
    "path": "specs/.udd/manifest.yml",
    "would_write": ["specs/.udd/manifest.yml"],
    "source_issues": "20 journey_stale advisory sources",
    "rank": 30
  },
  "firstAdvisory": {
    "kind": "manual",
    "safe": false,
    "path": "specs/features/udd/beads/concept.feature",
    "source_issue": {
      "type": "missing_scenario",
      "severity": "info"
    },
    "rank": 80
  }
}
```

## Independent Review Response

Review agent `Ampere` found three blockers before PR publication:

- Apply-mode manifest refresh could promote optional journey-linked missing
  scenarios into manifest-referenced warning issues. Manifest refresh now writes
  only existing scenario files, and apply-mode E2E verifies post-apply doctor
  health remains healthy.
- Dry-run did not predict the apply evidence write path. Repair reports now
  include aggregate `would_write`, including
  `docs/project/reviews/repair/latest-repair-evidence.md`.
- Repair output was still dominated by optional missing journey scenarios.
  Advisory journey-linked missing scenarios now appear in `advisory`, while
  `refused` is reserved for unsafe current repair work such as
  manifest-referenced missing behavior scenarios.

## Safety Review

Apply-mode proof runs only against temp projects. The apply scenario verifies:

- safe generated manifest refresh is applied,
- repair evidence is written,
- missing behavior scenario files are not created,
- unsafe behavior decisions remain in `refused`.

The branch does not run `udd repair --apply` against the reviewer checkout.

## Verification

Commands run:

```bash
./bin/udd lint
npx tsc --noEmit
npm test -- --run tests/e2e/udd/recovery
./bin/udd doctor --json
./bin/udd repair --dry-run --json
./bin/udd status --json
```

Observed results:

- `udd lint`: pass.
- TypeScript: pass.
- Recovery E2E: 4 files passed, 46 tests passed.
- `udd doctor --json`: healthy with 49 advisory info issues and zero blocking
  issues on the branch checkout.
- `udd repair --dry-run --json`: one deduped safe manifest refresh proposal,
  zero current repair refusals, 29 advisory optional discovery items, and
  aggregate apply-mode write predictions on the branch checkout.
- `udd status --json`: all current `recover_from_drift` outcomes satisfied.

## Reviewer Blocking Criteria Check

- Apply mode does not rewrite user-authored behavior specs.
- Apply-mode verification runs only against temp-project fixtures.
- Current recovery behavior is represented by canonical scenarios and E2E proof.
- Dry-run output includes ranks, source issues, and `would_write` predictions.
- Recovery evidence is durable in this review artifact and apply-mode evidence
  output.
