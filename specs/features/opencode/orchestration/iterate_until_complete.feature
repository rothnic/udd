@phase:3
Feature: Orchestrated Iteration

  As a developer using OpenCode with UDD
  I want the agent to automatically continue iterating
  So that I don't have to manually re-prompt after each step

  Scenario: Iterate until complete
    Given a UDD project with failing tests
    And OpenCode is configured with the UDD orchestrator plugin
    When I start an iteration session with "iterate on this project"
    Then the agent should check project status
    And perform the recommended action
    And automatically continue until status is "complete"
    And report the final summary
