# Goal 012 Completion Evidence

Goal: `goals/012-rebuild-proof-and-reference-implementation.md`
Branch: `codex/goal-012-reference-rebuild-proof`
Date: 2026-06-04

## User-Facing Result

UDD now includes a browser-readable, runnable reference proof showing that a
small but realistic task-board product can preserve observable behavior across a
controlled rebuild. The proof includes source-controlled product intent, use
cases, feature scenarios, two implementations, a shared behavior suite, and
rebuild evidence.

## Reference Product

Domain: team task board.

Source-controlled proof:

- Product objective:
  `examples/reference-products/task-board/product/objective.md`
- Use cases:
  `examples/reference-products/task-board/specs/use-cases/*.yml`
- Feature scenarios:
  `examples/reference-products/task-board/specs/features/**/*.feature`
- Baseline implementation:
  `examples/reference-products/task-board/implementations/baseline/task-board.ts`
- Rebuild implementation:
  `examples/reference-products/task-board/implementations/rebuild/task-board.ts`
- Rebuild report:
  `examples/reference-products/task-board/evidence/rebuild-report.md`
- Red-green log:
  `examples/reference-products/task-board/evidence/red-green-log.md`
- Local run instructions:
  `examples/reference-products/task-board/README.md`
- Strategic roadmap link:
  `specs/roadmap.yml` includes `strategic_program_execution` with
  `udd/reference-rebuild/task_board_rebuild`.

Counts verified locally:

```text
use_cases=5
scenarios=12
baseline/rebuild impls=2
```

## Command Evidence

### Baseline Implementation

```text
UDD_REFERENCE_IMPL=baseline npm test -- --run tests/e2e/udd/reference-rebuild/task_board_rebuild.e2e.test.ts
```

Result:

```text
Test Files  1 passed (1)
Tests       13 passed (13)
```

### Rebuild Implementation

```text
UDD_REFERENCE_IMPL=rebuild npm test -- --run tests/e2e/udd/reference-rebuild/task_board_rebuild.e2e.test.ts
```

Result:

```text
Test Files  1 passed (1)
Tests       13 passed (13)
```

The same behavior suite runs against both implementations. The suite includes
12 reference-product scenarios plus one additional regression guard for
preserving order when a reorder target is missing.

### `./bin/udd status --json`

Captured through `jq`:

```json
{
  "health": {
    "critical": 0,
    "warning": 0,
    "info": 48,
    "total": 48
  },
  "reference": {
    "path": "udd/reference-rebuild",
    "scenarios": {
      "task_board_rebuild": {
        "e2e": "passing",
        "isDeferred": false
      }
    },
    "requirements": {}
  }
}
```

### `./bin/udd lint`

```text
All specs are valid
Trace graph: 210 node(s), 229 edge(s), 28 diagnostic(s)
```

## Red-Green Proof

`examples/reference-products/task-board/evidence/red-green-log.md` records
three behavior changes:

- Title validation failed until both implementations rejected blank titles.
- Blocked-state reason failed until the reason was stored as visible state.
- Owner filtering failed until reporting used the same owner field as
  assignment.

## What UDD Preserved

The rebuild report records that UDD preserved capture, validation,
prioritization, ordering, assignment, progress tracking, completion review
notes, state counts, and owner filtering.

## What UDD Did Not Capture

The rebuild report explicitly excludes UI layout, persistence technology, and
performance characteristics because this proof is limited to observable
behavior contracts.

## Residual Risks

- The live repository still has informational optional-discovery issues and
  broader test-governance blockers. Goal 012 does not claim to resolve those.
- The reference product is intentionally small and in-memory; it proves behavior
  preservation, not production architecture.
- The red-green history is documented as source-controlled evidence, not replayed
  by automation.

## Reviewer Blocking Criteria

Block this goal if:

- The baseline and rebuild implementations do not pass the same behavior suite.
- The reference product has fewer than 5 use cases or 12 scenarios.
- Tests assert implementation internals instead of user-observable behavior.
- Rebuild evidence exists only in chat or generated local state.
