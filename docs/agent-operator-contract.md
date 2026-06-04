# Agent Operator Contract

UDD agent adapters should consume shared project facts instead of chat history
or adapter-specific command conventions.

## Shared Commands

- `udd opencode status --json`: project, phase, git, health, scenario totals,
  and diagnostic issues.
- `udd opencode next --json`: next work recommendation with user impact,
  blockers, verification commands, and pause reasons.
- `udd opencode issues --json`: diagnostic issues with recommendations.
- `udd opencode evidence --json --goal <goal-path>`: reviewable handoff
  evidence for the current goal.

These commands are adapter-neutral even when exposed through the OpenCode command
namespace. Codex, OpenCode, and future adapters should preserve the JSON shape
instead of adding adapter-only control fields.

## Next Work

`next_recommendation` includes:

- `recommended`: the source-controlled item to inspect or implement next.
- `reason`: the project fact that caused the recommendation.
- `user_impact`: why the work matters to a user or reviewer.
- `blocks_work`: whether an agent should pause before continuing.
- `verification_commands`: commands that prove or refresh the claim.
- `suggested_files`: files and actions for reviewable implementation.
- `blocking`: non-info diagnostics relevant to the decision.
- `pause_reasons`: explicit reasons an agent should wait for review.

Generated-state cleanup is advisory unless it blocks command correctness. User
visible scenario failures, missing proof, and stale current-phase proof rank
above optional generated journey metadata.

## Handoff Evidence

`evidence.handoff` summarizes:

- `summary`: the recommendation and reason in one reviewable line.
- `next_action`: the next file/action a human can inspect.
- `proof_status`: health, test governance gate state, and a reminder that
  verification claims require explicit command evidence.
- `blockers`: pause reasons normalized into reviewable blocker records.
- `review_required`: whether an adapter should stop for human review.
- `verification_commands`: status, lint, test, and impact-derived commands.

Adapters must not infer proof from `.udd/results.json` or generated local state.
PRs and handoffs should attach explicit command output for every claimed pass.

## Noisy Status Handling

Agents should separate blocking proof failures from advisory generated-state
noise:

- Critical or warning diagnostics mean pause, report the blocker, and avoid
  mutation unless the command explicitly says the repair is safe.
- Current-phase failing or missing scenarios outrank optional journey drift.
- Test-governance blockers require review evidence before continuing.
- Informational optional-discovery drift can be routed as cleanup, but it must
  not be reported as proof that current product behavior is broken.
