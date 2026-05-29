# Goal: Source-of-Truth Reconciliation and Spec-First Change Loop

Date: 2026-05-26  
Status: Proposed (next execution target)

## Objective

Establish one explicit, tool-agnostic traceability contract that keeps specs as the user-facing behavior source of truth while minimizing artifact overlap.

This goal moves the project from analysis-only docs into an executable work target with concrete deliverables.

## Problem This Goal Solves

Current docs show drift between:

- journey-first guidance in `README.md`,
- use-case/scenario-centric operational status,
- and future source-of-truth foundation plans.

Without a single declared contract + compatibility policy, maintainers and agents can create overlapping representations.

## Target Model (thin, enforceable)

Canonical enforced chain:

1. Objective
2. Use Case
3. Scenario
4. E2E Test

Optional contextual layer:

- Journey + SysML-informed analysis notes, used to improve discovery quality and scenario completeness.

## Deliverables

1. **Canonical contract declaration**
   - Add one source-of-truth section in top-level docs that states:
     - canonical chain,
     - what is strictly lint/status enforced,
     - what is optional context.

2. **Compatibility mode declaration**
   - State clearly how current repo state maps to target model during transition.
   - Include explicit “do not duplicate layers” guidance.

3. **Worked change-loop example (red -> green)**
   - Add one concrete example showing:
     - modify scenario first,
     - observe failing test,
     - implement behavior,
     - return to passing,
     - confirm trace links.

4. **Branch naming source-of-truth note**
   - Resolve/document `main` vs `master` policy to avoid command ambiguity.

## Acceptance Criteria

- A contributor can answer “what is canonical?” from one document section.
- A contributor can follow one concrete example of spec-first feature modification (red -> green).
- Documentation explicitly distinguishes required traceability links vs optional context.
- Documentation references existing foundation goal scope for next implementation slice.

## Out of Scope

- Broad CLI rewrites.
- Large-scale migration of all current specs.
- OpenCode orchestration behavior changes.

## Execution References

- `docs/project/reviews/2026-05-26/TRACEABILITY_MODEL_RECOMMENDATION.md`
- `docs/project/reviews/2026-05-24/NEXT_WORK_CHUNK_2026-05-24.md`
- `goals/006-source-of-truth-foundation.md`
- `docs/project/reviews/2026-05-19-pr45-stack-audit/report.md`
- `docs/project/reviews/2026-05-11/ROADMAP_TRACKER_2026-05-11.md`
- `docs/sysml-informed-discovery.md`

## Verification Commands

```bash
npm run udd -- status
npm run udd -- lint
```

Record baseline failures explicitly in execution PR notes if they are unrelated to docs edits.
