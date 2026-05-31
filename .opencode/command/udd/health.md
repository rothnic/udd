---
description: Show UDD diagnostics for OpenCode sessions
agent: quick-status
---

# /udd/health Command

Run UDD diagnostics and summarize project health for the current OpenCode
session.

## Execute Diagnostics

!`./bin/udd doctor`

## Execute OpenCode Issue Payload

!`./bin/udd opencode issues`

## Summary

Report critical issues first, then warnings. If the diagnostics show only
warnings from known roadmap or journey drift, call that out as warning-level
state and recommend the next focused command to run.
