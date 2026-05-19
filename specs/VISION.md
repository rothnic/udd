---
id: "udd_tool"
name: "User Driven Development Tool"
version: "0.0.1"
goals:
  - "Make stakeholder journeys the durable source of product intent."
  - "Derive testable BDD scenarios from user-visible outcomes."
  - "Verify implementations through independent tests that exercise behavior from stakeholder perspectives."
  - "Preserve traceability from persona and journey through use case, scenario, test, component, and requirement."
  - "Give human and AI contributors a concise, deterministic project state model for safe iteration."
use_cases:
  - "validate_specs"
  - "run_tests"
  - "orchestrated_iteration"
  - "track_test_quality"
  - "prevent_regression"
  - "manage_test_lifecycle"
  - "validate_phase_consistency"
success_metrics:
  - "A project can be understood and rebuilt from product intent, scenarios, and traceable requirements without relying on hidden implementation memory."
  - "Current-phase stub tests are blocked before they create false confidence."
  - "Agent integrations reuse shared UDD utilities instead of duplicating integration-specific workflows."
  - "Vision remains stable while roadmap state changes in specs/roadmap.yml."
---

# Vision

UDD exists to make software rebuildable from stakeholder intent.

The durable product record is the chain from persona and journey through use
case, scenario, independent verification, component responsibility, and
implementation requirement. A contributor should be able to inspect that chain
and understand what the system must do, why it matters, how it is verified, and
which implementation surface is responsible.

UDD is not a project tracker, test runner, or code generator. It is the control
layer that keeps intent, acceptance criteria, independent tests, and
implementation work aligned.

## Future State

In the target state, a project using UDD can be rebuilt from its source specs:

1. Stakeholders define personas, journeys, outcomes, and constraints.
2. Use cases map each journey outcome to executable behavior.
3. BDD scenarios describe acceptance from the stakeholder perspective.
4. Independent E2E tests verify behavior without depending on implementation
   internals.
5. Components and requirements document how the system satisfies the verified
   behavior.
6. Agent integrations use the same project-state and traceability utilities, so
   Codex, OpenCode, and future integrations behave consistently.

## Backlog Foundation

When no backlog is available, new backlog items should be derived from this
vision first. Agents should use this document to understand the project goal,
then derive structured roadmap items, use cases, scenarios, tests, components,
and requirements that keep work aligned with the long-term direction.

Derived backlog items should point back to the relevant vision goal or success
metric, then become concrete in `specs/roadmap.yml`, `product/journeys/`,
`specs/use-cases/`, and `specs/features/`.

## State Boundaries

This file intentionally does not declare the current phase, active branch, or
progress status. Time- and progress-dependent planning belongs in
`specs/roadmap.yml`, generated status output, and goal documents under
`goals/`.

The repository default branch was verified as `master` on 2026-05-29. Branch
renames must update GitHub repository settings and branch-sensitive goal or
workflow documents together; this vision file should not carry a separate
branching strategy.

`specs/VISION.md` should change only when the long-term product vision changes.
