# Shared Agent Evidence Contract

Agent adapters expose review handoff evidence through the same UDD facts rather
than adapter-specific state.

## Required Payload Fields

- `project`: project name and root.
- `goal`: optional goal path and completion status.
- `status_snapshot`: shared project snapshot from `buildAgentProjectSnapshot`.
- `next_recommendation`: shared next-work recommendation.
- `issues_summary`: diagnostic totals for reviewer triage.
- `verification`: commands and pass/fail/not-run status.
- `changed_files`: source paths the agent changed.
- `review_notes`: human-readable notes for PR or handoff review.
- `generated_at`: ISO timestamp.

## Shared JSON Shape

Agent-facing payloads use stable snake_case fields. Adapters can render these
fields differently for their own UI, but the shared command payload keeps this
shape. The source-controlled JSON Schema is
`integrations/shared/agent-payload.schema.json`.

- `status_snapshot.project`: `{ name, root }`
- `status_snapshot.phase`: `{ current, name, all }`
- `status_snapshot.git`: current branch and dirty-state counts.
- `status_snapshot.health`: doctor status and severity summary.
- `status_snapshot.scenarios`: total, passing, failing, missing, stale, and
  deferred counts.
- `next_recommendation`: `{ recommended, reason, user_impact, blocks_work,
  verification_commands, suggested_files, blocking, pause_reasons,
  generated_at }`
- `test_governance`: summary, review-manifest issues, missing proof,
  blocking findings, and next action.
- `handoff`: summary, next action, proof status, blockers, review-required
  flag, and verification commands.

The contract is adapter-neutral. It must not add runtime-specific command
fields such as Codex hook installers, OpenCode slash-command definitions, or
goal-command shortcuts. Runtime-specific files can call the shared commands, but
they do not change the meaning of shared payload fields.

## Failure Modes

- Critical or warning diagnostics set `blocking` and `pause_reasons` so an
  agent can stop before unsafe mutation.
- Test-governance blockers set `handoff.review_required` and explain the next
  reviewer-visible action.
- Generated-state and optional-discovery drift can appear as informational
  issues without blocking current proof.
- Verification claims remain explicit command records. Adapters must not infer
  pass/fail state from generated local result files.

Adapters may add presentation around this payload, but they should not change
the meaning of the shared fields.
