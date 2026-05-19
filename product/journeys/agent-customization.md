# Journey: Agent Customization

**Actor:** Developer
**Goal:** Configure agent adapters to use shared UDD workflow guidance

## Context

Agent runtimes need context about UDD to assist effectively. This journey
ensures Codex, OpenCode, and future adapters can access project status and guide
users through the same source-of-truth workflow.

## Steps

1. Developer opens an agent adapter
2. Agent has access to `udd status` output → `specs/features/udd/agent/status_prompt.feature`
3. Agent guides user through UDD process → `specs/features/udd/agent/guide_user.feature`
4. Codex hooks can be installed into external projects → `specs/features/udd/cli/codex_hooks.feature`
5. User gets contextual assistance

## Future Steps

- OpenCode adapter deep-status, next-recommendation, and issue-list tooling is deferred to #54.

## Success Criteria

- Agent has access to project status
- Agent can guide users through UDD workflow
- Assistance is contextual and helpful

## Use Cases

- `specs/use-cases/agent_customization.yml` - Original use case (legacy)
