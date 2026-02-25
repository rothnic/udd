# Journey: Agent Customization

**Actor**: Developer  
**Goal**: Customize the GitHub Copilot agent for UDD workflows

## Context

The Copilot agent needs context about UDD to assist effectively. This journey
ensures the agent has access to project status and can guide users.

## Steps

1. Developer opens Copilot chat
2. Agent has access to `udd status` output
3. Agent guides user through UDD process
4. User gets contextual assistance

## Success Criteria

- Agent has access to project status
- Agent can guide users through UDD workflow
- Assistance is contextual and helpful

## Scenarios

- `specs/features/udd/agent/status_prompt.feature` - Agent status access
- `specs/features/udd/agent/guide_user.feature` - Agent guides user

## Use Cases

- `specs/use-cases/agent_customization.yml` - Original use case (legacy)

<!-- EOF -->
