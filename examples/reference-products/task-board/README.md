# Task Board Reference Rebuild Proof

This reference product proves that UDD can preserve observable behavior across a
controlled rebuild. The product is intentionally small but realistic: a team
task board with backlog capture, prioritization, assignments, progress,
completion review, and reporting.

Run the shared behavior suite against both implementations:

```bash
UDD_REFERENCE_IMPL=baseline npm test -- --run tests/e2e/udd/reference-rebuild/task_board_rebuild.e2e.test.ts
UDD_REFERENCE_IMPL=rebuild npm test -- --run tests/e2e/udd/reference-rebuild/task_board_rebuild.e2e.test.ts
```

Evidence lives in `evidence/rebuild-report.md`.
