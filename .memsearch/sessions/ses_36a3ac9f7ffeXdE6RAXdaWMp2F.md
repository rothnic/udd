# Reconstruct T2: specs/system-boundary.yml from evidence (@Sisyphus-Junior subagent)

**ID**: ses_36a3ac9f7ffeXdE6RAXdaWMp2F
**Project ID**: ad761ea6174e58ed763fc75290c3f403ed51079d
**Created**: 2/25/2026, 11:07:35 AM
**Stats**: 3 files changed, +281 -0

---

## USER (11:07:35 AM)

# UDD Concept Model

## Overview

This document defines the canonical concept model for User Driven Development (UDD). It reconciles existing repository language (product/actors.md and journey artifacts) with SysML-informed traceability decisions captured during phase 2. The goal is to provide clear boundaries, reduce ambiguity for agents and humans, and enable deterministic linting and traceability rules.

## Concepts

### Persona
**Definition:** A human archetype representing a class of users, their goals, context, and constraints. Personas are written by product authors and live as guidance in product/actors.md. Use Personas to express needs and motivations, not implementation details.

**Scope:** User goals, context, motivations, common behaviors, skill levels, and success criteria relevant to product decisions and journey narratives.

**Anti-Scope:** Implementation details, technical constraints, acceptance criteria, test steps, or API contracts.

**Positive Example:** "Project manager who schedules daily planning, needs quick rescheduling and visibility into team load." (Recorded as a Persona in product/actors.md and referenced by journeys.)

**Negative Example:** "Persona lists the API endpoint to call for rescheduling." (Implementation detail - belongs to Component or Requirement.)

### Journey
**Definition:** An experience-first narrative describing how a Persona progresses through stages to achieve a goal. Journeys capture stages, touchpoints, channels, emotions, pain points, and success metrics.

**Scope:** High-level sequence of user activities, narrative context, goals, success metrics, and links to Use Cases and scenarios. Journeys must avoid implementation internals.

**Anti-Scope:** Detailed acceptance steps, scenario text, code, component design, and test assertions.

**Positive Example:** "Daily planning journey that describes stages: prepare, prioritize, assign, review, with success metric 'first plan created < 5 minutes'." (Stored under product/journeys/.)

**Negative Example:** "Journey includes step-by-step API interaction or SQL schema for storing plans." (Belongs to Component/Requirement.)

### Use Case
**Definition:** A mapping from a Journey or Persona need to one or more testable behaviors. Use Cases are YAML artifacts that reference scenario slugs (paths to .feature files) and provide the connection between narrative intent and executable scenarios.

**Scope:** Use-case identifier, description, referenced scenario paths, preconditions, and high-level constraints needed to implement the capability.

**Anti-Scope:** Full scenario text, implementation code, component internals, or low-level test steps. Use Cases must not duplicate scenario steps.

**Positive Example:** "use-cases/daily-reschedule.yml references specs/scheduling/reschedule.feature and lists precondition: user authenticated." 

**Negative Example:** "A Use Case containing Given/When/Then steps copied from a feature file." (Scenario text must live only in .feature files.)

### Scenario
**Definition:** The single source of acceptance for a behavior, written in Gherkin and stored in a .feature file. Scenarios are user-facing acceptance descriptions that drive E2E tests.

**Scope:** Gherkin steps (Given/When/Then), examples, data tables, and comments documenting user intent and edge cases. One scenario per file policy applies.

**Anti-Scope:** Implementation notes, test harness details, component wiring, or internal requirement mapping (those belong in Requirement or Component docs).

**Positive Example:** "specs/scheduling/reschedule.feature contains a scenario 'User reschedules an event' with Given/When/Then steps describing the expected behavior." 

**Negative Example:** "A scenario file that includes NodeJS test fixtures or API implementation snippets." (Implementation must be in tests or components.)

### Requirement
**Definition:** A developer-facing contract that links scenarios to implementation details: acceptance criteria mapping, API contracts, non-functional constraints, and traceability pointers to components and tests.

**Scope:** Detailed acceptance criteria, success metrics for implementation, performance and security constraints, mappings to scenario(s), and references to Component owners.

**Anti-Scope:** User narrative, journey stages, or scenario step text. Requirements must not replace scenarios as the acceptance source.

**Positive Example:** "Requirement: Reschedule API must respond within 300ms and update calendar entries atomically. Maps to specs/scheduling/reschedule.feature and component scheduling-service." 

**Negative Example:** "Requirement that copies Gherkin steps as acceptance criteria verbatim and uses them as the only test specification." (This duplicates scenario responsibility.)

### Component
**Definition:** A documented implementation unit (service, module, UI component, database schema) responsible for delivering parts of a Use Case or Requirement. Component docs map to Use Cases and include design, interfaces, owners, and test mappings.

**Scope:** Architecture diagrams, API/interface contracts, data models, owner, dependencies, and references to Requirements and tests.

**Anti-Scope:** User-facing narratives, journey storytelling, or scenario text. Components should not contain acceptance-step Gherkin.

**Positive Example:** "components/scheduling-service.md describes endpoints, data model, owner, and links to the reschedule Requirement and tests." 

**Negative Example:** "Component file that contains high-level user goals and emotional journey information instead of interfaces." (That belongs to Journey or Persona.)

### Test Review
**Definition:** A human or automated assessment that verifies tests and scenarios accurately represent intended behavior and meet quality guidelines. Test Reviews include review outcomes, issues found, and required remediation actions.

**Scope:** Test completeness, scenario coverage, mapping between scenarios and Use Cases, test data validity, and annotations for flaky or missing tests.

**Anti-Scope:** Implementation changes, component design decisions, or journey edits. Reviews may recommend changes but must not alter source artifacts directly.

**Positive Example:** "A review notes that reschedule.feature lacks an error-case scenario and files a remediation ticket linking to the Use Case." 

**Negative Example:** "A Test Review that edits a component's API contract directly instead of raising an issue and routing to the component owner." 

## Anti-Overlap Rules Summary
| Concept | Owns | Must NOT Contain |
|---------|------|------------------|
| Persona | User archetype, goals, context | Acceptance steps, API contracts, implementation details |
| Journey | Experience narrative, stages, metrics | Gherkin scenarios, component internals |
| Use Case | Links from journey to scenarios, preconditions | Scenario text (Given/When/Then), implementation code |
| Scenario | Gherkin acceptance text, examples | Component design, API contract, non-functional implementation notes |
| Requirement | Implementation acceptance criteria, test mapping | User narrative, journey stages, scenario Gherkin |
| Component | Design, interfaces, owners, data models | User journey, scenario steps, high-level narrative |
| Test Review | Review findings, coverage, remediation items | Direct code or spec edits; implementation changes |

## References
- .sisyphus/evidence/phase2/task-1-concepts.md
- .sisyphus/evidence/phase2/task-1-ambiguity.md
- .sisyphus/notepads/udd-sysml-traceability-phase2/decisions.md


# System boundary definition for UDD Phase 2
# Boundary subject must match decisions: 'udd-core'
boundary_subject: udd-core

# What is considered in scope for udd-core (traceability artifacts only)
in_scope:
  - specs/features
  - tests
  - specs/.udd/manifest.yml
  - product/journeys
  - docs/architecture/udd-concept-model.md

# Explicitly excluded from udd-core to avoid scope creep
out_of_scope:
  - implementation_code
  - deployment_infra
  - runtime_services

# External actors and systems that interact with udd-core
external_actors:
  - name: Reviewer
    type: human
    description: "Human reviewer who validates traceability and spec-to-test mapping"

external_systems:
  - id: CI_System
    type: external_system
    description: "Continuous Integration system that runs tests and checks (eg. GitHub Actions, Jenkins)"
  - id: Hosted_DB
    type: external_system
    description: "Hosted database used by implementation environments (treated as external to udd-core)"

# Validation rules used by udd lint / udd check
validation:
  - id: boundary_subject_exists
    description: "specs/system-boundary.yml must declare boundary_subject 'udd-core'"
    rule: "boundary_subject == 'udd-core'"
  - id: in_scope_enumerates_artifacts
    description: "in_scope must include spec artifacts: specs/features, tests, specs/.udd/manifest.yml"
    rule: "contains(in_scope, 'specs/features') and contains(in_scope, 'tests') and contains(in_scope, 'specs/.udd/manifest.yml')"
  - id: external_systems_minimum
    description: "There must be at least two external_system entries (CI_System, Hosted_DB recommended)"
    rule: "length(external_systems) >= 2"
  - id: no_external_as_in_scope
    description: "Detect misclassification where known external systems are placed in in_scope"
    rule: "not any(in_scope contains item where item in ['Hosted_DB','CI_System'])"

# Notes and references
notes:
  - source_evidence:
    - .sisyphus/evidence/phase2/task-2-boundary.md
    - .sisyphus/evidence/phase2/task-2-leak.md
    - .sisyphus/notepads/udd-sysml-traceability-phase2/decisions.md


# Traceability contract for UDD
# Defines artifact schemas, forward/reverse trace queries, and invalidation rules

artifacts:
  persona:
    required_fields: [id, name]
    optional_fields: [description, goals, contact]
    description: |
      Human actor definitions used by journeys and use_cases. "id" is canonical key.

  journey:
    required_fields: [id, actor, goal, steps]
    optional_fields: [summary, tags]
    description: |
      High-level user journeys. "actor" must reference persona.id. "steps" list use_case ids or human steps.

  use_case:
    required_fields: [id, name, actors, outcomes]
    optional_fields: [summary, tags]
    description: |
      Use cases connect journeys to scenarios. "actors" list persona ids. "outcomes" must include scenarios array.

  scenario:
    required_fields: [id, title, feature_path]
    optional_fields: [tags, description]
    description: |
      Scenario metadata representing a Gherkin scenario. "feature_path" points to the authoritative .feature file.

  e2e_test:
    required_fields: [id, scenario_path, status]
    optional_fields: [last_run, runner]
    description: |
      Test harness mapping to a scenario. "scenario_path" must match scenario.feature_path or contain scenario id in path.

  test_review:
    required_fields: [id, test_id, scenario_path, checks]
    optional_fields: [reviewer, created_at]
    description: |
      Review artifacts validating test fidelity against scenario. Must reference test_id and scenario_path.

  requirement:
    required_fields: [id, type, feature, description, scenarios]
    optional_fields: [priority, owner]
    description: |
      Requirements linked to scenarios. "scenarios" lists scenario ids covered by this requirement.

trace_queries:
  forward:
    - name: persona_to_journeys
      description: Find journeys for a persona
      query: "Find journey where journey.actor = <persona.id>"

    - name: journey_to_use_cases
      description: Resolve use_cases from journey.steps
      query: "For journey.id = <id>, map journey.steps -> use_case.id"

    - name: use_case_to_scenarios
      description: Find scenarios declared in a use_case outcome
      query: "Find scenario.id in use_case.outcomes[].scenarios where use_case.id = <id>"

    - name: scenario_to_tests
      description: Find tests that target a scenario
      query: "Find e2e_test where e2e_test.scenario_path contains <scenario.id> or equals <scenario.feature_path>"

    - name: requirement_impact
      description: From a requirement, find impacted scenarios, tests, journeys, personas
      query: "Find all e2e_test where requirement.scenarios contains matching scenario.id"

  reverse:
    - name: test_to_scenario
      description: Find scenario related to a test
      query: "Find scenario where scenario.feature_path = <e2e_test.scenario_path> or <e2e_test.scenario_path> contains scenario.id"

    - name: scenario_to_use_case
      description: Find use_cases that reference a scenario
      query: "Find use_case where use_case.outcomes[].scenarios contains <scenario.id>"

    - name: use_case_to_journeys
      description: Find journeys that include a use_case
      query: "Find journey where journey.steps references <use_case.id>"

    - name: journey_to_persona
      description: Find persona for a journey
      query: "Find persona where persona.id = <journey.actor>"

    - name: failing_tests_to_requirements
      description: From failing tests, find linked requirements
      query: "Find requirement where requirement.scenarios intersects (tests -> scenario ids)"

invalidation_rules:
  # Each rule declares which missing field(s) cause ERROR vs WARN and short explanation
  - artifact: persona
    missing:
      id: {level: ERROR, message: "Cannot reference persona in journey.actor; forward trace breaks"}
      name: {level: WARN, message: "Display name unavailable for journey documentation"}

  - artifact: journey
    missing:
      actor: {level: ERROR, message: "Cannot trace to persona; reverse trace from journey fails"}
      steps: {level: ERROR, message: "Journey has no actionable steps; cannot map to use_cases"}

  - artifact: use_case
    missing:
      id: {level: ERROR, message: "Cannot reference use_case in journey.steps; forward trace breaks"}
      actors: {level: ERROR, message: "Cannot trace to persona; requirement-to-persona trace fails"}
      outcomes: {level: ERROR, message: "No scenario references; use_case not connected to graph"}

  - artifact: scenario
    missing:
      id: {level: ERROR, message: "Cannot reference scenario in use_case.outcomes; graph edge missing"}
      feature_path: {level: ERROR, message: "Cannot locate scenario file for test mapping"}

  - artifact: e2e_test
    missing:
      scenario_path: {level: ERROR, message: "Test not linked to scenario; traceability broken"}
      status: {level: ERROR, message: "Cannot determine if test is passing for reverse trace"}

  - artifact: test_review
    missing:
      test_id: {level: ERROR, message: "Review not linked to test; quality gate ineffective"}
      scenario_path: {level: ERROR, message: "Cannot verify scenario fidelity; mapping unconfirmed"}

  - artifact: requirement
    missing:
      feature: {level: ERROR, message: "Cannot group requirements; impact analysis incomplete"}
      description: {level: ERROR, message: "No specification available; implementation guidance missing"}

rules_version: 1


