# Next Work Chunk Recommendation (2026-05-24)

## Objective

Recommend the next smallest, high-leverage chunk of work after recent PR activity, aligned with UDD's project goals and user needs.

## Inputs Reviewed

- Current status snapshot (`npm run udd -- status`) on 2026-05-24.
- Recent local commit/PR history from `git log --oneline --decorate -n 20`.
- Prior assessment and audit artifacts:
  - `docs/project/reviews/2026-05-11/GOAL_GAP_ASSESSMENT_2026-05-11.md`
  - `docs/project/reviews/2026-05-11/ROADMAP_TRACKER_2026-05-11.md`
  - `docs/project/reviews/2026-05-19-pr45-stack-audit/report.md`
  - `goals/006-source-of-truth-foundation.md`
- Current source-of-truth docs:
  - `README.md`
  - `specs/VISION.md`
  - `specs/use-cases/*.yml`

## What Recent Work Indicates

1. **PR #46 (Codex hooks) and setup/docs cleanup landed**
   - Local invocation clarity and hook installation improved.
2. **PR #48 added the side-branch stack audit and follow-up goals**
   - A concrete salvage sequence now exists, with source-of-truth foundation first.
3. **Status still shows 26/26 outcomes unsatisfied and 30 stale scenarios**
   - Planning clarity has improved, but outcomes are still not yet implemented/verified.

## Reconciliation: Current vs Future State Model

## Current-state model (implemented behavior)

From `udd status` and existing files, the model that is currently operational is:

- `specs/use-cases/*.yml` define outcomes and map to scenario IDs.
- `specs/features/**` define scenario behavior.
- `tests/e2e/**` verify those scenarios.

This is the chain the CLI can evaluate today.

## Future-state model (intended target)

Across roadmap/audit/goal docs, the intended target is a canonical source-of-truth graph:

**objective (roadmap) -> use case -> product journey -> scenario -> e2e test**

with explicit schema/contracts such as:

- `product/*`
- `specs/roadmap.yml`
- `specs/system-boundary.yml`
- `specs/traceability-contract.yml`
- `specs/journey-map.schema.yml`

## Documented drift to reconcile

1. **Journey-first README vs use-case-first status reality**
   - README describes journey-driven generation as canonical.
   - Current status outputs and present files are still dominated by use-case + features mapping.
2. **Branch source-of-truth drift (`main` vs `master`)**
   - `specs/VISION.md` still references `main` workflow language.
   - Audit/goal docs record repository default branch as `master` (as of 2026-05-19).
3. **Traceability depth mismatch**
   - Tracker marks canonical graph work done at lint layer, but objective-level rollups and canonical-mode clarity are still pending.

## User-Need Lens

Primary users and immediate needs:

- **Spec authors/developers** need one unambiguous canonical structure.
- **Maintainers/leads** need objective-level health summaries they can trust.
- **Agents** need deterministic representation rules to avoid creating drift.

The most acute user pain is uncertainty about which artifacts are authoritative during feature authoring and review.

## Recommended Next Chunk (Pick Up Now)

## Chunk Name
**Source-of-Truth Reconciliation Slice 1: Canonical model declaration + compatibility policy**

## Why this chunk next

- It converts the existing “future-state intent” into an explicit, repo-local policy.
- It reduces user confusion before deeper CLI/schema migrations.
- It keeps scope narrow and directly supports Goal 006.

## Scope (small and focused)

1. **Canonical declaration doc update**
   - Add one explicit “Canonical Traceability Model” section in `README.md` (or linked source-of-truth doc) that states:
     - target chain,
     - canonical artifacts,
     - temporary compatibility layer.
2. **Compatibility policy documentation**
   - Define whether `specs/use-cases + specs/features` is:
     - canonical now, with future migration plan, or
     - compatibility mode pending product/journey foundation merge.
3. **Branch naming source-of-truth decision**
   - Resolve `main` vs `master` conflict in docs, or explicitly document a planned rename.
4. **Status messaging alignment (minimal)**
   - Add a compact status note or docs section explaining what status does/does not yet represent in the future model.

## Explicitly out of scope for this chunk

- Broad CLI behavior rewrites.
- OpenCode orchestration features.
- Test-governance gates.
- Large-scale file moves/migrations.

## Acceptance Criteria

1. A contributor can identify canonical traceability rules in one location without ambiguity.
2. The repository documents the active compatibility mode and migration intent.
3. Branch naming source-of-truth no longer conflicts silently.
4. Goal 006 in-scope foundational files remain the next implementation increment.

## Suggested Implementation Order

1. Draft reconciliation note and canonical declaration.
2. Align `README.md` + `specs/VISION.md` references.
3. Update goal/review links for consistency.
4. Run `npm run udd -- status` and `npm run udd -- lint` to confirm no unintended behavioral regressions.

## Follow-on Chunk (After this one)

**Source-of-Truth Foundation Slice 2: Import foundational product/roadmap/traceability files from Goal 006 scope**

## Decision

**Pick up Source-of-Truth Reconciliation Slice 1 immediately** to remove ambiguity, then execute Goal 006 foundation import with reduced risk.
