@phase:3
Feature: Configurable Iteration

  @todo
  Scenario: Configure max iterations
    Given a UDD project in progress
    And OpenCode config has "udd.maxIterations" set to 10
    When the agent reaches 10 iterations without completion
    Then the agent should pause
    And report "Max iterations reached"
    And allow the user to continue manually

  @todo
  Scenario: Configure pause conditions
    Given a UDD project with test failures
    And OpenCode config has "udd.pauseOn" set to ["test_failure"]
    When a test fails during iteration
    Then the agent should pause for user review
    And display the failure details
