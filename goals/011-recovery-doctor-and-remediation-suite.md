# Goal 011: Recovery, Doctor, and Remediation Suite

## Agent Entry

Move UDD from diagnostics-only recovery toward safe, reviewable remediation for
partial, drifted, and inconsistent projects.

## Timebox and Team Shape

- Target duration: 2 engineering weeks.
- Suggested team: 4-6 engineers across CLI, fixtures, tests, docs, and agent
  workflows.
- Primary users: developers and agents inheriting broken or partially initialized
  UDD projects.

## Objective

Provide a doctor/remediation suite that diagnoses project health, explains
repair options, applies safe fixes only when requested, and records enough
evidence for reviewers to trust the result.

## Scope

- Expanded health diagnostics for initialized, partial, drifted, and migrated
  projects.
- Dry-run remediation plans.
- Safe opt-in fixes for missing directories, broken links, stale manifests, and
  invalid generated artifacts.
- Human-readable and JSON output for agents.

## Non-Goals

- Silent automatic mutation.
- Rewriting user-authored specs without review.
- Repairing unrelated package/tooling policy.
- Installing external services.

## Measurables

- `udd doctor --json` classifies at least 8 project health conditions.
- `udd repair --dry-run` lists proposed changes without writing files.
- `udd repair --apply` only performs explicitly safe, reversible fixes.
- Drift fixtures cover initialized, missing, stale, corrupt, and mixed-version
  projects.
- Every applied repair emits reviewer-visible evidence.

## Completion Evidence

- Evidence artifact:
  `docs/project/reviews/2026-06-04/goal-011-completion-evidence.md`
- Implementation PR: pending.
- Focused verification passed across doctor, dry-run repair, apply-mode repair,
  behavior rewrite refusal, and strategic-program command smoke tests.

## Tasks

- [x] Update use cases, feature scenarios, and failing E2E tests for doctor,
      dry-run repair, and apply-mode repair behavior before implementation.
- [x] Inventory current doctor and health diagnostics.
- [x] Define project health condition taxonomy.
- [x] Add fixtures for initialized and partially initialized projects.
- [x] Add fixtures for stale manifests and broken scenario links.
- [x] Add fixtures for invalid generated or local state.
- [x] Implement dry-run remediation planning.
- [x] Implement safe repair for missing expected directories.
- [x] Implement safe repair for stale generated manifests.
- [x] Implement link repair suggestions without rewriting behavior specs.
- [x] Add JSON output for doctor and repair commands.
- [x] Add human-readable summaries with file references.
- [x] Add tests proving dry-run does not mutate files.
- [x] Add tests proving apply mode only performs approved repairs.

## Definition of Done

- A contributor can diagnose a broken UDD project and see what is safe to repair.
- Repair commands never silently rewrite source-of-truth behavior.
- Agents can use JSON output to decide whether to continue, pause, or ask for
  human review.

## Verification Commands

```bash
./bin/udd doctor --json
./bin/udd repair --dry-run
./bin/udd lint
npm test -- --run
```

## Reviewer Blocking Criteria

- Blocks if repair commands mutate files without explicit apply mode.
- Blocks if user-authored behavior specs are rewritten automatically.
- Blocks if diagnostics lack enough file/path evidence for review.
- Blocks if fixtures do not cover failed and partial project states.
