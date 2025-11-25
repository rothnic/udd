---
description: Show UDD project status (use cases, outcomes, scenarios)
agent: udd
---

# /udd/status Command

Check the current UDD project status to understand what needs attention.

## Current Status

!`./bin/udd status`

## Analysis

Based on the status output above:

1. **Phase Check**: Note the current phase and what phase objectives remain
2. **Health Summary**: Focus on unsatisfied outcomes first
3. **Stale Tests**: If tests are stale, recommend running `/udd/test`
4. **Git State**: If dirty, consider what should be committed

## Next Steps

Recommend the most impactful next action based on:
- Failed tests need implementation
- Pending scenarios need test files
- Stale results need `npm test`
- Unsatisfied outcomes need attention

Guide the user toward completing the current phase objectives.
