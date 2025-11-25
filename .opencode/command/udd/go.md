---
description: Start the UDD workflow for a goal
agent: udd
---

# /udd/go Command

Start or continue working toward a goal using the UDD workflow.

## Goal

$ARGUMENTS

## Current State

### Project Status
!`./bin/udd status`

### Git Status  
!`git status --short`

## UDD Workflow

Follow this workflow strictly:

### 1. Check If Spec Exists

Does a use case, feature, or scenario already cover this goal?
- If YES: proceed to implementation
- If NO: create the spec first

### 2. Create Specs (if needed)

```
Vision → Use Case → Feature → Scenario
```

For "$ARGUMENTS":
1. Which use case does this serve? Create if missing.
2. Which feature implements it? Create if missing.
3. What specific scenario tests it? Create if missing.

### 3. Create Test (if needed)

Every `.feature` file needs a matching `.e2e.test.ts`.
The test MUST fail initially (red phase of TDD).

### 4. Implement

Write the minimum code to make the test pass.
No extra features. No premature optimization.

### 5. Verify

Run tests and check status:
- Tests should pass
- Outcome should be satisfied
- Status should be clean

### 6. Commit

Small, focused commit with meaningful message.

## Action Plan

Based on the goal "$ARGUMENTS" and current state, here's the specific action plan:
