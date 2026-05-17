# Goals

This directory contains source-controlled goals for agent-executed project work.
Goals are not tied to a specific agent vendor. A goal should be complete enough
that a human or agent can start from the file path, execute the work, verify the
checks, and prepare one focused PR.

## How To Use

1. Pick the first open goal in numeric order.
2. Give the agent the goal path.
3. Use the integration's goal command when available:
   `/goal goals/<goal-file>.md`
4. The agent executes only that goal, runs the explicit checks, and prepares a
   PR summary from the goal's acceptance criteria.

Until a specific integration implements `/goal`, the goal file path is the
handoff contract.

## Files

- `TEMPLATE.md`: required structure for new goals.
- `001-project-source-of-truth-cleanup.md`: clean up project state, docs, checks,
  and current-phase stub enforcement.
- `002-traceable-rebuild-slice.md`: prove one end-to-end rebuild-from-spec slice.
- `003-agent-integration-utilities.md`: design reusable integration utilities
  for Codex, OpenCode, and future agents.
