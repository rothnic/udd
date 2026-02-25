# Journey: Manage Work In Progress

**Actor**: Developer, Agent  
**Goal**: Avoid accumulating too many changes at once

## Context

Large changesets are harder to review and more likely to introduce bugs.
This journey helps keep changes small and focused.

## Steps

1. Developer makes changes to code
2. Agent monitors changeset size
3. When threshold exceeded, agent warns developer
4. Developer is encouraged to commit current work

## Success Criteria

- Agent warns when too many files are changed
- Developer receives encouragement for small commits
- Work-in-progress is visible and manageable

## Scenarios

- `specs/features/udd/agent/wip_enforcement/warn_on_large_changeset.feature` - Warning on large changes
- `specs/features/udd/agent/wip_enforcement/encourage_small_commits.feature` - Encourage small commits

## Use Cases

- `specs/use-cases/manage_wip.yml` - Original use case (legacy)
