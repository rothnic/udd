# undefined (@Sisyphus-Junior subagent)

**ID**: ses_36a683ecfffe1GFR8Wx0sHePXA
**Project ID**: ad761ea6174e58ed763fc75290c3f403ed51079d
**Created**: 2/25/2026, 10:17:56 AM
**Stats**: 6 files changed, +9 -642

---

## USER (10:17:56 AM)

# Journey Structured Map Example
# Conforming example demonstrating valid journey-to-use-case mapping.

journey_map:
  id: new-user-onboarding
  title: New User Quick Start
  actor: team-member
  goal: Sign up and start using the app

  trigger_conditions:
    - type: event
      description: User visits app for first time

  steps:
    - sequence: 1
      name: User signs up
      use_case_ref: user-signup
      entry_conditions:
        - type: state
          description: User is unauthenticated
      exit_conditions:
        - type: event
          description: Account created and verified
      success_metrics:
        - id: signup-completion
          description: User completes signup flow
          target: ">80%"
          metric_reference: analytics.signup_completed

    - sequence: 2
      name: User creates first item
      use_case_ref: create-first-item
      entry_conditions:
        - type: state
          description: User is authenticated with verified account
      exit_conditions:
        - type: event
          description: Item appears in inbox
      success_metrics:
        - id: first-item-creation
          description: User creates first item within 5 minutes
          target: ">50%"
          metric_reference: analytics.first_item_created

    - sequence: 3
      name: User organizes items
      use_case_ref: organize-items
      entry_conditions:
        - type: state
          description: User has at least one item in inbox
      exit_conditions:
        - type: event
          description: Items are tagged or prioritized
      success_metrics:
        - id: organization-rate
          description: Users who organize at least one item
          target: ">30%"

  success_metrics:
    - id: onboarding-completion
      description: Users who complete onboarding within 10 minutes
      target: ">60%"
      metric_reference: analytics.onboarding_completed

validation_rules: []


# Journey Structured Map Schema
# Defines a traceable mapping between journey steps and use cases.
# Purpose: Enable forward/reverse traceability queries from journey to use_case layer.
# Alignment: Implements trace query "journey_to_use_case" from specs/traceability-contract.yml

# ============================================================================
# SCHEMA OVERVIEW
# ============================================================================
# This schema complements the Journey Narrative Model (docs/architecture/journey-narrative-model.md)
# by focusing on traceable linkages rather than experience timeline. The narrative model
# captures user-observable touchpoints; this map captures the structural trace graph.

# Key design principles:
# - Steps must reference use_case.id (required) to maintain forward trace integrity
# - Each step has explicit sequence for ordered traversal
# - Conditions (trigger/entry/exit) are optional but enable conditional journeys
# - Success metrics are per-step to enable granular measurement
# - Validation rules documented for missing/invalid use_case references

# ============================================================================
# ROOT STRUCTURE
# ============================================================================

$schema: "http://json-schema.org/draft-07/schema#"
title: Journey Structured Map
description: Traceable mapping between journey steps and use cases

type: object
properties:
  journey_map:
    type: object
    description: Container for journey-to-use-case mapping
    properties:
      id:
        type: string
        description: Unique journey identifier (kebab-case slug)
        pattern: "^[a-z0-9]+(-[a-z0-9]+)*$"
        example: new-user-onboarding

      title:
        type: string
        description: Human-readable journey title
        example: New User Onboarding

      actor:
        type: string
        description: Reference to persona id who performs this journey
        pattern: "^[a-z0-9]+(-[a-z0-9]+)*$"
        example: team-member

      goal:
        type: string
        description: Outcome the user wants to achieve
        example: Sign up and start using the app

      trigger_conditions:
        type: array
        description: Conditions that initiate this journey
        items:
          $ref: "#/definitions/condition"

      steps:
        type: array
        description: Ordered sequence of journey steps with use_case references
        items:
          $ref: "#/definitions/step"
        minItems: 1

      success_metrics:
        type: array
        description: Journey-level success measurements
        items:
          $ref: "#/definitions/success_metric"

    required:
      - id
      - actor
      - goal
      - steps
    additionalProperties: false

  validation_rules:
    type: array
    description: Rules for validating journey map integrity and traceability
    items:
      type: object
      properties:
        id:
          type: string
          example: UC001
        name:
          type: string
          example: use_case_reference_required
        description:
          type: string
        severity:
          type: string
          enum: [error, warning]
        check:
          type: string
        rationale:
          type: string

definitions:

  journey_id:
    type: string
    pattern: "^[a-z0-9]+(-[a-z0-9]+)*$"
    description: Unique journey identifier in kebab-case
    example: new-user-onboarding

  persona_id:
    type: string
    pattern: "^[a-z0-9]+(-[a-z0-9]+)*$"
    description: Reference to persona.id from product/actors.md
    example: team-member

  use_case_id:
    type: string
    # Accept both kebab-case and underscore separators to ease migration from legacy ids.
    # Canonical form: kebab-case (see notepads decision). Pattern allows a-z0-9 with '-' or '_' separators.
    pattern: "^[a-z0-9]+(?:[-_][a-z0-9]+)*$"
    description: Reference to use_case.id from specs/use-cases/ (kebab-case canonical; underscores allowed for migration)
    example: capture-ideas

  condition:
    type: object
    description: A condition that triggers or gates journey progression
    properties:
      type:
        type: string
        enum: [event, state, time, user_action]
        description: Category of condition
      description:
        type: string
        description: Human-readable condition description
      expression:
        type: string
        description: Optional machine-readable expression
    required:
      - type
      - description

  step:
    type: object
    description: A single step in the journey, referencing a use_case
    properties:
      sequence:
        type: integer
        minimum: 1
        description: Explicit sequence number for ordering
        example: 1

      name:
        type: string
        description: Brief step name (narrative summary, not Gherkin)
        example: User signs up

      use_case_ref:
        # Reference the shared use_case_id definition which allows kebab-case and underscore separators.
        $ref: "#/definitions/use_case_id"

      entry_conditions:
        type: array
        description: Conditions required to enter this step
        items:
          $ref: "#/definitions/condition"

      exit_conditions:
        type: array
        description: Conditions that signal step completion
        items:
          $ref: "#/definitions/condition"

      success_metrics:
        type: array
        description: Step-level success measurements
        items:
          $ref: "#/definitions/success_metric"

      notes:
        type: string
        description: Optional notes about step execution

    required:
      - sequence
      - name
      - use_case_ref

  success_metric:
    type: object
    description: A measurable outcome indicator
    properties:
      id:
        type: string
        pattern: "^[a-z0-9]+(-[a-z0-9]+)*$"
        description: Metric identifier
        example: signup-completion-rate

      description:
        type: string
        description: What success looks like
        example: User completes signup within 5 minutes

      target:
        type: string
        description: Target value or threshold
        example: ">80%"

      metric_reference:
        type: string
        description: Optional reference to analytics or monitoring metric
        example: analytics.signup_confirmed

    required:
      - id
      - description

# ============================================================================
# VALIDATION RULES
# ============================================================================
# These rules can be enforced via udd lint or CI checks.
# Missing use_case_ref is an ERROR (blocks forward trace).

validation_rules:
  - id: UC001
    name: use_case_reference_required
    description: Each step MUST reference a valid use_case.id
    severity: error
    check: |
      For each step in journey_map.steps:
      - use_case_ref MUST be present and non-empty
      - use_case_ref MUST match pattern: ^[a-z0-9]+(-[a-z0-9]+)*$
      - use_case_ref SHOULD correspond to an existing use_case in specs/use-cases/
    rationale: |
      Without use_case_ref, forward trace journey_to_use_case cannot resolve.

  - id: UC002
    name: steps_ordered_sequentially
    description: Steps must have explicit sequence numbers starting from 1
    severity: error
    check: |
      - Each step MUST have a sequence number (integer >= 1)
      - Sequence numbers SHOULD be consecutive (1, 2, 3...)
      - Gaps in sequence indicate missing steps

  - id: UC003
    name: persona_reference_valid
    description: Journey actor must reference valid persona.id
    severity: error
    check: |
      - actor field MUST be non-empty string
      - actor SHOULD correspond to existing persona in product/actors.md

  - id: UC004
    name: no_duplicate_scenario_steps
    description: Journey map must NOT duplicate Gherkin scenario step text
    severity: warning
    check: |
      - Step name/description should be brief narrative summary
      - Do NOT include Given/When/Then Gherkin text here
      - Actual scenario steps remain in .feature files only
    rationale: |
      Scenario text belongs in .feature files (per traceability-contract).
      Journey map references use_case.id which in turn references scenarios.
      This separation maintains single source of truth for behavior.

  - id: UC005
    name: condition_format_valid
    description: Trigger/entry/exit conditions must have valid type and description
    severity: warning
    check: |
      - Each condition MUST have type: event|state|time|user_action
      - Each condition MUST have description (non-empty string)

  - id: UC006
    name: metric_format_valid
    description: Success metrics must have id, description, and target
    severity: warning
    check: |
      - Each metric MUST have id (kebab-case)
      - Each metric MUST have description (non-empty)
      - Each metric SHOULD have target value

# ============================================================================
# SCHEMA NOTES
# ============================================================================
notes: |
  1. This schema defines the STRUCTURED MAP for journey-to-use-case linkage.
     For the EXPERIENCE timeline with user-observable details, see
     docs/architecture/journey-narrative-model.md

  2. Scenario step text remains in .feature files only. Journey maps reference
     use_case.id which provides the bridge to scenarios. This maintains single
     source of truth for behavior specification.

  3. Validation rules UC001-UC006 can be enforced via udd lint or CI checks.
     Missing use_case_ref is an ERROR (blocks forward trace).
     Invalid persona reference is an ERROR (breaks reverse trace).

  4. The journey_map.steps array order defines traversal order. Use explicit
     sequence numbers to avoid ambiguity when steps are reordered.

  5. For trace query "journey_to_use_case" (specs/traceability-contract.yml),
     the journey_map provides: journey.id -> steps[].use_case_ref -> use_case.id


## USER (10:28:21 AM)

# Canonical Derivation Model

Purpose: Define the authoritative derivation path from user intent to implementation requirements. This document establishes the canonical chain that all UDD traceability queries follow, ensuring deterministic navigation through the artifact graph.

Scope: Persona, Journey, Use Case, Scenario, E2E Test, Component, Requirement.

Alignment: This model extends the trace query path defined in `specs/traceability-contract.yml` (line 334: `persona → journey → use_case → scenario → e2e_test → requirement`) by adding Component as the implementation mapping layer. It complements `docs/architecture/udd-concept-model.md` by defining derivation semantics rather than artifact definitions.

## 1. Canonical Derivation Path

The canonical path in exact order:

```
Persona → Journey → Use Case → Scenario → E2E Test → Component → Requirement
```

This path represents the complete forward trace from user intent to technical implementation. Each layer MUST derive from the previous layer; skipping layers is prohibited except under explicit exception rules (see Exception Policy).

## 2. Node Definitions

### 2.1 Persona
- **Definition**: Human archetype describing who acts in the system, their context, goals, and pain points.
- **Source**: `product/actors.md` or journey frontmatter.
- **Key Fields**: `id` (kebab-case), `name`, `description`, `goals` (array of measurable goals).
- **Owner**: ProductOwner.

### 2.2 Journey
- **Definition**: Ordered list of user-focused steps describing an outcome the persona wants to achieve.
- **Source**: `product/journeys/*.md`
- **Key Fields**: `id` (kebab-case), `actor` (references persona.id), `goal`, `steps` (ordered list with path or use_case references).
- **Owner**: ProductOwner.

### 2.3 Use Case
- **Definition**: Compact YAML document capturing an interaction goal, expected outcomes, and explicit scenario path references.
- **Source**: `specs/use-cases/*.yml`
- **Key Fields**: `id` (kebab-case), `name`, `summary`, `actors` (array of persona.id), `outcomes` (with scenario references).
- **Owner**: ProductOwner.

### 2.4 Scenario
- **Definition**: Single Gherkin Scenario block in a .feature file; single source of truth for user-facing behavior.
- **Source**: `specs/features/<area>/<feature>/<slug>.feature`
- **Key Fields**: `id` (area/feature/slug), `feature_path`, `title`.
- **Owner**: ProductOwner.

### 2.5 E2E Test
- **Definition**: Implementation test that verifies a scenario.
- **Source**: `tests/**/*.e2e.test.ts`
- **Key Fields**: `id` (kebab-case matching scenario slug), `scenario_path`, `status` (passing/failing/pending).
- **Owner**: Agent (generated).

### 2.6 Component
- **Definition**: Logical implementation unit (service, module, UI widget) that lists responsibilities, public interfaces, and supported use cases/scenarios.
- **Source**: `specs/components/*.md` or `specs/components/*.yml`
- **Key Fields**: `id` (kebab-case), `name`, `responsibilities`, `supported_use_cases`, `supported_scenarios`.
- **Owner**: TechnicalLead.

### 2.7 Requirement
- **Definition**: Technical requirement (functional or non-functional) linking to features and scenarios.
- **Source**: `specs/requirements/*.yml`
- **Key Fields**: `id` (kebab-case), `type` (functional/non-functional), `feature`, `description`, `scenarios` (array of scenario slugs).
- **Owner**: TechnicalLead.

## 3. Link Semantics Between Layers

### 3.1 Persona → Journey
- **Link Field**: `journey.actor` = `persona.id`
- **Semantics**: A journey MUST reference exactly one persona in its `actor` field. Multiple personas may reference the same journey.
- **Cardinality**: One persona → many journeys. One journey → one persona.

### 3.2 Journey → Use Case
- **Link Field**: `journey.steps` contains use_case.id references
- **Semantics**: Each step in a journey references either a use_case.id or a scenario path. Use cases are the preferred intermediate.
- **Cardinality**: One journey → many use cases.

### 3.3 Use Case → Scenario
- **Link Field**: `use_case.outcomes[].scenarios` contains scenario.id (area/feature/slug)
- **Semantics**: A use case lists scenario paths that implement its outcomes. Scenarios are the single source of truth.
- **Cardinality**: One use case → many scenarios. One scenario → many use cases.

### 3.4 Scenario → E2E Test
- **Link Field**: `e2e_test.scenario_path` = `scenario.feature_path`
- **Semantics**: Each scenario should have at least one E2E test that maps to its feature_path. Tests verify scenario behavior.
- **Cardinality**: One scenario → one or many E2E tests. One E2E test → one scenario.

### 3.5 E2E Test → Component
- **Link Field**: Component documents `supported_scenarios` or `supported_use_cases`
- **Semantics**: Components declare which scenarios/use cases they implement. Tests implicitly validate components through scenario execution.
- **Cardinality**: One component → many scenarios/use cases. One scenario → one or many components.

### 3.6 Component → Requirement
- **Link Field**: Requirements may reference components via `feature` or component documentation links to requirements
- **Semantics**: Components implement requirements. A requirement may be satisfied by one or many components.
- **Cardinality**: One component → many requirements. One requirement → one or many components.

## 4. Worked Example: Happy-Path Derivation

This example demonstrates the canonical path for a "Capture Task" workflow.

### Input: Persona
```yaml
id: "team-member"
name: "Team Member"
description: "Mobile-first individual who needs to capture ideas quickly while away from desk"
goals: ["capture tasks", "surface top 3 priorities"]
```

### Derivation Step 1: Journey
```yaml
id: "daily-capture-workflow"
actor: "team-member"
goal: "Capture and organize tasks quickly"
steps:
  - "Quick capture → use_cases/capture_task"
  - "View inbox → use_cases/view_inbox"
```

### Derivation Step 2: Use Case
```yaml
id: "capture_task"
name: "Capture Task"
summary: "Quickly capture raw tasks into inbox"
actors: ["team-member"]
outcomes:
  - description: "Task created with title"
    scenarios: ["udd/cli/inbox/add_item_via_cli"]
```

### Derivation Step 3: Scenario
```
# File: specs/features/udd/cli/inbox/add_item_via_cli.feature
Feature: CLI Inbox Management

  Scenario: User adds item via CLI
    Given the CLI is installed
    When I run "udd add 'Buy milk'"
    Then I see "Added: Buy milk" in output
```

### Derivation Step 4: E2E Test
```typescript
// File: tests/e2e/udd/cli/inbox/add_item_via_cli.e2e.test.ts
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";

const feature = await loadFeature("specs/features/udd/cli/inbox/add_item_via_cli.feature");

describeFeature(feature, ({ Scenario }) => {
  Scenario("User adds item via CLI", ({ Given, When, Then }) => {
    // Step implementations...
  });
});
```

### Derivation Step 5: Component
```yaml
# File: specs/components/cli-command-service.md
id: "cli-command-service"
name: "CLI Command Service"
responsibilities:
  - "Parse CLI arguments"
  - "Execute add/list/delete commands"
  - "Format output for terminal"
supported_use_cases:
  - "capture_task"
  - "view_inbox"
supported_scenarios:
  - "udd/cli/inbox/add_item_via_cli"
```

### Derivation Step 6: Requirement
```yaml
# File: specs/requirements/persist_item_with_defaults.yml
id: "persist_item_with_defaults"
type: "functional"
feature: "udd/cli/inbox"
description: "Persist a new item with title and default completed=false"
scenarios:
  - "udd/cli/inbox/add_item_via_cli"
```

## 5. Anti-Example: Skipped Layer (Invalid)

This example demonstrates an invalid derivation that skips the Use Case layer.

### Invalid Derivation: Journey → Scenario Direct

```yaml
# INVALID: Journey directly references scenario without Use Case intermediate
id: "invalid-capture-workflow"
actor: "team-member"
goal: "Capture tasks quickly"
steps:
  - "Quick capture → specs/features/udd/cli/inbox/add_item_via_cli.feature"
  # ^ INVALID: Skips use_case layer
```

**Why This Is Invalid:**
1. **Traceability Break**: Forward trace queries from persona to requirement fail because journey.steps should reference use_case.id (intermediate layer), not direct scenario paths.
2. **Use Case Orphaning**: The use case layer becomes unreachable from this journey.
3. **Mapping Ambiguity**: Multiple journeys could reference the same scenario without a use case intermediary, causing confusion about which user goal the scenario serves.
4. **Contract Violation**: Per `specs/traceability-contract.yml`, journey.steps should reference use_case.id; direct scenario references break the trace query `journey_to_use_case`.

### Corrected Version

```yaml
# VALID: Journey references use case, use case references scenario
id: "valid-capture-workflow"
actor: "team-member"
goal: "Capture tasks quickly"
steps:
  - "Quick capture → use_cases/capture_task"
```

```yaml
# use_cases/capture_task.yml
id: "capture_task"
name: "Capture Task"
actors: ["team-member"]
outcomes:
  - description: "Task created with title"
    scenarios: ["udd/cli/inbox/add_item_via_cli"]
```

## 6. Exception Policy

Skipping intermediate layers in the canonical derivation path is **prohibited by default** with the following exceptions:

### 6.1 Allowed Exceptions

1. **Direct Scenario Reference from Journey (Conditional)**
   - **When Allowed**: Only when the scenario is atomic and represents a single, self-contained user action with no ambiguity about intent.
   - **How to Document**: Journey step must include both use_case.id AND scenario.id in format: `step_name → use_case:scenario`. The use case must still exist and reference the scenario.
   - **Example**: `Quick add → use_cases/capture_task:udd/cli/inbox/add_item_via_cli`

2. **Component Omission for Purely Declarative Scenarios**
   - **When Allowed**: When a scenario describes declarative state assertions (e.g., "Then I see the dashboard") without specific implementation behavior.
   - **How to Document**: Mark component reference as `N/A` in traceability manifest with justification note.

3. **Legacy Artifact Migration**
   - **When Allowed**: During migration from non-UDD artifact systems where intermediate layers did not exist.
   - **How to Document**: Add `migration_justification` field in the artifact metadata explaining why the layer is absent and planned remediation timeline.

### 6.2 Exception Request Process

To request an exception:
1. Document the proposed derivation in a spec change file under `specs/changes/`
2. Include `exception_type`, `justification`, and `documented_as` fields
3. Obtain approval from ProductOwner (for Persona/Journey/Use Case layers) or TechnicalLead (for Component/Requirement layers)
4. Update this document with the approved exception pattern if it establishes precedent

### 6.3 Invalid Exceptions

The following are never allowed:
- Skipping both Persona and Journey layers
- Skipping Use Case without documented exception
- Direct Requirement → Implementation code without Component intermediary (violates boundary_subject: udd-core)

## 7. Query Alignment

This derivation model aligns with trace queries defined in `specs/traceability-contract.yml`:

| Query | Canonical Path Segment |
|-------|------------------------|
| persona_to_journey | Persona → Journey |
| journey_to_use_case | Journey → Use Case |
| use_case_to_scenario | Use Case → Scenario |
| scenario_to_test | Scenario → E2E Test |
| test_to_requirement | E2E Test → Component → Requirement |

Forward trace: Persona → Journey → Use Case → Scenario → E2E Test → Component → Requirement
Reverse trace: Requirement → Component → E2E Test → Scenario → Use Case → Journey → Persona

## 8. Boundary Alignment

This model respects `specs/system-boundary.yml`:
- **Boundary Subject**: udd-core
- **In Scope**: Scenario and test mapping, use-case YAMLs, manifest
- **Out of Scope**: Runtime implementation code (src/), external services
- Component is included as it maps scenarios to implementation-facing requirements within the boundary.

## 9. Concept Non-Overlap

Per `docs/architecture/udd-concept-model.md`:
- Persona explains who; Journey explains what they do
- Use Case references scenarios by path; Scenario is the source of truth
- Requirement is implementation-facing; Scenario is user-facing acceptance
- Component documents implementation surface; Scenario documents user behavior

This derivation model does not change these boundaries—it provides the traversal path through them.

---

Contact: Update this file via normal PR process. If changes to the canonical path are needed, propose a spec change under `specs/changes/` with evidence of derivation simulation.


# Glossary and Naming Policy for UDD Traceability (Phase 2)

Scope
- This document defines approved terms, disallowed ambiguous terms, replacements, and concrete naming rules for artifact ids, file names, tags, and relationship markers used by udd-core traceability. It is documentation-only and does not modify code or tests.

Glossary: Approved Terms
- Persona: human archetype with measurable goals. Location: product/actors.md. id pattern: kebab-case (team-member).
- Journey: ordered user steps representing an outcome. Location: product/journeys/*.md. id pattern: kebab-case (new-user-onboarding).
- Use Case: compact YAML mapping of persona intent to scenarios. Location: specs/use-cases/*.yml. id pattern: kebab-case (capture_ideas).
- Scenario: single Gherkin Scenario block in a .feature. Identity: area/feature/slug (todos/basic/add_todo_with_title).
- Requirement: implementation-facing technical requirement. Location: specs/requirements/*.yml. id pattern: kebab-case (persist_todo_with_defaults).
- Component: implementation unit (service/module/widget). Location: specs/components/*.md. id pattern: kebab-case (task_service).
- E2E Test: test verifying a scenario. Location: tests/**/*.e2e.test.ts. id pattern: kebab-case matching scenario slug (add_item_via_cli).
- Test Review: verification artifact linking test to scenario. Location: tests/**/*test-review.yml. id pattern: <test-id>.test-review (add_item_via_cli.test-review).

Disallowed / Ambiguous Terms and Replacements
- Actor (ambiguous) -> use Persona. Rationale: "actor" has runtime semantics in other contexts and was used inconsistently. Keep product/actors.md file name but prefer the term Persona in docs and trace fields.
- Feature (overloaded) -> use Scenario for single Gherkin scenario, Feature only as .feature file container name. Rationale: "feature" is overloaded between BDD feature files and product features; be explicit when you mean scenario vs feature directory.
- Use Case vs Journey confusion: ban using "use-case" and "journey" interchangeably. Replacement: Journey = user flow (product/journeys); Use Case = mapping artifact (specs/use-cases).
- Test (ambiguous) -> use E2E Test for implementation verification; use Test Review for fidelity checks. Rationale: avoids mixing code/test status with spec artifacts.
- Story / Epic / Ticket -> disallowed as canonical terms in trace fields. Use Journey, Use Case, or Requirement as appropriate.

Rationale for bans
- Ambiguous labels cause broken trace queries and automated mismatches. The traceability contract and tooling rely on deterministic id patterns and location semantics.

Naming Rules

1) Concept ids
- Use kebab-case for all artifact ids unless explicitly path-based. Allowed chars: lower-case letters, numbers, and hyphen. No spaces, no underscores in id fields except where historical YAML uses underscore in use_case ids; migrate to kebab-case over time.
- Scenario id: use path-style identity area/feature/slug where each segment is kebab-case (e.g., udd/cli/inbox/add_item_via_cli -> normalize to udd/cli/inbox/add-item-via-cli for filenames; trace fields may preserve path with slashes).

2) File names and paths
- Persona entries: product/actors.md (single file). persona ids referenced in frontmatter or YAML use kebab-case.
- Journeys: product/journeys/<kebab-case-id>.md (e.g., product/journeys/new-user-onboarding.md).
- Use Cases: specs/use-cases/<kebab-case-id>.yml (e.g., specs/use-cases/capture-ideas.yml).
- Scenarios (feature files): specs/features/<area>/<feature>/<slug>.feature where <area> and <feature> are kebab-case and <slug> is kebab-case (e.g., specs/features/todos/basic/add-todo-with-title.feature). Each .feature must contain exactly one Scenario block.
- Requirements: specs/requirements/<kebab-case-id>.yml (persist-todo-with-defaults.yml).
- Components: specs/components/<kebab-case-id>.md or .yml (task-service.md).
- E2E tests: tests/e2e/<area>/<feature>/<slug>.e2e.test.ts matching scenario slug (add-todo-with-title.e2e.test.ts).
- Test Review: tests/<area>/<feature>/<slug>.test-review.yml (add-todo-with-title.test-review.yml).

3) Tags / Markers
- Phase tags: @phase:N where N is integer. Use only on scenario files to indicate planned phase. Example: @phase:2
- Trace tags: @trace:<id> may be used inside feature comments to link to requirement or use_case id. Use sparingly; primary link must remain in use_case or requirement YAML.
- Status markers: use only the enum values defined in traceability-contract.yml for status fields (passing, failing, pending).

4) Relationship markers (how links are represented)
- Journey.step → either `use_case:<use-case-id>` or `specs/features/<area>/<feature>/<slug>.feature` (preferred: use_case). Example: "User signs up → use_case:capture-ideas".
- Use Case outcomes → scenarios: list scenario ids in area/feature/slug format. Example: outcomes.scenarios: [todos/basic/add-todo-with-title]
- Requirement.scenarios → list scenario slugs (kebab-case) or full path; prefer full relative path when ambiguity exists. Example: scenarios: [specs/features/todos/basic/add-todo-with-title.feature]
- E2E Test.scenario_path → must be the feature file path. Example: scenario_path: specs/features/todos/basic/add-todo-with-title.feature

Concrete Examples (all concepts)
- Persona/Actor record
  - File: product/actors.md
  - id: team-member
  - name: Team Member

- Journey
  - File: product/journeys/new-user-onboarding.md
  - id: new-user-onboarding
  - actor: team-member
  - steps:
    - "Sign up → use_case:signup"

- Use Case
  - File: specs/use-cases/signup.yml
  - id: signup
  - name: Sign up
  - actors: [team-member]
  - outcomes.scenarios: [udd/auth/signup]

- Scenario (feature)
  - File: specs/features/udd/auth/signup.feature
  - Identity: udd/auth/signup

- E2E Test
  - File: tests/e2e/udd/auth/signup.e2e.test.ts
  - id: signup
  - scenario_path: specs/features/udd/auth/signup.feature

- Component
  - File: specs/components/auth-service.md
  - id: auth-service
  - supported_scenarios: [udd/auth/signup]

- Requirement
  - File: specs/requirements/persist-user.yml
  - id: persist-user
  - feature: udd/auth
  - scenarios: [specs/features/udd/auth/signup.feature]

- Test Review
  - File: tests/e2e/udd/auth/signup.test-review.yml
  - id: signup.test-review
  - test_id: signup
  - scenario_path: specs/features/udd/auth/signup.feature

Ban on overloaded labels
- Never use a single term to refer to multiple concepts. Example bans:
  - Do not use "actor" to mean both runtime actor and persona. Use "Persona" in docs and trace fields; keep file name actors.md for compatibility.
  - Do not use "feature" in trace fields to mean scenario id. If you mean scenario, use area/feature/slug pattern.

Migration notes
- Where historical files use underscores or mixed-case, prefer new kebab-case names in new artifacts. Tooling and lints will flag migration needs.

Enforcement and verification
- udd lint and npm run check should flag violations of these rules where possible. Keep policy documentation here; do not implement enforcement in code as part of this task.

Contact and change process
- Propose changes to this policy via normal PR process. If a relaxation is needed, update docs/architecture/glossary-naming-policy.md and include migration steps.


# Journey Narrative Model (Experience Layer)

Purpose: define an experience-first narrative schema for journeys that documents the user's timeline and feelings without leaking capability internals or implementation details.

Scope and constraints
- This model describes the experience timeline: stages a user passes through, the observable touchpoints, channels used, emotional trajectory, pain points, and success metrics.
- It must not contain implementation details, component responsibilities, API surface, or test steps. Scenario text remains in .feature files.
- Aligns with docs/architecture/udd-concept-model.md and docs/architecture/canonical-derivation-model.md: Journey is an experience artifact that points to use_case ids or scenario paths.

Schema (fields)
- id: kebab-case string, journey id (example: new-user-onboarding)
- title: short human title
- actor: persona id (references product/actors.md)
- goal: one-sentence outcome the journey achieves for the actor
- stages: ordered array of stage objects
  - id: kebab-case stage id
  - title: short label
  - summary: 1-2 sentence description of stage from user's perspective
  - touchpoints: array of touchpoint objects (what the user sees/does)
    - id: kebab-case
    - description: short user-observable interaction (no implementation)
    - channels: array of channel strings (web, mobile, email, cli, phone, in-person)
    - observable_signals: optional array of strings (what product shows or logs that are user-facing)
- emotions: high-level emotional trajectory for the journey (see notes)
  - format: list of {stage_id, emotion, intensity: 1-5, note}
  - guidance: prefer qualitative labels (curious, frustrated, relieved) plus intensity; avoid internal metrics like latency numbers
- pain_points: array of user-facing pain point objects
  - id: kebab-case
  - description: what frustrates or blocks the user at this stage (user-observable)
  - frequency: optional estimate (always, often, sometimes, rare)
- success_metrics: array of measurable outcomes that indicate journey success
  - id: kebab-case
  - description: what success looks like (e.g., "task created and visible in inbox within 10s")
  - metric: optional machine-friendly metric reference (link to requirement id or monitoring metric)
  - target: optional numeric or qualitative target
- references: optional mapping to use_case ids or scenario paths
  - format: {type: "use_case"|"scenario", id: string}

Policy: narrative is experience timeline, not capability internals
- The journey narrative MUST use only user-observable language. Examples of forbidden content:
  - "This stage calls the task_service.create() API" (forbidden)
  - "The backend will enqueue a job to process" (forbidden)
  - "Use feature flag myfeature_v2" (forbidden)
- Allowed: "User taps New Task, a new blank input appears" (user-observable)
- Any reference to implementation must point to a Use Case or Component via references fields, not describe internals.

Invalid patterns (capability leak detection)
- Regex patterns to reject in narrative fields (illustrative, enforce via udd lint elsewhere):
  - "\b(service|api|endpoint|database|queue|persist|encrypt|decrypt|lambda|microservice|container)\b" when used with verb phrases (calls, writes, persists)
  - code-like tokens: "\b[A-Za-z_]+\.[A-Za-z_]+\(|\bGET /|POST /|PUT /" (indicates API or code)
  - feature-flag like tokens: "\bfeature[_-]flag\b|\btoggle\b|\bmyfeature_v\d+\b"
  - configuration or infra mentions: "k8s|docker|ecs|s3|cloudwatch|prometheus|redis|postgres|mysql|mongodb"

Rejection rules (human-readable)
- If a journey field matches any invalid pattern above it must be rejected and the author must either:
  1) replace with a user-observable description, or
  2) move the implementation detail into a Use Case or Component doc and reference it from references.

Example: Full narrative (Happy path)

id: onboarding-quick-start
title: "New User Quick Start"
actor: team-member
goal: "Sign up and complete first task within 5 minutes"
stages:
  - id: discover
    title: Discover
    summary: "User learns about the product and decides to try it"
    touchpoints:
      - id: landing-page
        description: "User reads short benefits and clicks Sign up"
        channels: [web]
        observable_signals: ["signup button visible", "marketing headline"]
  - id: signup
    title: Sign up
    summary: "User creates account using email or social sign-on"
    touchpoints:
      - id: signup-form
        description: "User completes a short form and confirms email"
        channels: [web, mobile]
        observable_signals: ["success message", "confirmation email sent"]
  - id: first-task
    title: Create first task
    summary: "User creates their first task and sees it in the inbox"
    touchpoints:
      - id: create-task-ui
        description: "User taps New Task, types a title, and taps Save"
        channels: [web, mobile, cli]
        observable_signals: ["new task appears in inbox list", "toast: Task created"]
emotions:
  - stage_id: discover
    emotion: curious
    intensity: 3
    note: "User is exploring options, open to persuasion"
  - stage_id: signup
    emotion: cautious
    intensity: 2
    note: "User may abandon if form is long"
  - stage_id: first-task
    emotion: delighted
    intensity: 4
    note: "User feels accomplished when task appears immediately"
pain_points:
  - id: email-confirmation-delay
    description: "Users sometimes do not receive confirmation quickly and abandon"
    frequency: often
  - id: unclear-empty-state
    description: "After signup the inbox looks empty and users are unsure what to do next"
    frequency: sometimes
success_metrics:
  - id: signup-success-rate
    description: "Percentage of users who complete signup and confirm email within 10 minutes"
    metric: analytics.signup_confirmed
    target: ">80%"
  - id: first-task-completion
    description: "Percentage of signed-up users who create a first task within 5 minutes"
    metric: analytics.first_task
    target: ">=50%"
references:
  - type: use_case
    id: capture-task

Notes on emotions (trajectory)
- Emotions represent the user's subjective experience at each stage. The model captures label and intensity to help product prioritize interventions. Keep labels human-centric, avoid technical proxies like CPU or response-time metrics.

Quality checks (what a human reviewer verifies)
- All stages use user-observable language (no code, API names, or component mentions).
- references point to use_case ids or scenario paths when implementation or test mapping is required.
- success_metrics are outcome-oriented and do not prescribe internal implementation.

Appendix: Common mistakes to avoid
- Writing step-by-step Gherkin in journey text. Scenarios belong in .feature files.
- Referencing internal component names or methods.
- Listing monitoring or infra targets as part of emotional descriptors.


# UDD Concept Model: Canonical Taxonomy and Non-Overlap Rules

Purpose: provide concise, canonical definitions for the UDD artifacts that stakeholders and agents rely on. Make boundaries explicit so automation (udd tooling) can make deterministic decisions and flag misuses.

Scope: Persona, Journey, Use Case, Scenario, Requirement, Component, Test Review.

Principles
- Keep scenario text only in .feature files. Use cases reference scenario paths, they do not restate scenario steps.
- One scenario per .feature file. Scenario identity equals area/feature/slug path.
- Requirements reference scenarios and features; they do not contain user-facing scenario text.

1. Persona
- Definition: A concise human archetype describing who acts in the system, their context, goals, and pain points. Persona entries are short, testable, and used to guide journey language.
- Location: product/actors.md (or product/journeys frontmatter). Personas are human descriptions, not actors in tests.
- Positive example: "Team Member: mobile-first individual who needs to capture ideas quickly while away from desk. Goals: capture tasks, surface top 3 priorities." (short, measurable goals)
- Negative example: "User: wants things." (vague, no context or measurable goals)

Boundary rule: Persona describes motivations and context only. Do not include scenarios, steps, or technical requirements inside persona docs.

2. Journey
- Definition: A short, ordered list of user-focused steps that describe an outcome the persona wants to achieve. Journeys map to one or more use cases and point to scenario files where behaviors are specified.
- Location: product/journeys/*.md
- Positive example: Daily Planning journey listing steps: Review inbox -> Prioritize -> Commit to today, each step mapping to use case or scenario references.
- Negative example: A journey that contains full Gherkin Given/When/Then blocks inside the journey markdown.

Boundary rule: Journey explains intent and outcome. Steps may include pointers to use cases or scenario paths, but must not duplicate scenario text.

3. Use Case
- Definition: A compact YAML document capturing an interaction goal, expected outcomes, the persona(s) involved, and an explicit list of scenario path references that exercise the use case.
- Location: specs/use-cases/*.yml
- Positive example: capture_task.yml with id, summary, actors: [Team Member], outcomes and scenarios: [tasks/quick_capture/mobile_widget]
- Negative example: A use-case that embeds Gherkin scenarios or repeats long scenario steps in prose.

Boundary rule: Use cases reference scenarios by path (area/feature/slug). They must not restate scenario steps or become the primary source of truth for behavior.

4. Scenario
- Definition: A single Gherkin Scenario block stored in a .feature file. Scenarios are the single source of truth for user-facing behavior and acceptance criteria.
- Location: specs/features/<area>/<feature>/<slug>.feature
- Identity rule: path area/feature/slug uniquely identifies the scenario.
- Positive example: specs/features/todos/basic/add_todo_with_title.feature with one Scenario block describing Given/When/Then.
- Negative example: A .feature file containing multiple Scenario blocks or scenario text duplicated in a use-case YAML.

Boundary rule: Scenario text belongs only in .feature files. Tests map to scenarios; scenario edits should trigger stale detection of tests.

5. Requirement
- Definition: A technical requirement (functional or non-functional) that links to feature ids and scenario slugs it supports. Requirements describe implementation expectations and test mapping but do not replace scenario text.
- Location: specs/requirements/<key>.yml
- Positive example: store_new_todo.yml type: functional feature: todos/basic scenarios: [add_todo_with_title] description: Persist a new todo with title and default completed=false
- Negative example: A requirement that repeats full user-facing steps or includes acceptance Gherkin instead of referencing scenario slugs.

Boundary rule: Requirements may reference scenarios and list tests but must remain implementation-facing. They can include details that are outside Gherkin scope (performance budgets, error codes), but must not contradict scenario text.

6. Component
- Definition: A logical implementation unit (service, module, UI widget) that lists the responsibilities, public interfaces, and the set of use cases or scenarios it supports. Components map to implementation boundaries, not user-behavior artifacts.
- Location: specs/components/*.md or specs/components/*.yml
- Positive example: task_service.md describing API endpoints, supported use cases: capture_task, and scenarios it supports: mobile_widget, voice_input
- Negative example: A component doc that contains user-facing scenarios or rephrases the scenario steps as requirement-level prose.

Boundary rule: Component documentation focuses on implementation surface and mapping to requirements/use cases. It must not host scenario text.

7. Test Review
- Definition: A short, reviewable artifact describing that a test maps correctly to a scenario, includes a checklist (name matches scenario, steps correspond to Gherkin steps), and documents any overrides or known staleness.
- Location: tests/**/*.test-review.yml or tests/**/*.test-review.md
- Positive example: mobile_widget.test-review.yml containing checks: name_matches_scenario: true; steps_implemented: true; notes: none
- Negative example: A test-review that attempts to re-specify behavior or contains new user-facing steps absent from the scenario.

Boundary rule: Test reviews validate mapping and quality of test implementations; they must not be used to change the scenario meaning. Any test-driven clarifications must go back into the scenario file via a spec change.

Anti-Overlap Rules (summary)
- Persona vs Journey: Persona explains who; Journey explains what they do. Do not put steps in Persona.
- Journey vs Use Case: Journey is user-centered flow; Use Case is a machine-friendly mapping that references scenarios implementing steps. Use cases must not restate full scenario text.
- Use Case vs Scenario: Use Case references scenario paths. Scenario contains the authoritative behavior text. Never duplicate scenario steps in use case.
- Scenario vs Requirement: Scenario is user-facing acceptance text. Requirement is implementation-facing and may reference scenarios but must not replace scenario text.
- Requirement vs Component: Requirement says what must be true. Component says who implements it. Keep requirements independent of component design where possible; map via references.
- Component vs Scenario: Component documents implementation boundaries and which scenarios it supports. Do not write Gherkin in component documentation.
- Test Review vs Scenario/Requirement: Reviews check fidelity. They must not define behavior.

Decision table: When to put content where
- User intent, readable by humans and product owners -> Journey or Persona
- Executable acceptance criteria -> Scenario (.feature)
- Implementation contract, tests -> Requirement (.yml)
- Mapping from user intent to scenarios -> Use Case (.yml)
- Implementation notes, API surface -> Component docs
- Test-to-scenario verification -> Test Review

Concept boundary examples (short)
- Scenario->Requirement boundary: A scenario says "Then I see my task in the list". The requirement adds "persist in tasks table, return 201, eventual consistency within 2s".
- Use Case->Scenario boundary: Use case "Capture Task" lists scenarios [mobile_widget, voice_input]; it does not include the Given/When/Then content.

Change management note
- If a scenario edit changes user-observable steps, update related use cases and requirements to avoid contradiction. Tooling should flag stale tests and stale requirements.

Appendix: Examples matrix
- For each concept, one positive and one negative example (see above within each section).

Contact: Update this file via normal PR process. If you need to relax a rule, propose a spec change under specs/changes/ referencing affected artifacts.


