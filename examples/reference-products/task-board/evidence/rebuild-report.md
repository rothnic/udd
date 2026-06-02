# Task Board Rebuild Evidence

The reference product contains 5 use cases and 12 focused scenarios under
`examples/reference-products/task-board/specs`.

Both implementation paths are exercised by the same behavior suite:

```bash
UDD_REFERENCE_IMPL=baseline npm test -- --run tests/e2e/udd/reference-rebuild/task_board_rebuild.e2e.test.ts
UDD_REFERENCE_IMPL=rebuild npm test -- --run tests/e2e/udd/reference-rebuild/task_board_rebuild.e2e.test.ts
```

UDD preserved the observable task-board behaviors: capture, validation,
prioritization, ordering, assignment, progress tracking, completion review
notes, state counts, and owner filtering.

UDD did not preserve UI layout, persistence technology, or performance
characteristics because this proof is intentionally limited to user-observable
behavior contracts.
