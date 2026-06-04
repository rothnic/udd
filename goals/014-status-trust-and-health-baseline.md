# Goal 014: Status Trust and Health Baseline

## Agent Entry

Make the first-run health story trustworthy. A fresh checkout of a healthy UDD
project must not look blocked because optional generated state is absent or
because discovery-context drift is reported as canonical product failure.

## Timebox and Team Shape

- Target duration: 2 engineering weeks.
- Suggested team: 2-4 engineers across CLI diagnostics, trace/status models,
  tests, and docs.
- Primary users: maintainers, reviewers, and agents deciding whether a project
  is safe to work on.

## Objective

Align `udd status`, `udd doctor`, `udd repair`, and agent evidence so they tell
the same story about healthy source-controlled proof, optional discovery drift,
generated local state, and real blockers.

## User-Facing Promise

> "Tell me whether this project is actually healthy, and do not scare me with
> generated-state or optional-discovery warnings unless they matter."

## Scope

- Status and doctor classification for generated manifests, stale journeys,
  stale scenario result state, and source-controlled proof.
- Clear separation of canonical source-of-truth blockers from optional
  discovery drift.
- Repair dry-run output that ranks safe generated-state refresh separately from
  user-authored behavior-spec work.
- Agent evidence updates so next-work recommendations do not over-prioritize
  generated state when product proof is otherwise sound.

## Non-Goals

- Implementing missing test-governance scenarios.
- Broad journey migration.
- Rewriting goals 007-012.
- Automatically changing user-authored behavior specs.

## Measurables

- Fresh checkout of remote `master` after this goal has zero critical health
  issues when source-controlled specs are valid.
- `udd doctor --json` reports generated manifest absence as safe refresh work
  or advisory state, not a source-of-truth blocker.
- `udd status --json` separates current proof blockers from optional discovery
  drift and stale local result state.
- `udd opencode evidence --json` recommends user-visible work before generated
  state cleanup unless generated state is truly blocking the requested action.
- A dated review artifact demonstrates the before/after user story from a fresh
  shallow clone.

## Tasks

- [x] Update use cases and scenarios for status trust and generated-state
      classification before implementation.
- [x] Add E2E tests for a fresh checkout with valid source-controlled specs and
      no manifest.
- [x] Add E2E tests for optional journey drift that should not block normal
      work.
- [x] Reclassify generated manifest absence in doctor/status/evidence output.
- [x] Update repair dry-run to preserve safe refresh recommendations without
      labeling healthy projects as critically blocked.
- [x] Update status JSON fields so agents can distinguish blocking debt,
      advisory drift, and local result staleness.
- [x] Update docs to explain healthy checkout, generated state, and optional
      discovery context.
- [x] Record before/after evidence under `docs/project/reviews/<date>/`.

## Definition of Done

- A user can clone the repo, install dependencies, and run status/doctor without
  seeing a false critical blocker from missing generated manifest state.
- Doctor, status, repair, and evidence commands agree on the classification of
  generated state and optional journey drift.
- The review artifact proves the change using a fresh checkout.

## Verification Commands

```bash
./bin/udd status --json
./bin/udd doctor --json
./bin/udd repair --dry-run --json
./bin/udd opencode evidence --json --goal goals/014-status-trust-and-health-baseline.md
./bin/udd lint
npm test -- --run tests/e2e/udd/recovery/diagnose_project_health.e2e.test.ts
npm test -- --run tests/e2e/udd/strategic-program/strategic_program_commands.e2e.test.ts
```

## Reviewer Blocking Criteria

- Blocks if a clean valid checkout still reports missing generated manifest
  state as a critical product-health issue.
- Blocks if optional journey drift is indistinguishable from canonical
  source-of-truth failure.
- Blocks if evidence recommendations send agents to generated-state cleanup
  before explaining user-visible product work.
- Blocks if the goal lacks fresh-checkout before/after evidence.

## Completion Evidence

Completed on 2026-06-04 with evidence in
`docs/project/reviews/2026-06-04/goal-014-completion-evidence.md`.
