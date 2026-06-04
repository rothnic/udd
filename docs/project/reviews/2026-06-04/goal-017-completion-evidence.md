# Goal 017 Completion Evidence: Change Impact and Regression Upgrade

## Summary

Goal 017 is complete. `udd impact <path> --json` now connects changed root
project and reference-product files to affected behavior and concrete
verification commands, and missing proof is explicit instead of hidden behind
generic status output.

## User-Facing Upgrade

A maintainer or agent can point UDD at a changed use case, feature file, test,
goal, or reference-product spec and get:

- resolved trace nodes for the changed path;
- affected use cases, scenarios, tests, and objectives when available;
- direct, adjacent, missing-proof, deferred-future, or untraceable regression
  markers;
- targeted `npm test -- --run ...` commands or fallback validation commands;
- changed-file impact recommendations in agent evidence.

## Implementation Evidence

- Updated the impact-driven regression feature contract:
  `specs/features/udd/test-governance/feature-change-detection.feature`.
- Extended `buildTraceGraph` and `analyzeImpact` in `src/lib/trace-graph.ts`.
- Added E2E proof for reference-product use cases and stable missing-proof
  recommendations in
  `tests/e2e/udd/test-governance/feature-change-detection.e2e.test.ts`.
- Added unit proof that reference-product trace nodes are scoped by product root
  so root and example specs with the same IDs do not collide.
- Added unit proof that malformed use-case outcome and scenario-path shapes are
  ignored instead of producing character-by-character scenario diagnostics.
- Preserved healthy-project status while exposing reference-product proof gaps
  as informational trace diagnostics.
- Added agent-evidence fallback routing so `src/lib/trace-graph.ts` changes
  recommend the focused trace/agent/impact proof suite.

## Command Evidence

### Focused Impact Regression Tests

Command:

```bash
npm test -- --run tests/e2e/udd/test-governance/feature-change-detection.e2e.test.ts tests/lib/trace-graph.test.ts tests/lib/agent-integration.test.ts
```

Result:

- 3 test files passed.
- 36 tests passed.
- `feature-change-detection.e2e.test.ts` proved changed feature, use case,
  test, goal, untraceable implementation, linked proof, reference-product use
  case, and missing-proof paths.
- `trace-graph.test.ts` proved reference-product node IDs are scoped and do not
  collide with root use-case/scenario IDs, and proved malformed outcome shapes
  do not create invalid scenario diagnostics.

### Lint, Trace, Status, Typecheck

Commands:

```bash
./bin/udd lint
./bin/udd trace --json
./bin/udd status --json
npm run typecheck --if-present
```

Results:

- `./bin/udd lint`: passed; trace graph has 232 nodes, 252 edges, and 28
  diagnostics.
- `./bin/udd trace --json`: 0 error diagnostics, 16 warning diagnostics, and
  12 informational diagnostics.
- `./bin/udd status --json`: health summary remains 0 critical, 0 warning, 48
  informational issues; test governance remains 60 total, 52 linked, 8
  unlinked, 0 orphaned, 10 stubbed, 8 reviewed, 0 stale, 0 missing, and 18
  gate-blocking findings.
- `npm run typecheck --if-present`: passed.

### Full UDD E2E

Command:

```bash
npm test -- --run tests/e2e/udd
```

Result:

- 44 test files passed.
- 298 tests passed.

### Root Use-Case Impact

Command:

```bash
./bin/udd impact specs/use-cases/run_tests.yml --json
```

Result:

- Resolved `use_case:run_tests` plus both linked outcomes.
- Affected objective `objective:udd_tool`.
- Affected scenarios:
  - `specs/features/udd/cli/run_tests.feature`
  - `specs/features/udd/cli/check_status.feature`
- Affected tests:
  - `tests/e2e/udd/cli/run_tests.e2e.test.ts`
  - `tests/e2e/udd/cli/check_status.e2e.test.ts`
- Recommended command:

```bash
npm test -- --run tests/e2e/udd/cli/check_status.e2e.test.ts tests/e2e/udd/cli/run_tests.e2e.test.ts
```

### Changed-Test Impact

Command:

```bash
./bin/udd impact tests/e2e/udd/cli/run_tests.e2e.test.ts --json
```

Result:

- Resolved the changed test.
- Affected scenario: `specs/features/udd/cli/run_tests.feature`.
- Affected use case: `specs/use-cases/run_tests.yml`.
- Recommended command:

```bash
npm test -- --run tests/e2e/udd/cli/run_tests.e2e.test.ts
```

### Reference-Product Impact

Command:

```bash
./bin/udd impact examples/reference-products/task-board/specs/use-cases/capture_work.yml --json
```

Result:

- Resolved `use_case:examples/reference-products/task-board:capture_work` and
  its outcome.
- Affected reference-product scenarios:
  - `examples/reference-products/task-board/specs/features/task-board/capture/create_item.feature`
  - `examples/reference-products/task-board/specs/features/task-board/capture/require_title.feature`
  - `examples/reference-products/task-board/specs/features/task-board/capture/tag_source.feature`
- Emitted missing-proof markers for each affected reference-product scenario.
- Recommended commands:

```bash
npm test -- --run examples/reference-products/task-board/tests/e2e/task-board/capture/create_item.e2e.test.ts
npm test -- --run examples/reference-products/task-board/tests/e2e/task-board/capture/require_title.e2e.test.ts
npm test -- --run examples/reference-products/task-board/tests/e2e/task-board/capture/tag_source.e2e.test.ts
```

### Agent Evidence Impact

Command:

```bash
./bin/udd opencode evidence --json --goal goals/017-change-impact-and-regression-upgrade.md
```

Result:

- Included `changed_file_impacts` for changed files in this branch.
- For `specs/features/udd/test-governance/feature-change-detection.feature`,
  recommended:

```bash
npm test -- --run tests/e2e/udd/test-governance/feature-change-detection.e2e.test.ts
```

- For `src/lib/trace-graph.ts`, marked the file `untraceable` and recommended
  fallback validation plus the focused trace/agent/impact proof suite:

```bash
./bin/udd lint
npm test -- --run tests/lib/trace-graph.test.ts tests/lib/agent-integration.test.ts tests/e2e/udd/test-governance/feature-change-detection.e2e.test.ts
```

## Reviewer Blocking Criteria Check

- Impact output recommends concrete verification commands: passed.
- Changed tests trace back to behavior contracts: passed.
- Missing proof is explicit and actionable: passed.
- Agent evidence includes changed-file impact: passed.

## Independent Review

Carver reviewed the branch before PR creation.

Initial findings:

- P1: `src/lib/trace-graph.ts` changed-file evidence recommended only lint.
- P2: reference-product trace nodes could collide with root or future
  reference-product IDs.

Resolution:

- Added focused trace/agent/impact fallback routing for `src/lib/trace-graph.ts`.
- Scoped non-root trace node IDs by product root and added a collision
  regression.
- Carver re-review returned no remaining findings.

Gemini Code Assist review posted four medium-priority comments after PR
creation:

- Guard malformed `outcomes` values before iterating.
- Guard scalar `scenario_paths` / `scenarios` values before iterating.
- Restrict `specRootFor` to valid reference-product roots.
- Reuse `specRootFor` in expected test-path generation.

Resolution:

- All four comments were applied.
- Added the malformed-outcome regression described above.
