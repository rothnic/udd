# Shared Agent Evidence Contract

Agent adapters expose review handoff evidence through the same UDD facts rather
than adapter-specific state.

Required payload fields:

- `project`: project name and root.
- `goal`: optional goal path and completion status.
- `status_snapshot`: shared project snapshot from `buildAgentProjectSnapshot`.
- `next_recommendation`: shared next-work recommendation.
- `issues_summary`: diagnostic totals for reviewer triage.
- `verification`: commands and pass/fail/not-run status.
- `changed_files`: source paths the agent changed.
- `review_notes`: human-readable notes for PR or handoff review.
- `generated_at`: ISO timestamp.

Adapters may add presentation around this payload, but they should not change
the meaning of the shared fields.
