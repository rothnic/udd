@phase:3
Feature: UDD Status Tool for Orchestration

  As an orchestrator agent working on a UDD project
  I want a structured status tool
  So that I can make informed decisions about delegation and completion

  Background:
    Given the OpenCode SDK is available
    And the udd CLI is installed

  Scenario: Get structured project status for orchestrator
    Given a UDD project with mixed test results
    When the orchestrator runs "udd status --json"
    Then it should return a JSON object containing:
      | field | type | description |
      | current_phase | number | Current development phase |
      | phases | object | Phase definitions |
      | features | object | Feature status map |
      | use_cases | object | Use case status with outcomes |
      | git | object | Git status (branch, clean, changes) |
      | orphaned_scenarios | array | Scenarios not linked to use cases |

  Scenario: Determine next action from status
    Given a UDD project with the following state:
      | condition | value |
      | failing_tests | 2 |
      | missing_tests | 1 |
      | stale_tests | 0 |
    When the orchestrator analyzes the status
    Then it should recommend "Fix failing tests first"
    And identify the specific failing scenarios

  Scenario: Detect project completion
    Given a UDD project where all outcomes are satisfied
    And all tests are passing
    And git status is clean
    When the orchestrator runs "udd status --json"
    Then it should indicate the project is complete
    And the orchestrator should signal "COMPLETE"

  Scenario: Detect deferred work vs blocking work
    Given a UDD project with:
      | type | count |
      | passing | 18 |
      | failing | 0 |
      | missing_current_phase | 0 |
      | deferred_to_future_phase | 4 |
    When the orchestrator analyzes the status
    Then it should recognize current phase work is complete
    And deferred work should not block completion
    And the orchestrator should signal "PHASE_COMPLETE"
