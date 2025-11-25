@phase:3
Feature: Error Handling in Orchestration

  As a developer using OpenCode with UDD
  I want the orchestrator to handle errors gracefully
  So that I can debug issues without losing session context

  Background:
    Given the OpenCode SDK is available
    And an orchestrator agent session is running

  Scenario: Stop on unrecoverable error
    Given a UDD project with an unrecoverable error state
    When the orchestrator encounters the error during iteration
    Then the orchestrator should stop the iteration loop
    And return an error response with details
    And preserve both orchestrator and worker sessions for debugging

  Scenario: Worker agent failure handling
    Given a worker agent session executing a task
    When the worker encounters a fatal error
    Then the orchestrator should be notified of the failure
    And the orchestrator should decide whether to retry or abort
    And the error state should be logged with full context

  Scenario: Max retries exceeded
    Given a task that consistently fails
    And the orchestrator has a retry limit of 3
    When the worker fails 3 times on the same task
    Then the orchestrator should stop with "MAX_RETRIES_EXCEEDED"
    And provide a summary of all failure attempts
