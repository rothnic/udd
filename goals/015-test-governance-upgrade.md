# Goal 015: Test Governance Upgrade

## Agent Entry

Turn test-governance gaps into canonical source-controlled behavior. The goal is
to let teams see which tests are proof, which are stale, which are reviewed, and
which findings should block strict gates.

## Timebox and Team Shape

- Target duration: 2 engineering weeks.
- Suggested team: 3-5 engineers across specs, CLI gates, CI integration, tests,
  and documentation.
- Primary users: test-governance owners, maintainers, reviewers, and agents
  deciding whether behavior is proven.

## Objective

Implement missing test-governance coverage across `track_test_quality`,
`manage_test_lifecycle`, `enforce_quality_gates`, `monitor_test_health`, and
`prevent_regression` so teams can adopt UDD gates gradually and credibly.

## User-Facing Promise

> "Show me which tests I can trust, which need review, and which issues should
> block a merge."

## Scope

- Canonical use-case and feature coverage for test inventory, lifecycle review,
  quality gates, health monitoring, and regression prevention.
- Strict and non-strict gate behavior with source-controlled review evidence.
- Status and evidence output that summarizes governance findings without hiding
  missing or stale proof.
- Focused CI or local command examples for adopting gates.

## Non-Goals

- Full historical flake analytics.
- External dashboard integration.
- Automatically approving tests.
- Rewriting existing tests without spec-first changes.

## Measurables

- Each of the five governance use cases has current canonical scenarios and E2E
  tests for every current outcome this goal promotes out of future/discovery
  state.
- Known governance journey gaps are either implemented as canonical scenarios
  with E2E proof or explicitly reclassified as future scope with source
  references and a reason.
- `udd test-scan --json` reports linked, unlinked, orphaned, stubbed, reviewed,
  stale, and missing proof states with source references.
- `udd gate test-governance` reports findings without blocking by default.
- `udd gate test-governance --strict` fails on configured blocking findings and
  passes on a fixture with reviewed, linked, non-stub proof.
- Status and agent evidence summarize governance state in terms a reviewer can
  act on.

## Tasks

- [x] Update use cases before implementation, moving valid future outcomes into
      canonical current scenarios where this goal owns them.
- [x] Add feature files for missing governance flows: test scan, test status,
      test review, hook/CI gate behavior, health metrics, and regression
      detection.
- [x] Inventory every existing governance future outcome and journey-referenced
      missing scenario, then classify it as current implementation scope or
      explicit future scope before writing CLI code.
- [x] Add E2E tests for every new current governance scenario.
- [x] Extend test inventory classification with source references and stable
      JSON fields.
- [x] Add source-controlled reviewed-test evidence fixtures.
- [x] Prove ignored local cache cannot alter gate outcomes.
- [x] Implement strict/non-strict gate fixtures for passing and failing cases.
- [x] Update status, evidence, and docs to show governance adoption steps.
- [x] Record an independent user-perspective review.

## Definition of Done

- A governance owner can inspect the repo and know which tests are trusted,
  stale, missing, reviewed, or CI-blocking across every governance outcome this
  goal keeps in current scope.
- Strict mode is credible enough to use in CI for configured blocking findings.
- Non-strict mode remains useful for adoption without blocking all work.

## Verification Commands

```bash
./bin/udd status --json
./bin/udd test-scan --json
./bin/udd gate test-governance
./bin/udd gate test-governance --strict
./bin/udd lint
npm test -- --run tests/e2e/udd/test-governance
```

## Reviewer Blocking Criteria

- Blocks if governance behavior is described only in journeys or docs without
  canonical scenarios and E2E tests.
- Blocks if any known governance gap remains neither implemented nor explicitly
  reclassified as future scope with a reason.
- Blocks if local ignored cache can change reviewed or blocking gate state.
- Blocks if strict and non-strict modes are not clearly different.
- Blocks if status or evidence cannot explain the next governance action.

## Completion Evidence

Completed on 2026-06-04 with evidence in
`docs/project/reviews/2026-06-04/goal-015-completion-evidence.md`.
