---
description: Show the UDD roadmap and phase objectives
agent: quick-status
---

# /udd/roadmap Command

Display the project vision, phases, and current progress.

## Vision Document

!`cat specs/VISION.md`

## Current Phase Analysis

Based on the VISION.md:

1. **Current Phase**: Identify which phase we're in
2. **Phase Objectives**: What must be completed this phase
3. **Remaining Work**: Which objectives are incomplete
4. **Dependencies**: What's blocking progress

## Phase Completion Criteria

A phase is complete when:
- All use cases for that phase have satisfied outcomes
- All scenarios are implemented and passing
- No stale test results
- Clean git state (or intentional WIP)

## Recommendations

Guide the user on:
1. What to focus on to complete current phase
2. What can be deferred to later phases
3. Any research or decisions needed
