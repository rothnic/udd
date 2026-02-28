# Implement Task 3 traceability contract schema docs (@Sisyphus-Junior subagent)

**ID**: ses_36ab1a28cffe9BSyIpEwRmlsGs
**Project ID**: ad761ea6174e58ed763fc75290c3f403ed51079d
**Created**: 2/25/2026, 8:57:46 AM
**Stats**: 1 files changed, +454 -0

---

## USER (8:58:17 AM)

# Traceability Contract Schema
# Defines required metadata fields for all UDD artifacts that participate in trace queries.
# Boundary subject: udd-core

# ============================================================================
# ARTIFACT TYPE DEFINITIONS
# Each artifact type has required fields, field types, ownership semantics,
# and example values. These enforce the trace graph structure.
# ============================================================================

artifacts:
  # --------------------------------------------------------------------------
  # Persona / Actor Record
  # Represents a user archetype who performs journeys. Located in product/actors.md
  # or journey frontmatter. Used to ground traceability to user intent.
  # --------------------------------------------------------------------------
  persona:
    required_fields:
      - name: id
        type: string
        pattern: "kebab-case slug"
        description: "Unique identifier for the persona"
        example: "team-member"
        owner: "ProductOwner"

      - name: name
        type: string
        description: "Human-readable display name"
        example: "Team Member"
        owner: "ProductOwner"

      - name: description
        type: string
        description: "Brief context describing goals and pain points"
        example: "Mobile-first individual who needs to capture ideas quickly"
        owner: "ProductOwner"

      - name: goals
        type: array[string]
        description: "Measurable goals the persona wants to achieve"
        example: ["capture tasks", "surface top 3 priorities"]
        owner: "ProductOwner"

    optional_fields:
      - name: references
        type: array[string]
        description: "Paths to journey files where this persona appears"

  # --------------------------------------------------------------------------
  # Journey
  # A user-focused outcome with ordered steps. Located in product/journeys/*.md
  # --------------------------------------------------------------------------
  journey:
    required_fields:
      - name: id
        type: string
        pattern: "kebab-case slug"
        description: "Unique identifier for the journey"
        example: "new-user-onboarding"
        owner: "ProductOwner"

      - name: actor
        type: string
        description: "Reference to persona id who performs this journey"
        example: "team-member"
        owner: "ProductOwner"

      - name: goal
        type: string
        description: "Outcome the user wants to achieve"
        example: "Sign up and start using the app"
        owner: "ProductOwner"

      - name: steps
        type: array[step]
        description: "Ordered list of step references (path or use_case id)"
        example:
          - "User signs up → specs/auth/signup.feature"
          - "User creates first item → use_cases/create_first_item"
        owner: "ProductOwner"

    optional_fields:
      - name: success_criteria
        type: string
        description: "Measurable success condition"

  # --------------------------------------------------------------------------
  # Use Case
  # Compact YAML mapping persona intent to scenarios. Located in specs/use-cases/*.yml
  # --------------------------------------------------------------------------
  use_case:
    required_fields:
      - name: id
        type: string
        pattern: "kebab-case slug"
        description: "Unique identifier for the use case"
        example: "capture_ideas"
        owner: "ProductOwner"

      - name: name
        type: string
        description: "Human-readable name"
        example: "Capture Ideas"
        owner: "ProductOwner"

      - name: summary
        type: string
        description: "One-line description of the interaction goal"
        example: "Quickly capture raw ideas into an inbox"
        owner: "ProductOwner"

      - name: actors
        type: array[string]
        description: "List of persona ids involved in this use case"
        example: ["team-member"]
        owner: "ProductOwner"

      - name: outcomes
        type: array[outcome]
        description: "Expected outcomes with scenario references"
        owner: "ProductOwner"

    optional_fields:
      - name: scenarios
        type: array[string]
        description: "Direct scenario path references (alternative to outcomes)"

  # --------------------------------------------------------------------------
  # Scenario
  # Single Gherkin Scenario block. Located in specs/features/<area>/<feature>/<slug>.feature
  # Identity: area/feature/slug
  # --------------------------------------------------------------------------
  scenario:
    required_fields:
      - name: id
        type: string
        pattern: "area/feature/slug"
        description: "Unique path-based identifier"
        example: "udd/cli/inbox/add_item_via_cli"
        owner: "ProductOwner"

      - name: feature_path
        type: string
        pattern: "specs/features/*.feature"
        description: "File path to the .feature file"
        example: "specs/features/udd/cli/inbox/add_item_via_cli.feature"
        owner: "Auto-generated"

      - name: title
        type: string
        description: "Scenario title from Gherkin"
        example: "User adds item via CLI"
        owner: "ProductOwner"

    optional_fields:
      - name: tags
        type: array[string]
        description: "Gherkin tags for filtering"

  # --------------------------------------------------------------------------
  # E2E Test
  # Implementation test that verifies a scenario. Located in tests/**/*.e2e.test.ts
  # --------------------------------------------------------------------------
  e2e_test:
    required_fields:
      - name: id
        type: string
        pattern: "kebab-case matching scenario slug"
        description: "Unique identifier matching the scenario it tests"
        example: "add_item_via_cli"
        owner: "Agent"

      - name: scenario_path
        type: string
        pattern: "specs/features/**/*.feature"
        description: "Path to the authoritative scenario"
        example: "specs/features/udd/cli/inbox/add_item_via_cli.feature"
        owner: "Auto-generated"

      - name: status
        type: enum
        values: ["passing", "failing", "pending"]
        description: "Current test execution status"
        example: "passing"
        owner: "CI_System"

    optional_fields:
      - name: last_verified
        type: "ISO8601 timestamp"
        description: "When the test last passed"

  # --------------------------------------------------------------------------
  # Test Review
  # Verification artifact confirming test-to-scenario mapping. Located in tests/**/*.test-review.yml
  # --------------------------------------------------------------------------
  test_review:
    required_fields:
      - name: id
        type: string
        pattern: "test-id + .test-review"
        description: "Unique identifier for the review"
        example: "add_item_via_cli.test-review"
        owner: "Reviewer"

      - name: test_id
        type: string
        description: "Reference to e2e_test id"
        example: "add_item_via_cli"
        owner: "Reviewer"

      - name: scenario_path
        type: string
        description: "Reference to scenario being reviewed"
        example: "specs/features/udd/cli/inbox/add_item_via_cli.feature"
        owner: "Reviewer"

      - name: checks
        type: object
        description: "Verification checklist"
        properties:
          - name_matches_scenario: boolean
          - steps_implemented: boolean
          - assertions_cover_gherkin: boolean
        example:
          name_matches_scenario: true
          steps_implemented: true
          assertions_cover_gherkin: true
        owner: "Reviewer"

    optional_fields:
      - name: notes
        type: string
        description: "Reviewer notes on fidelity or known issues"

  # --------------------------------------------------------------------------
  # Requirement
  # Technical requirement linking to features and scenarios. Located in specs/requirements/*.yml
  # --------------------------------------------------------------------------
  requirement:
    required_fields:
      - name: id
        type: string
        pattern: "kebab-case slug"
        description: "Unique identifier for the requirement"
        example: "persist_todo_with_defaults"
        owner: "TechnicalLead"

      - name: type
        type: enum
        values: ["functional", "non-functional"]
        description: "Category of requirement"
        example: "functional"
        owner: "TechnicalLead"

      - name: feature
        type: string
        description: "Feature id this requirement supports"
        example: "todos/basic"
        owner: "TechnicalLead"

      - name: description
        type: string
        description: "Technical specification details"
        example: "Persist a new todo with title and default completed=false"
        owner: "TechnicalLead"

    optional_fields:
      - name: scenarios
        type: array[string]
        description: "Scenario slugs that exercise this requirement"


# ============================================================================
# TRACE QUERY DEFINITIONS
# These define the valid traversal paths through the traceability graph.
# Forward traces: user intent → implementation
# Reverse traces: implementation → user intent
# ============================================================================

trace_queries:
  # --------------------------------------------------------------------------
  # Forward Trace Queries
  # Start from user intent (persona) and trace down to requirements
  # --------------------------------------------------------------------------
  forward:
    persona_to_journey:
      description: "Find all journeys a persona can perform"
      query: |
        Given persona id = "team-member"
        Find journey.actor = persona.id
      example:
        input: "team-member"
        output: ["new-user-onboarding", "daily-planning"]

    journey_to_use_case:
      description: "Find use cases that comprise a journey"
      query: |
        Given journey.id = "new-user-onboarding"
        Find use_case.id from journey.steps references
      example:
        input: "new-user-onboarding"
        output: ["capture_ideas", "organize_tasks"]

    use_case_to_scenario:
      description: "Find scenarios that implement a use case"
      query: |
        Given use_case.id = "capture_ideas"
        Find scenario.id from use_case.outcomes[].scenarios
      example:
        input: "capture_ideas"
        output: ["udd/cli/inbox/add_item_via_cli"]

    scenario_to_test:
      description: "Find tests that verify a scenario"
      query: |
        Given scenario.id = "udd/cli/inbox/add_item_via_cli"
        Find e2e_test.scenario_path = scenario.feature_path
      example:
        input: "udd/cli/inbox/add_item_via_cli"
        output: ["add_item_via_cli"]

    test_to_requirement:
      description: "Find requirements verified by a test"
      query: |
        Given e2e_test.id = "add_item_via_cli"
        Find requirement.scenarios containing e2e_test.scenario_path
      example:
        input: "add_item_via_cli"
        output: ["persist_item_with_defaults"]

    persona_to_requirement:
      description: "Full forward trace: persona → requirement"
      query: |
        Trace: persona → journey → use_case → scenario → e2e_test → requirement
      example:
        input: "team-member"
        output: ["persist_item_with_defaults", "retrieve_items", "delete_items"]

  # --------------------------------------------------------------------------
  # Reverse Trace Queries
  # Start from implementation (test failure or requirement) and trace back to user intent
  # --------------------------------------------------------------------------
  reverse:
    failing_test_to_persona:
      description: "Diagnose which user need is affected by failing test"
      query: |
        Given e2e_test.status = "failing"
        Trace backward: e2e_test → scenario → use_case → journey → persona
      example:
        input: "add_item_via_cli (failing)"
        affected_persona: "team-member"
        affected_journey: "new-user-onboarding"

    requirement_impact_lookup:
      description: "Find all tests and scenarios affected by a requirement change"
      query: |
        Given requirement.id = "persist_item_with_defaults"
        Find: requirement.scenarios → scenario → e2e_test
      example:
        input: "persist_item_with_defaults"
        affected_scenarios: ["udd/cli/inbox/add_item_via_cli"]
        affected_tests: ["add_item_via_cli"]
        affected_journeys: ["new-user-onboarding"]
        affected_personas: ["team-member"]

    scenario_to_use_case:
      description: "Find which use cases reference a scenario"
      query: |
        Given scenario.id = "udd/cli/inbox/add_item_via_cli"
        Find use_case where scenario in use_case.outcomes[].scenarios
      example:
        input: "udd/cli/inbox/add_item_via_cli"
        output: ["capture_ideas"]


# ============================================================================
# MISSING FIELD INVALIDATION RULES
# Defines what fails when required fields are absent. These rules ensure
# the traceability graph remains complete and queryable.
# ============================================================================

invalidation_rules:
  - artifact: persona
    missing_field: id
    failure: "Cannot reference persona in journey.actor; forward trace breaks"

  - artifact: persona
    missing_field: name
    failure: "Display name unavailable for journey documentation"

  - artifact: journey
    missing_field: actor
    failure: "Cannot trace to persona; reverse trace from journey fails"

  - artifact: journey
    missing_field: steps
    failure: "Journey has no actionable steps; cannot map to use_cases"

  - artifact: use_case
    missing_field: id
    failure: "Cannot reference use_case in journey.steps; forward trace breaks"

  - artifact: use_case
    missing_field: actors
    failure: "Cannot trace to persona; requirement-to-persona trace fails"

  - artifact: use_case
    missing_field: outcomes
    failure: "No scenario references; use_case not connected to graph"

  - artifact: scenario
    missing_field: id
    failure: "Cannot reference scenario in use_case.outcomes; graph edge missing"

  - artifact: scenario
    missing_field: feature_path
    failure: "Cannot locate scenario file for test mapping"

  - artifact: e2e_test
    missing_field: scenario_path
    failure: "Test not linked to scenario; traceability broken"

  - artifact: e2e_test
    missing_field: status
    failure: "Cannot determine if test is passing for reverse trace"

  - artifact: test_review
    missing_field: test_id
    failure: "Review not linked to test; quality gate ineffective"

  - artifact: test_review
    missing_field: scenario_path
    failure: "Cannot verify scenario fidelity; mapping unconfirmed"

  - artifact: requirement
    missing_field: feature
    failure: "Cannot group requirements; impact analysis incomplete"

  - artifact: requirement
    missing_field: description
    failure: "No specification available; implementation guidance missing"


# ============================================================================
# CONTRACT NOTES
# Migration compatibility and alignment notes
# ============================================================================

notes:
  - "All artifact IDs use kebab-case for consistency with existing use-case YAMLs."
  - "Scenario identity uses path-based area/feature/slug to match manifest and feature file locations."
  - "Optional fields may become required in future versions with migration notice."
  - "Owner field semantics: ProductOwner = human-authored, Agent = generated by agent, CI_System = runtime observed, Auto-generated = tooling produced."
  - "This contract aligns with boundary_subject: udd-core defined in specs/system-boundary.yml."


