# Journey: Orchestrated Iteration

**Actor**: Developer, Orchestrator Agent, Worker Agent  
**Goal**: Enable continuous autonomous development with agent coordination

## Context

Complex projects benefit from orchestrated agent workflows. This journey
enables an orchestrator to delegate work and monitor completion.

## Steps

1. Developer starts orchestrated session
2. Orchestrator analyzes project status
3. Orchestrator delegates tasks to worker agents
4. Workers complete tasks and report back
5. Orchestrator continues until project complete

## Success Criteria

- Orchestrator delegates work to workers and monitors completion
- Orchestrator handles errors and preserves session state
- Orchestrator uses structured status to make decisions
- Developer can configure iteration limits and pause conditions

## Scenarios

- `opencode/orchestration/iterate_until_complete` - Iterate until complete
- `opencode/orchestration/stop_on_error` - Stop on error
- `opencode/tools/udd_status_tool` - UDD status tool
- `opencode/orchestration/configurable_iteration` - Configurable iteration

## Use Cases

- `specs/use-cases/orchestrated_iteration.yml` - Original use case (legacy)
