---
description: Show UDD project status (use cases, outcomes, scenarios)
agent: quick-status
---

# /udd/status Command

Run the UDD status command and provide a concise assessment.

## Execute Status

!`./bin/udd status`

## Full Status Output (example)

The command above prints a structured project status. Inject that output here to help with remediation.

Example:

```
Project: udd
Phase: 3 - Agent Integration
Journeys: 12 (2 changed)
Scenarios: 48 total (5 failing, 3 missing, 2 stale)
Dirty tests: 46
Git: dirty (3 modified)
Drift: 31 issues (spec/test/implementation drift)
```

## Analysis

Based on the status output:

1. **Phase Progress**: What phase are we in? What objectives remain?
2. **Health Check**: Any unsatisfied outcomes or failing scenarios?
3. **Stale Tests**: Are test results current or stale?
4. **Git State**: Is the working directory clean?

## Remediation Guidance

Before making changes, run `udd doctor` to validate the environment and surface infra or dependency issues. If `udd doctor` reports problems you can often run `udd doctor --fix` to attempt automated fixes. Use the following decision guide:

- If `Phase` is behind roadmap or journeys changed: run `udd sync` to generate/update spec files, then `udd status` to re-evaluate.
- If `scenarios` are missing: create the missing scenario feature files (use `udd new scenario <domain> <action>`), then run `udd test`.
- If `scenarios` are failing: inspect failing tests. If failures are due to test staleness, run `udd test` to refresh. If they are genuine, implement code fixes and run tests.
- If `dirty tests` present: run `udd test` to refresh results; then follow failing test remediation.
- If `drift` (spec/test mismatch) is detected: prefer `udd sync` (to update specs) then `udd test`; if environment issues also present, run `udd doctor --fix` first.

## When to use which command

- `udd doctor`: First step for environmental, dependency, or infrastructure validation. Run before starting work.
- `udd doctor --fix`: Attempt automated remediation for common issues reported by doctor. Use with caution and review changes.
- `udd sync`: Sync journeys → specs. Use when product/journeys changed and feature files need regeneration.
- `udd test`: Run tests. Use to refresh stale results or validate fixes.

Always re-run `udd status` after remediation steps to confirm the project is healthy before iterating.

## Summary

Provide a brief (2-3 sentence) summary of the project health and the single most impactful next action to take.
