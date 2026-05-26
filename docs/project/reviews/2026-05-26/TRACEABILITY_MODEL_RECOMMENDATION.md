# Traceability Model Recommendation (2026-05-26)

## Why This Exists

The project goal is tool-agnostic, user-centered specs that define behavior independent of implementation language, so the system can be rebuilt while preserving behavior guarantees.

This review evaluates existing project examples and recommends the thinnest model that preserves:

- user intent clarity,
- executable verification,
- manageable traceability,
- and agent-assisted gap analysis without introducing overlapping artifact layers.

## Design Principle

Use the **thinnest viable layered chain**:

**Objective -> Use Case -> Scenario -> Test**

with **Journey as optional authoring context** (not a mandatory extra layer in every flow).

Why this is thinnest:

1. Objective gives planning context (why).
2. Use case groups outcomes (what value).
3. Scenario expresses observable behavior (what system does).
4. Test proves behavior (is it true now).
5. Journey remains highly valuable, but can be treated as optional/source context where it improves discovery rather than a required mechanical link in every repo state.

This follows project guidance to avoid unnecessary extra layers while still using SysML-informed thinking.

## What Existing Docs Already Say

- README describes journey-first workflow (`product/journeys -> specs -> tests`) and user-outcome framing.
- Vision emphasizes specs as source of truth and simple/deterministic workflow.
- SysML guide explicitly warns against adding overlapping artifact layers and promotes richer feature scenarios instead.
- Roadmap tracker already defines canonical traceability in lint/status terms as objective -> use case -> scenario -> e2e.

Taken together, the repository already leans toward a thin operational chain, but with documentation drift on where journeys are mandatory versus contextual.

## Actual Project Examples Reviewed

## Example A: `run_tests` (clear and thin)

Artifacts:

- Use case: `specs/use-cases/run_tests.yml`
- Scenario: `specs/features/udd/cli/run_tests.feature`
- Test: `tests/e2e/udd/cli/run_tests.e2e.test.ts`

What works well:

- Clean mapping from outcome -> scenario ID.
- Scenario is user-observable behavior.
- Test imports feature and validates CLI behavior from user perspective.

Where it can improve:

- Some assertions are implementation-help text checks (e.g., help output) rather than real behavior execution.

Verdict: **Strong model shape** for tool-agnostic specs.

## Example B: `orchestrated_iteration` (rich but mixed)

Artifacts:

- Use case: `specs/use-cases/orchestrated_iteration.yml`
- Scenario file: `specs/features/opencode/orchestration/iterate_until_complete.feature`
- Test: `tests/e2e/opencode/orchestration/iterate_until_complete.e2e.test.ts`

What works well:

- Clear actor-driven user/developer intent.
- Scenario structure supports PM-style analysis and iterative orchestration expectations.

Where complexity appears:

- Significant simulation in tests and acceptance of dual outcomes reduces strictness of pass/fail signal.
- Model can drift from user-observable acceptance if too much internal orchestration detail dominates.

Verdict: **Useful for exploration**, but should be tightened to preserve user-observable contract semantics.

## Example C: SysML-informed docs examples (best discovery behavior)

Artifacts:

- `docs/sysml-informed-discovery.md`
- `docs/example-features/export_data.feature`
- `docs/example-features/password_reset.feature`

What works well:

- Excellent pattern for PM/agent discovery questioning (who/what/why/alternatives/edge cases).
- Keeps details in scenario comments rather than introducing new persistent artifact layers.

Verdict: **Best model for discovery and authoring quality** when paired with the thin traceability chain.

## Recommended Model for the Project

## 1) Canonical persistent traceability (machine-checked)

Required links:

1. Objective (roadmap item)
2. Use case (`specs/use-cases/*.yml`)
3. Scenario ID (`specs/features/**/*.feature`)
4. E2E test (`tests/e2e/**/*.test.ts`)

This is what lint/status should enforce strictly.

## 2) Optional narrative/discovery context (human-guided)

- Journey docs (`product/journeys/*.md`) and SysML-style comments are strongly recommended when creating/changing features.
- They are not required to block every build until Goal 006 foundation import is completed and conventions are finalized.

## 3) Agent PM workflow

For a human collaborating with an agent acting as PM:

1. Agent interrogates user need (actor, job, success criteria, constraints, alternatives).
2. Agent drafts/updates scenario(s) first (tool-agnostic behavior contract).
3. Tests fail (red) against changed spec.
4. Implementation changes to satisfy tests (green).
5. Agent reports traceability and uncovered gaps.

This preserves "specs guide behavior" while keeping process lightweight.

## How to Avoid Overlap Going Forward

1. Keep one canonical graph for enforcement.
2. Keep journey/SysML context in comments/docs, not duplicate schemas.
3. Require scenario IDs to be stable and referenced from use cases.
4. Prefer user-observable Then assertions over internal implementation detail.
5. Add explicit gap reporting in status for:
   - unlinked scenarios,
   - use cases without tests,
   - objectives without active use cases.

## Next Concrete Increment

Implement **Source-of-Truth Reconciliation Slice 1** as a docs+policy increment:

- Add one canonical "Traceability Contract" section in top-level docs.
- Define compatibility mode explicitly (current use-case/feature/test operational chain + journey context).
- Add one worked "change existing feature" example:
  - edit scenario to intentionally fail test,
  - implement,
  - return to green,
  - show trace links.

This gives users a clear, practical, non-overlapping model before deeper schema/CLI migrations.
