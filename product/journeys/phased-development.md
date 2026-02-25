# Journey: Phased Development

**Actor**: Developer, Agent  
**Goal**: Support incremental delivery with phased scenario tagging

## Context

Not all scenarios need to be implemented immediately. This journey allows
deferring work to future phases while maintaining visibility.

## Steps

1. Developer identifies scenario for future phase
2. Tags scenario with `@phase:N` 
3. Status command shows deferred items separately
4. Agent understands deferred items are intentional

## Success Criteria

- Scenarios can be tagged as @phase:N to defer to future phases
- Status command shows deferred items separately from blocking failures
- Agent understands deferred scenarios are intentionally deferred

## Scenarios

- `specs/features/udd/cli/wip_support/wip_tag_support.feature` - WIP tag support
- `specs/features/udd/cli/wip_support/status_shows_wip.feature` - Status shows WIP
- `specs/features/udd/agent/wip_support/agent_wip_awareness.feature` - Agent WIP awareness

## Use Cases

- `specs/use-cases/phased_development.yml` - Original use case (legacy)
