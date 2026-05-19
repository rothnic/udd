# Journey: Phased Development

**Actor:** Developer, Agent
**Goal:** Support incremental delivery with phased scenario tagging

## Context

Not all scenarios need to be implemented immediately. This journey allows
deferring work to future phases while maintaining visibility.

## Steps

1. Developer identifies scenario for future phase → `specs/features/udd/cli/wip_support/wip_tag_support.feature`
2. Tags scenario with `@phase:N` → `specs/features/udd/cli/wip_support/status_shows_wip.feature`
3. Status command shows deferred items separately
4. Agent understands deferred items are intentional → `specs/features/udd/agent/wip_support/agent_wip_awareness.feature`

## Success Criteria

- Scenarios can be tagged as @phase:N to defer to future phases
- Status command shows deferred items separately from blocking failures
- Agent understands deferred scenarios are intentionally deferred

## Use Cases

- `specs/use-cases/phased_development.yml` - Original use case (legacy)
