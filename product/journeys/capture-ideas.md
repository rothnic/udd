# Journey: Capture Ideas

**Actor**: Developer  
**Goal**: Quickly capture feature ideas before they are forgotten

## Context

Developers often have ideas while coding but lose them because 
capturing is too high-friction. This journey makes it effortless.

## Steps

1. **Trigger**: Developer has idea while working
2. **Capture**: Developer runs `udd inbox add "idea description"` → `specs/features/udd/cli/inbox/add_item_via_cli.feature`
3. **Confirmation**: CLI confirms idea captured with ID
4. **Return**: Developer returns to coding immediately

## Success Criteria

- Capture takes < 5 seconds
- No context switching required
- Idea is traceable later

## Use Cases

- `specs/use-cases/capture_ideas.yml` - Original use case (legacy)
