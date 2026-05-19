# Goals

This directory contains source-controlled goals for agent-executed project work.
Goals are not tied to a specific agent vendor. A goal should be complete enough
that a human or agent can start from the file path, execute the work, verify the
checks, and prepare focused PRs.

## How To Use

1. Pick the first open goal in numeric order.
2. Give the agent the goal path.
3. Execute only the work described by that goal.
4. Run the explicit checks and record any deferred work by issue or goal path.

## Files

- `005-pr45-side-branch-stack-audit.md`: audit the broad stack preserved after
  superseded PR #45 and split valid work into mergeable slices.

