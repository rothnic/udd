# Journey: Beads-Based Plan Workflow

**Actor:** Developer
**Actor IDs:** developer
**Goal:** Use beads (DAG-based work units) to model and execute plans from drift with proper dependency tracking and parallelization

## Context

The current plan system uses a simple list of issues with basic dependency tracking. We need a more robust system that:
- Models work as a Directed Acyclic Graph (DAG)
- Tracks dependencies explicitly (what blocks what)
- Supports parallel vs serial execution modes
- Provides verification criteria for each work unit
- Enables worker/agent assignment and progress tracking

## Steps

1. **Understand beads concept** → `specs/features/udd/beads/concept.feature`
2. **Create bead-based plan** → `specs/features/udd/beads/create_plan.feature`
3. **Track bead dependencies** → `specs/features/udd/beads/dependency_management.feature`
4. **Execute beads with proper ordering** → `specs/features/udd/beads/execution.feature`
5. **Verify bead completion** → `specs/features/udd/beads/verification.feature`

## Success Criteria

- Beads are created from drift issues with proper DAG structure
- Dependencies are analyzed and modeled (test failures depend on scenario fixes)
- Execution modes are respected (parallel, serial, exclusive)
- Verification criteria can be checked automatically or manually
- Workers can query for ready beads and mark them complete
- Full traceability from drift issue → bead → completion

## Related

- Plan-process documentation is deferred to #50.
- Implementation is deferred to #52.
- Replaces/supersedes the simple plan backlog with richer DAG model

## Phase

Phase 3 - Agent Integration

## Notes

Beads provide a **work orchestration primitive** that can be used beyond just drift plans:
- Feature implementation workflows
- Refactoring campaigns
- Multi-step migrations
- Any work with dependencies and verification steps

The name "bead" comes from the idea of stringing together work units like beads on a necklace - each one connected to the next, but also able to be viewed as individual units.
