# Goal 017: Change Impact and Regression Upgrade

## Agent Entry

Connect traceability to concrete regression decisions. A user changing a file
should see affected objectives, use cases, scenarios, tests, and the exact
verification commands that prove the change.

## Timebox and Team Shape

- Target duration: 2 engineering weeks.
- Suggested team: 2-4 engineers across trace graph, status, regression
  planning, E2E tests, and docs.
- Primary users: maintainers, reviewers, and agents planning behavior changes.

## Objective

Upgrade trace and impact analysis from project intelligence into a targeted
regression workflow that recommends verification work for source-controlled
changes.

## User-Facing Promise

> "Tell me what this change affects and which tests I need to run before I
> trust it."

## Scope

- Impact output for changed use cases, feature files, tests, goals, and
  reference-product specs.
- Recommended verification commands for affected scenarios and tests.
- Regression markers that distinguish direct impact, adjacent impact, missing
  proof, and deferred future work.
- Status/evidence integration so agents can route from changed files to proof
  obligations.

## Non-Goals

- Full dependency graph for arbitrary application code.
- Runtime coverage instrumentation.
- Automatic CI configuration for every repository.
- Replacing human review judgment.

## Measurables

- `udd impact <path> --json` includes affected objectives, capabilities, use
  cases, outcomes, scenarios, tests, diagnostics, and recommended commands.
- Given a changed feature file, UDD identifies the corresponding E2E test and
  any missing proof.
- Given a changed use case, UDD identifies all linked scenarios and tests.
- Given a changed test, UDD identifies the behavior contract it claims to prove.
- Agent evidence includes targeted verification recommendations for changed
  files.

## Tasks

- [ ] Update use cases and scenarios for impact-driven regression before
      implementation.
- [ ] Extend impact graph output with recommendation fields and confidence
      levels.
- [ ] Add tests for changed use-case, feature, test, goal, and reference-product
      paths.
- [ ] Add missing-proof diagnostics when an affected scenario lacks an E2E test.
- [ ] Add command recommendation generation for targeted test runs.
- [ ] Update status and evidence surfaces to include impact-derived next checks.
- [ ] Document reviewer workflow for using impact output during PR review.
- [ ] Record an independent user-perspective review.

## Definition of Done

- A reviewer can run one command for a changed path and see what behavior is
  affected and which tests should be run.
- Agents can use changed-file impact to choose verification commands without
  inventing project-specific routing.
- Missing proof is explicit and actionable.

## Verification Commands

```bash
./bin/udd impact specs/use-cases/run_tests.yml --json
./bin/udd impact specs/features/udd/cli/run_tests.feature --json
./bin/udd impact tests/e2e/udd/cli/run_tests.e2e.test.ts --json
./bin/udd opencode evidence --json --goal goals/017-change-impact-and-regression-upgrade.md
./bin/udd lint
npm test -- --run tests/e2e/udd
```

## Reviewer Blocking Criteria

- Blocks if impact output cannot recommend concrete verification commands.
- Blocks if changed tests cannot be traced back to behavior contracts.
- Blocks if missing proof is hidden behind generic status output.
- Blocks if agent evidence ignores changed-file impact.
