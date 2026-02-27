# Journey: Run Tests

**Actor**: Developer  
**Goal**: Execute tests and track implementation progress

## Context

Tests verify that the system works as specified. Running tests should be
easy and provide clear feedback on what's passing and failing.

## Steps

1. Developer implements a feature → `specs/features/udd/cli/run_tests.feature`
2. Runs `npm test` to execute all tests
3. Views results to see pass/fail status → `specs/features/udd/cli/check_status.feature`
4. Checks `udd status` for project-wide progress

## Success Criteria

- Tests can be executed via CLI
- Project status is visible and up-to-date
- Failures are clearly reported with context

## Use Cases

- `specs/use-cases/run_tests.yml` - Original use case (legacy)

<!-- EOF -->
