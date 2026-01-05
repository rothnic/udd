Feature: Query Commands for Agent Access

  Scenario: Query Actors with JSON Output
    When I run "udd query actors --json"
    Then the output should be valid JSON
    And the JSON should contain "actors" key
    And each actor should have "name" and "use_cases" fields

  Scenario: Query Actors with Human-Readable Output
    When I run "udd query actors"
    Then the output should contain "Actors"
    And the output should list actor names

  Scenario: Query Journeys with JSON Output
    When I run "udd query journeys --json"
    Then the output should be valid JSON
    And the JSON should contain "journeys" key

  Scenario: Query Features with JSON Output
    When I run "udd query features --json"
    Then the output should be valid JSON
    And the JSON should contain "features" key
    And each feature should have "id", "path", and "scenarios" fields

  Scenario: Query Status with JSON Output
    When I run "udd query status --json"
    Then the output should be valid JSON
    And the JSON should contain "features" key
    And the JSON should contain "scenarios" key
    And the JSON should contain "gaps" key
    And the JSON should contain "completeness" key

  Scenario: Query Status Shows Gap Analysis
    When I run "udd query status --json"
    Then the JSON should have gap analysis with expected fields
    And gaps should include "features_without_tests"
    And gaps should include "scenarios_without_tests"
    And gaps should include "failing_scenarios"
