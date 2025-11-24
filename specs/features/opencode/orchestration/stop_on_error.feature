@phase:3
Feature: Error Handling in Orchestration

  Scenario: Stop on error state
    Given a UDD project with an unrecoverable error
    And OpenCode is configured with the UDD orchestrator plugin
    When the agent encounters an error during iteration
    Then the agent should stop iterating
    And report the error state with details
    And preserve the session for debugging
