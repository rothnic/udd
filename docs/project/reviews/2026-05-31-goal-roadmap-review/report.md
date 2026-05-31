# Independent Goal Roadmap Review

Date: 2026-05-31

## Purpose

Review the current UDD goals, roadmap, and status output after the focused
OpenCode/shared integration salvage landed, then recommend a new goal set that
is large enough for team execution while remaining measurable and reviewable.

## Inputs Reviewed

- `goals/README.md`
- `goals/005-pr45-side-branch-stack-audit.md`
- `goals/006-source-of-truth-foundation.md`
- `specs/VISION.md`
- `specs/roadmap.yml`
- `docs/project/reviews/2026-05-19-pr45-stack-audit/report.md`
- `docs/project/reviews/2026-05-24/NEXT_WORK_CHUNK_2026-05-24.md`
- `docs/project/reviews/2026-05-26/TRACEABILITY_MODEL_RECOMMENDATION.md`
- `docs/project/reviews/2026-05-29/INDEPENDENT_REVIEW_SOURCE_OF_TRUTH_RECONCILIATION.md`
- `./bin/udd status` on 2026-05-31

## Current Assessment

The existing numbered goals were useful for the PR #45 salvage sequence, but
they are no longer the right planning horizon for the next phase of work.
Goal 005 is an audit and Goal 006 is a narrow source-of-truth foundation slice.
Both should remain as historical context, but neither gives a team a two-week
execution package with clear subtasking, measurable outcomes, and cross-cutting
product impact.

The roadmap now needs a strategic goal portfolio built around the durable UDD
product promise:

```text
Objective -> Use Case -> Scenario -> E2E Test
```

Journey and SysML-informed notes should remain optional discovery context unless
a specific goal promotes them into stricter machine-checked behavior.

## Status Signals

`./bin/udd status` reported:

- 37/37 outcomes unsatisfied.
- 36 stale scenarios.
- Multiple use cases with missing scenarios, especially test governance,
  recovery, and future workflow areas.
- Active roadmap phase: Phase 3, Agent Integration.

This means the next goals must not only add new ideas. They must reduce status
noise, strengthen traceability, and make agent execution auditable.

## Recommended Goal Portfolio

The new goals should be treated as team-sized, two-week increments. Each goal
has an explicit proof gate, 10-15 subtasks, and reviewer blocking criteria.

| Goal | Focus | Primary Payoff |
| --- | --- | --- |
| 007 | Product source-of-truth authoring workbench | Make spec-first authoring concrete and discoverable |
| 008 | Traceability graph and impact analysis engine | Turn scattered files into queryable project intelligence |
| 009 | Scenario lifecycle and test governance | Convert stale/missing scenario noise into actionable gates |
| 010 | Shared agent execution control plane | Make Codex/OpenCode integration adapter-neutral and reviewable |
| 011 | Recovery, doctor, and remediation suite | Diagnose and repair drift without unsafe mutation |
| 012 | Rebuild proof and reference implementation | Prove UDD can preserve behavior across rebuilds |

## Why This Set

1. It matches the vision instead of only finishing side-branch salvage.
2. It creates meaningful parallel work for engineers across docs, CLI, tests,
   integration tooling, and examples.
3. It keeps the repo's thin traceability model central.
4. It avoids reintroducing Codex goal-command coupling while still allowing
   adapter-specific integrations.
5. It gives reviewers hard blocking criteria instead of vague roadmap intent.

## Recommendation

Adopt goals 007-012 as the new strategic execution portfolio. Keep goals 005
and 006 as historical/salvage context, but use the new set for team planning
after the current PR #45 salvage sequence.

## Post-Draft Independent Review Notes

An independent review of the draft goal set identified three corrections before
publication:

- Goal 009 must not make ignored local review state authoritative. Review
  decisions that affect status or gates must be source-controlled evidence; any
  local cache must be non-authoritative and regenerable.
- Goals 008-011 must require spec-first updates before CLI or integration
  implementation.
- Goal 010 verification must prove its own status, next-work, issues, evidence,
  and OpenCode classification claims instead of relying only on broad status and
  test commands.

Those corrections are reflected in the final goal files.
