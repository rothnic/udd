# Feature: Orphan detection in status output
#
# Purpose: Ensure the status command reports scenarios that exist in features
# but are not referenced by any use case or journey. Keep steps implementation-
# agnostic and focused on observable CLI output and JSON output.

Feature: Orphan detection

  Background:
    Given I have a valid UDD spec structure

  # Happy path: status lists orphaned scenarios in human output
  Scenario: Orphaned scenarios are shown in human-readable status
    Given there is a feature with a scenario "area/feature/unused_scenario"
    And no use case or journey references "area/feature/unused_scenario"
    When I run "udd status"
    Then the command should exit with code 0
    And the output should contain "Orphaned Scenarios"
    And the output should contain "area/feature/unused_scenario"

  # Machine-readable JSON output includes orphan list
  Scenario: Orphaned scenarios are included in JSON status output
    Given there is a feature with a scenario "area/feature/orphan_json"
    And no use case or journey references "area/feature/orphan_json"
    When I run "udd status --json"
    Then the command should exit with code 0
    And the JSON output should have a top-level key "orphaned_scenarios"
    And the JSON array at "orphaned_scenarios" should contain "area/feature/orphan_json"

  # Negative case: referenced scenario is not reported as orphan
  Scenario: Referenced scenarios are not reported as orphans
    Given there is a feature with a scenario "area/feature/linked_scenario"
    And a use case references "area/feature/linked_scenario"
    When I run "udd status --json"
    Then the command should exit with code 0
    And the JSON array at "orphaned_scenarios" should not contain "area/feature/linked_scenario"

  # Edge: multiple orphans aggregated and counted in human output summary
  Scenario: Multiple orphaned scenarios are summarized and listed
    Given there are features with scenarios "area/feature/orphan1" and "area/feature/orphan2"
    And neither scenario is referenced by any use case or journey
    When I run "udd status"
    Then the command should exit with code 0
    And the output should contain "orphaned scenario(s)"
    And the output should contain "area/feature/orphan1"
    And the output should contain "area/feature/orphan2"
