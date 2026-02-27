# Journey: Orchestrated Iteration

**Actor**: Developer, Orchestrator Agent, Worker Agent  
**Goal**: Enable continuous autonomous development with agent coordination

## Context

Complex projects benefit from orchestrated agent workflows. This journey
enables an orchestrator to delegate work and monitor completion.

## Steps

1. Developer starts orchestrated session
2. Orchestrator analyzes project status → `specs/features/opencode/orchestration/iterate_until_complete.feature`
3. Orchestrator delegates tasks to worker agents → `specs/features/opencode/orchestration/stop_on_error.feature`
4. Workers complete tasks and report back → `specs/features/opencode/tools/udd_status_tool.feature`
5. Orchestrator continues until project complete → `specs/features/opencode/orchestration/configurable_iteration.feature`

## Success Criteria

- Orchestrator delegates work to workers and monitors completion
- Orchestrator handles errors and preserves session state
- Orchestrator uses structured status to make decisions
- Developer can configure iteration limits and pause conditions

## Use Cases

- `specs/use-cases/orchestrated_iteration.yml` - Original use case (legacy)
