# Goal 016: Recovery Workflow Upgrade

## Agent Entry

Convert recovery from broad drift detection into a guided, source-controlled
workflow. A user with a messy UDD project should get a safe diagnosis, a ranked
repair plan, and explicit refusal for behavior-spec changes that need review.

## Timebox and Team Shape

- Target duration: 2 engineering weeks.
- Suggested team: 3-5 engineers across diagnostics, repair planning, CLI, test
  fixtures, and docs.
- Primary users: developers and agents inheriting partial, stale, or drifted UDD
  projects.

## Objective

Turn recovery journey drift into canonical use-case, scenario, and E2E coverage
for diagnosing, planning, applying safe repairs, and reporting unresolved manual
work.

## User-Facing Promise

> "This UDD project is messy. Tell me what is broken, safely fix what you can,
> and leave behavior decisions for review."

## Scope

- Canonical scenarios for partial initialization, missing generated state,
  stale manifests, broken scenario links, missing scenarios, and unsafe behavior
  spec rewrites.
- Dry-run and apply-mode repair plans with source references.
- A recovery backlog or evidence report that ranks manual work without silently
  creating behavior specs.
- Fixture coverage for healthy, partial, stale, corrupt, and mixed-version
  projects.

## Non-Goals

- Fully autonomous recovery of user-authored behavior contracts.
- Broad Beads workflow implementation beyond recovery backlog/evidence needs.
- External issue tracker integration.
- Repairing unrelated repository hygiene.

## Measurables

- Recovery use cases no longer depend on 14 missing journey-referenced scenario
  files for the current product promise.
- `udd doctor --json` classifies initialized, partial, stale, corrupt, and
  drifted fixtures with stable issue types.
- `udd repair --dry-run --json` produces ranked safe actions and manual-review
  refusals.
- `udd repair --apply --json` applies only safe reversible repairs in fixtures.
- Recovery evidence is reviewable from source-controlled docs or generated
  command output attached to a review artifact.

## Tasks

- [ ] Update recovery use cases and scenarios before implementation.
- [ ] Decide which existing recovery journey steps are current scope, future
      scope, or optional discovery context.
- [ ] Add canonical scenarios for diagnose, plan, safe apply, manual refusal,
      final validation, and report generation.
- [ ] Add fixtures for healthy, partial, stale, corrupt, and mixed-version
      projects.
- [ ] Implement or refine recovery issue ranking.
- [ ] Add dry-run evidence that explains every proposed and refused action.
- [ ] Add apply-mode tests for safe generated-state and directory repairs.
- [ ] Add refusal tests proving behavior specs are not rewritten automatically.
- [ ] Update docs and agent evidence guidance for recovery handoff.
- [ ] Record an independent user-perspective review.

## Definition of Done

- A user can run doctor and repair commands on representative drift fixtures and
  understand what will change before anything is written.
- Safe repairs are applied only when reversible and explicit.
- Manual behavior-spec decisions are reported as review work, not guessed.

## Verification Commands

```bash
./bin/udd doctor --json
./bin/udd repair --dry-run --json
# Run apply-mode only against controlled fixture or temp-project copies.
# Do not run apply mode against the reviewer checkout as the proof command.
npm test -- --run tests/e2e/udd/recovery
./bin/udd status --json
./bin/udd lint
```

## Reviewer Blocking Criteria

- Blocks if repair apply mode rewrites user-authored behavior specs.
- Blocks if apply-mode verification runs against the real reviewer checkout
  instead of controlled fixtures or temp-project copies.
- Blocks if current recovery behavior remains represented mainly by missing
  journey scenario references.
- Blocks if dry-run output cannot be used to predict apply-mode changes.
- Blocks if recovery evidence is not durable enough for PR review.
