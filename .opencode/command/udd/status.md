---
description: Show UDD project status (use cases, outcomes, scenarios)
agent: quick-status
---

# /udd/status Command

Run the UDD status command and provide a concise assessment.

## Execute Status

!`./bin/udd status`

## Execute OpenCode Adapter Status

!`./bin/udd opencode status`

## Analysis

Based on the status output:

1. **Phase Progress**: What phase are we in? What objectives remain?
2. **Health Check**: Any unsatisfied outcomes or failing scenarios?
3. **Stale Tests**: Are test results current or stale?
4. **Git State**: Is the working directory clean?
5. **Adapter State**: Does `udd opencode status` show the same phase, health,
   and issue counts from shared UDD state?

## Summary

Provide a brief (2-3 sentence) summary of the project health and the single most impactful next action to take.
