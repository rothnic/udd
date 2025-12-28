---
description: Suggest the next action based on project status
agent: quick-status
---

# /udd/next Command

Analyze the project state and recommend the single most important next action.

## Current State

### Project Status
!`./bin/udd status`

### Git Status
!`git status --short`

## Decision Framework

Based on the current state, determine priority order:

### Priority 1: Uncommitted Changes
If there are uncommitted changes that represent completed work, commit them first.

### Priority 2: Failing Tests
If tests exist and are failing:
- Identify the failing scenario
- Guide user to implement or fix the code
- Provide the specific file paths that need work

### Priority 3: Pending Tests
If scenarios exist without test files:
- Identify the scenario needing a test
- Guide user to create the E2E test file
- Show the expected test file path

### Priority 4: Stale Results
If test results are stale, run `/udd/test` to refresh.

### Priority 5: New Features
If all current work is complete, suggest the next feature to implement based on:
- Current phase objectives
- Use case priorities
- Roadmap order

## Recommended Action

Provide ONE clear, actionable next step with:
1. The specific command to run OR file to edit
2. Why this is the highest priority item
3. Expected outcome when complete
