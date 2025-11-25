@phase:3
Feature: Configurable Iteration Behavior

  As a developer using OpenCode with UDD
  I want to configure iteration limits and pause conditions
  So that I maintain control over the autonomous process

  Background:
    Given the OpenCode SDK is available

  Scenario: Configure max iterations limit
    Given an orchestrator with maxIterations set to 5
    When the orchestrator completes 5 iteration cycles without reaching "complete"
    Then the orchestrator should pause with "MAX_ITERATIONS_REACHED"
    And provide a status summary
    And allow manual continuation with a new limit

  Scenario: Configure pause on test failure
    Given an orchestrator with pauseOn set to "test_failure"
    When a worker's changes cause test failures
    Then the orchestrator should pause for human review
    And display the test failure details
    And wait for approval before continuing

  Scenario: Configure pause on large changeset
    Given an orchestrator with pauseOn set to "large_changeset"
    And the threshold is 10 files modified
    When a worker modifies more than 10 files
    Then the orchestrator should pause for human review
    And show a diff summary
    And allow approval, rejection, or partial acceptance

  Scenario: Continue after manual pause
    Given the orchestrator is in a paused state
    When the developer issues a continue command
    Then the orchestrator should resume from where it stopped
    And maintain the existing session context
