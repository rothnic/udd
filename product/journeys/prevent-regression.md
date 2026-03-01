# Journey: Prevent Regression

**Actor**: Developer  
**Goal**: Tests auto-marked when features change

## Context

When features change, it is hard to know which tests to re-run. Developers often either skip
running tests they should run, or waste time running tests that are not affected by their
changes. This leads to stale tests and false confidence. The system should automatically
detect when feature files change and mark related tests as "dirty" so developers always know
what needs attention.

## Steps

1. Developer changes a feature file → `specs/test-governance/feature-change-detection.feature`
2. System marks affected tests as dirty → `specs/test-governance/dirty-marking.feature`
3. Sync command reports dirty tests → `specs/test-governance/sync-dirty-marking.feature`

## Success Criteria

- Feature changes are detected automatically
- No manual tracking of which tests to run
- Dirty reasons are clear and actionable
- Developers can trust that dirty tests truly need attention

## Use Cases

- `specs/use-cases/prevent_regression.yml` - Original use case (legacy)

<!-- EOF -->
