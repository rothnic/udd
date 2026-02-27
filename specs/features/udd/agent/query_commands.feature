Feature: Query Commands for Agent Access

# User Need: Agents need programmatic access to UDD project state (journeys, features, tests) 
# to make intelligent decisions during development without parsing human-readable output.

# Alternatives Considered:
# - Direct file system access: Too brittle, doesn't respect UDD abstractions
# - Human-readable text parsing: Error-prone, format may change
# - JSON API: Clean, structured, extensible

# Success Criteria:
# - Agents can query actors, journeys, features, and status
# - JSON output is valid and follows consistent schema
# - Gap analysis reveals missing tests and incomplete features

  Scenario: Query Actors with JSON Output
    Given UDD is initialized in the current directory
    And there are defined journeys and actors in product/ and specs/
    When I run "udd query actors --json"
    Then the output should be valid JSON
    And the JSON should contain "actors" key
    And each actor should have "name" and "use_cases" fields

  Scenario: Query Actors with Human-Readable Output
    Given UDD is initialized in the current directory
    And the product/actors.md and product/journeys/ exist with at least one actor
    When I run "udd query actors"
    Then the output should contain "Actors"
    And the output should list actor names

  Scenario: Query Journeys with JSON Output
    Given UDD is initialized in the current directory
    And product/journeys/ contains one or more journey files
    When I run "udd query journeys --json"
    Then the output should be valid JSON
    And the JSON should contain "journeys" key

  Scenario: Query Features with JSON Output
    Given UDD is initialized in the current directory
    And specs/features/ contains feature files generated from journeys
    When I run "udd query features --json"
    Then the output should be valid JSON
    And the JSON should contain "features" key
    And each feature should have "id", "path", and "scenarios" fields

  Scenario: Query Status with JSON Output
    Given UDD is initialized in the current directory
    And there are journeys, features, and tests present in the repo
    When I run "udd query status --json"
    Then the output should be valid JSON
    And the JSON should contain "features" key
    And the JSON should contain "scenarios" key
    And the JSON should contain "gaps" key
    And the JSON should contain "completeness" key

  Scenario: Query Status Shows Gap Analysis
    Given UDD is initialized in the current directory
    And the repository contains journeys and features with some missing tests
    When I run "udd query status --json"
    Then the JSON should have gap analysis with expected fields
    And gaps should include "features_without_tests"
    And gaps should include "scenarios_without_tests"
    And gaps should include "failing_scenarios"
