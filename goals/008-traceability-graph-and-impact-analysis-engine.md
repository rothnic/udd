# Goal 008: Traceability Graph and Impact Analysis Engine

## Agent Entry

Turn UDD's source files into a queryable graph that can answer what behavior is
covered, what is stale, and what changes when an objective, use case, scenario,
or test moves.

## Timebox and Team Shape

- Target duration: 2 engineering weeks.
- Suggested team: 4-6 engineers across parser/model, CLI, testing, docs, and
  migration.
- Primary users: maintainers, reviewers, and agents deciding where to work next.

## Objective

Implement a deterministic traceability engine for:

```text
Objective -> Use Case -> Scenario -> E2E Test
```

The engine should support status, lint, impact analysis, and reviewer evidence
without duplicating requirements across artifact layers.

## Scope

- In-memory graph model and stable JSON output.
- Impact query commands for changed objectives, use cases, scenarios, and tests.
- Status rollups by objective, phase, capability, use case, and scenario.
- Orphan, duplicate, stale, missing, and future-phase classification.

## Non-Goals

- Database persistence.
- UI graph visualization.
- Rewriting all status output in one pass.
- Multi-repo traceability.

## Measurables

- `udd trace --json` returns deterministic nodes and edges.
- `udd impact <path>` identifies affected use cases, scenarios, and tests.
- `udd status --json` can be derived from the graph model without ad hoc
  duplicate parsing.
- Existing stale and missing scenario counts are explainable from graph
  diagnostics.
- Graph tests cover at least 10 representative valid and invalid repo states.

## Tasks

## Completion Evidence

Recorded on 2026-06-04 in
`docs/project/reviews/2026-06-04/goal-008-completion-evidence.md`.

Goal 008 is complete because PR #67 added the shared trace graph engine,
`udd trace --json`, `udd impact <path>`, source-controlled strategic-program
feature/E2E proof, deterministic graph output, source file references,
diagnostics, and targeted test recommendations. The 2026-06-04 completion PR
adds the remaining graph fixture coverage, stale-scenario graph diagnostics, and
practical status/lint graph consumption needed to close the original checklist.
Later Goal 017 extends this foundation with richer regression recommendations;
that upgrade is separate from the Goal 008 baseline.

## Tasks

- [x] Update use cases, feature scenarios, and failing E2E tests for trace and
      impact behavior before implementing graph commands.
- [x] Define graph node and edge types for objective, capability, phase, use
      case, outcome, scenario, and test.
- [x] Build parsers that preserve source file and line references.
- [x] Add deterministic graph serialization for CLI and agent consumers.
- [x] Implement orphan scenario detection through graph traversal.
- [x] Implement missing test and missing scenario diagnostics.
- [x] Implement stale scenario classification using existing manifest behavior.
- [x] Implement future-phase classification without blocking planning work.
- [x] Add impact analysis for changed feature files.
- [x] Add impact analysis for changed use-case files.
- [x] Add impact analysis for changed roadmap or phase files.
- [x] Refactor status/lint to consume the graph where practical.
- [x] Add fixtures for partial, invalid, and drifted projects.
- [x] Add reviewer examples showing trace output for one current use case.

## Definition of Done

- Maintainers can ask which behavior a file affects and receive deterministic
  JSON plus human-readable output.
- Status and lint diagnostics are explainable through a shared graph model.
- Agents have a stable machine-readable contract for routing work.

## Verification Commands

```bash
./bin/udd trace --json
./bin/udd impact specs/use-cases/run_tests.yml
./bin/udd status
./bin/udd lint
npm test -- --run
```

## Reviewer Blocking Criteria

- Blocks if graph output is nondeterministic across repeated runs.
- Blocks if status/lint gains a second inconsistent parsing model.
- Blocks if diagnostics lose source file references needed for review.
- Blocks if future-phase planning is treated as a hard failure in normal mode.
