# Canonical Derivation Model

This document defines the canonical derivation chain used across UDD: how high-level product intent is turned into testable artifacts and, ultimately, implementation requirements. It codifies the required hop sequence used by trace queries in specs/traceability-contract.yml.

## Derivation Chain

Persona → Journey → Use Case → Scenario → E2E Test → Component → Requirement

Each arrow is a required hop. Tools and validation rules rely on these fields and ids to build forward and reverse trace graphs.

## Layer Definitions

- Persona
  - Role: Human archetype and source of user goals and context.
  - Location: product/actors.md (or journey frontmatter)
  - Key fields: id, name, description, goals
  - Must not contain implementation details.

- Journey
  - Role: Experience narrative that maps a Persona to one or more Use Cases.
  - Location: product/journeys/*.md
  - Key fields: id, actor (persona.id), goal, steps (list of use_case ids)
  - Steps must reference Use Case ids, not scenario files.

- Use Case
  - Role: Connects Journey intent to executable scenarios. Declares outcomes and referenced scenarios.
  - Location: specs/use-cases/*.yml
  - Key fields: id, name, actors, outcomes (with scenarios[])
  - Must not duplicate Gherkin scenario text.

- Scenario
  - Role: Single source of acceptance, expressed in Gherkin (.feature).
  - Location: specs/features/**/*.feature
  - Key fields: id (slug), title, feature_path
  - Drives E2E tests.

- E2E Test
  - Role: Test harness mapping that implements Scenario steps and verifies behavior.
  - Location: tests/e2e/**/*.e2e.test.ts
  - Key fields: id, scenario_path, status
  - Must reference scenario by id or feature_path.

- Component
  - Role: Implementation unit(s) responsible for delivering Use Cases and Requirements.
  - Location: specs/components/*.md or .yml
  - Key fields: id, name, responsibilities, public_interfaces, supported_use_cases, supported_scenarios
  - Components map to Requirements and E2E tests for impact analysis.

- Requirement
  - Role: Developer-facing contract that specifies acceptance criteria, implementation notes, and links to scenarios and components.
  - Location: specs/requirements/*.yml
  - Key fields: id, type, feature, description, scenarios, components

## How Validation Uses the Chain

The traceability contract (specs/traceability-contract.yml) defines forward and reverse queries that assume the canonical hop sequence. Validation rules mark missing fields as ERROR or WARN when a hop is broken. Tools must not accept direct references that skip layers unless a documented, approved exception exists.

## Worked Example (Happy Path)

Example: Team Member captures a task via CLI.

1) Persona

   - product/actors.md
   - id: "team-member"

2) Journey

   - product/journeys/daily-capture.md
   - id: "daily-capture-workflow"
   - actor: "team-member"
   - steps: ["capture_task"]

3) Use Case

   - specs/use-cases/capture_task.yml
   - id: "capture_task"
   - outcomes.scenarios: ["udd/cli/inbox/add_item_via_cli"]

4) Scenario

   - specs/features/udd/cli/inbox/add_item_via_cli.feature
   - id: "udd/cli/inbox/add_item_via_cli"

5) E2E Test

   - tests/e2e/udd/cli/inbox/add_item_via_cli.e2e.test.ts
   - scenario_path points to feature file

6) Component

   - specs/components/cli-command-service.md
   - id: "cli-command-service"
   - supported_scenarios: ["udd/cli/inbox/add_item_via_cli"]

7) Requirement

   - specs/requirements/persist_item_with_defaults.yml
   - id: "persist_item_with_defaults"
   - scenarios: ["udd/cli/inbox/add_item_via_cli"]
   - components: ["cli-command-service", "item-repository"]

This chain is also recorded as evidence in .sisyphus/evidence/phase2/task-4-chain.md. Each link is validated by the trace queries in specs/traceability-contract.yml.

## Anti-Example (Skipped Layer)

Invalid pattern: Journey directly references a Scenario path, skipping Use Case.

Example (invalid):

product/journeys/direct-capture.md

```yaml
id: "direct-capture-workflow"
actor: "team-member"
steps:
  - "specs/features/udd/cli/inbox/add_item_via_cli.feature"  # INVALID: direct scenario reference
```

Why this is rejected:

- The forward trace query journey_to_use_cases expects use_case ids in journey.steps. A direct scenario path returns no use_case, causing the trace to fail.
- Skipping Use Case removes the mapping between narrative intent and scenario scopes, creating semantic ambiguity when a scenario serves multiple use cases.
- Validation rules in specs/traceability-contract.yml flag this as ERROR: journey.steps missing use_case id.

Alternative: update journey.steps to include the use_case id (e.g., "capture_task") and ensure the Use Case lists the scenario.

Another invalid skip: E2E Test → Requirement (Component skipped). Every test must map to a Component before linking to Requirements to preserve ownership and impact analysis.

## Exception Policy

Only documented exceptions are allowed and must be approved and recorded in the evidence directory. Automatic validation rejects skips as described above. See .sisyphus/evidence/phase2/task-4-skipped-layer.md for the anti-example evidence and corrective actions.

## Traceability Queries

Use the trace queries in specs/traceability-contract.yml. Common queries:

- persona_to_journeys: find journeys where journey.actor = <persona.id>
- journey_to_use_cases: map journey.steps -> use_case.id
- use_case_to_scenarios: read use_case.outcomes[].scenarios
- scenario_to_tests: find e2e_test where scenario_path contains scenario.id
- requirement_impact: find e2e_tests and personas impacted by a requirement via scenario links

For automated checks, tools should call these trace queries and treat missing hops per invalidation_rules in the contract.

## References

- docs/architecture/udd-concept-model.md
- specs/traceability-contract.yml
- .sisyphus/evidence/phase2/task-4-chain.md
- .sisyphus/evidence/phase2/task-4-skipped-layer.md
