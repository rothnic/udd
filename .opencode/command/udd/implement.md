---
description: Implement a specific scenario (TDD workflow)
agent: complex-dev
---

# /udd/implement Command

Implement a specific scenario following TDD principles.

## Arguments

- `$ARGUMENTS` - The scenario path (e.g., `udd/cli/check_status` or partial match)

## Current Status

!`./bin/udd status`

## Workflow

### Step 1: Locate the Scenario

Find the scenario matching `$ARGUMENTS`:
- Feature file: `specs/features/$ARGUMENTS.feature` (or similar)
- Test file: `tests/e2e/$ARGUMENTS.e2e.test.ts`

### Step 2: Read the Specification

The `.feature` file defines WHAT should happen. Read it carefully.
The Gherkin steps are the contract - don't deviate from them.

### Step 3: Check Test Status

If test doesn't exist:
1. Create it at the correct path
2. Implement step definitions matching the Gherkin
3. Run test (should fail initially)

If test exists but fails:
1. Read the error message
2. Identify what's missing in the implementation
3. Implement the minimum code to pass

### Step 4: Implement

Write the minimum code needed to make the test pass.
- Don't add features not in the spec
- Don't refactor unrelated code
- Keep changes focused

### Step 5: Verify

!`npm test -- --grep "$ARGUMENTS"`

Then run full status: `/udd/status`
