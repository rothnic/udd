---
description: Iterate on UDD project until complete or error
agent: complex-dev
---

# /udd/iterate Command

Autonomous iteration loop for UDD projects. Use this to drive continuous progress.

## Current Project State

### Status (JSON)
!`./bin/udd status --json`

## Current Project Status (injection)

The command above injects the live UDD status. Before you begin any iteration work run `udd doctor` to validate environment and dependencies. If you see drift or errors run `udd doctor --fix`.

Display guidance (derived from the status JSON):

- **Phase**: `current_phase` (show numeric phase and name from roadmap)
- **Roadmap**: list next 2-3 milestones for the current phase
- **Dirty Tests**: If `dirty_tests_count` > 0 show count and advise running `udd test`
- **Drift Status**: If any `drift` or `issues` keys exist show a short warning and link to remediation below

Example injection (rendered from JSON):

```
## Current Project Status

**Phase**: 3 - OpenCode Integration
**Roadmap (next steps)**: sync journeys → generate scenarios → implement failing scenarios
**Dirty Tests**: 46 (run `udd test` to refresh results)
**Drift Status**: ⚠️ 31 issues detected (run `udd doctor` for diagnostics or `udd doctor --fix` to attempt automated remediation)
```

### Git State
!`git status --short`

## Iteration Protocol

You are in an **iteration loop**. Follow this protocol exactly:

### Step 1: Parse Status

From the JSON status above, identify:
1. `current_phase` - what phase are we in?
2. Any `failing` scenarios - these need code fixes
3. Any `missing` scenarios - these need test files
4. Any `stale` scenarios - run `/udd/test` first
5. Git state - commit completed work before continuing

Before making code changes run `udd status` again and `udd doctor` to ensure the environment is healthy. If `udd status` shows drift between journeys/specs/tests, follow remediation guidance (see below) before implementing new behavior.

### Step 2: Check Completion

**COMPLETE** if ALL of these are true:
- No `failing` scenarios (for current phase)
- No `missing` scenarios (for current phase) 
- Git state is clean
- All use case outcomes show `satisfied`

If COMPLETE, respond with:
```
STATUS: COMPLETE
All Phase 3 objectives are satisfied. Tests passing, git clean.
```

### Step 3: Check Error State

**ERROR** if ANY of these are true:
- Same scenario has failed 3+ consecutive times
- Unrecoverable error (missing dependencies, corrupted files)
- Circular dependency detected

If ERROR, respond with:
```
STATUS: ERROR
Reason: <specific error description>
Context: <what was being attempted>
Recovery: <suggested manual intervention>
```

### Step 4: Execute Next Action

If not COMPLETE or ERROR, execute exactly ONE of these (priority order):

1. **Stale results**: Run `/udd/test` to refresh
2. **Uncommitted work**: Commit with meaningful message
3. **Failing test**: Fix the implementation
4. **Missing test**: Create the E2E test file
5. **Missing spec**: Create the scenario spec

After completing the action, the orchestrator should call `/udd/iterate` again.

### Remediation guidance (when drift detected)

- If `journeys` changed but `specs` not in sync: run `udd sync` to generate/update feature files, then run `udd status`.
- If specs exist but tests failing due to environment or dependencies: run `udd doctor` and then `udd doctor --fix` if appropriate.
- If tests are stale: run `udd test` to refresh results before implementing code changes.
- If many failing tests across unrelated journeys: pause iteration and request human review.

Link: Use `udd doctor --fix` as the automated first-step remediation for environment and simple drift fixes. For semantic drift (spec changed, tests failing), prefer `udd sync` then `udd test`.

### Step 5: Report Progress

After each action, report:
```
ACTION: <what was done>
RESULT: <outcome>
NEXT: Continuing iteration...
```

## Guardrails

- Maximum 50 iterations before pausing for human review
- Pause if more than 10 files modified in single iteration
- Pause on test failures after implementation attempt
- Never modify specs without explicit instruction
- Always commit before starting new work item

## Continue Iteration

After completing the action above, call `/udd/iterate` to continue the loop.
