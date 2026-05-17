# Journey: Agent Customization

**Actor**: Developer  
**Goal**: Configure agent adapters to use shared UDD workflow guidance

## Context

Agent runtimes need context about UDD to assist effectively. This journey
ensures Codex, OpenCode, and future adapters can access project status and guide
users through the same source-of-truth workflow.

## Steps

1. Developer opens an agent adapter
2. Agent has access to `udd status` output → `specs/features/udd/agent/status_prompt.feature`
3. Agent guides user through UDD process → `specs/features/udd/agent/guide_user.feature`
4. User gets contextual assistance
5. OpenCode adapter checks deep status → `specs/features/opencode/tools/status_deep.feature`
6. OpenCode adapter gets next recommendation → `specs/features/opencode/tools/next_recommendation.feature`
7. OpenCode adapter lists all issues → `specs/features/opencode/tools/issues_list.feature`

## Success Criteria

- Agent has access to project status
- Agent can guide users through UDD workflow
- Assistance is contextual and helpful

## Use Cases

- `specs/use-cases/agent_customization.yml` - Original use case (legacy)

<!-- EOF -->
