---
description: Run E2E tests and update UDD status
agent: udd
---

# /udd/test Command

Run the full E2E test suite and update scenario status.

## Running Tests

!`npm test 2>&1`

## Updated Status

!`./bin/udd status`

## Analysis

Based on the test results:

1. **Passed Tests**: Scenarios that are now satisfied
2. **Failed Tests**: 
   - Identify which feature/scenario failed
   - Look at the error message
   - Determine if it's a test issue or implementation issue
3. **Skipped Tests**: Tests marked as `.skip` or `@wip`

## Next Steps

For failing tests:
1. Read the `.feature` file to understand expected behavior
2. Check if the implementation exists
3. If implementation missing, create it
4. If implementation exists but wrong, fix it
5. Re-run tests with `/udd/test`

Remember: Tests drive implementation, not the other way around!
