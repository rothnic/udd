# Implement Task 7 journey structured map model (@Sisyphus-Junior subagent)

**ID**: ses_36a989dbcffeKWYEbvHYGCvD2D
**Project ID**: ad761ea6174e58ed763fc75290c3f403ed51079d
**Created**: 2/25/2026, 9:25:06 AM
**Stats**: 2 files changed, +370 -0

---

## USER (9:25:37 AM)

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
      use_case_ref: user_signup
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
      use_case_ref: create_first_item
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
      use_case_ref: organize_items
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
    pattern: "^[a-z0-9]+(-[a-z0-9]+)*$"
    description: Reference to use_case.id from specs/use-cases/
    example: capture_ideas

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
        type: string
        pattern: "^[a-z0-9]+(-[a-z0-9]+)*$"
        description: Reference to use_case.id (REQUIRED for traceability)
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


