@phase:3
Feature: Orchestrated Iteration Until Complete

# User Need: Orchestrators need to delegate work to agents and monitor until completion
#
# Alternatives Considered:
# - Manual iteration: Too slow, doesn't scale
# - Fire-and-forget: No visibility into completion
# - Structured iteration with status checks: Best balance of automation and oversight
#
# Success Criteria:
# - Orchestrator can delegate tasks to worker agents
# - Worker reports progress back to orchestrator
# - Orchestrator knows when work is complete

  As a developer using OpenCode with UDD
  I want an orchestrator agent to coordinate worker agents
  So that tasks are completed autonomously without manual re-prompting

  Background:
    Given a UDD project with failing tests
    And the OpenCode SDK is available

  Scenario: Orchestrator reviews project and delegates to worker
    Given an orchestrator agent session with iteration instructions
    When the orchestrator reviews the project status
    Then it should identify work remaining
    And delegate a task to a worker agent session
    And wait for the worker to go idle

  Scenario: Worker completes task and reports back
    Given a worker agent session with a delegated task
    When the worker completes its work and goes idle
    Then the orchestrator should review the work
    And determine if modifications are needed or more work remains

  Scenario: Full iteration loop until complete
    Given an orchestrator agent configured with:
      | model | github-copilot/gpt-5-mini |
      | maxIterations | 10 |
    And a worker agent configured with:
      | model | github-copilot/grok-code-fast-1 |
    When the orchestrator starts with "iterate until project is complete"
    Then the following loop should execute:
      | step | actor | action |
      | 1 | orchestrator | review project status via udd status --json |
      | 2 | orchestrator | determine if complete or work needed |
      | 3 | worker | if work needed, execute task until idle |
      | 4 | orchestrator | review work, request modifications or continue |
    And the loop should repeat until orchestrator returns "complete"
    And the final project status should show all tests passing

  Scenario: Orchestrator signals completion
    Given all project tests are passing
    When the orchestrator reviews the project status
    Then it should return a response containing "COMPLETE"
    And the orchestration process should terminate successfully

  Scenario: Orchestrator handles worker failure
    Given a worker agent is processing a task
    When the worker fails with an error
    Then the orchestrator should capture the error
    And the orchestrator should preserve session state for retry

  Scenario: Orchestrator handles maximum iteration limit
    Given the iteration limit is set to 5
    When the task requires more than 5 iterations
    Then the orchestrator should stop at the limit
    And report partial completion
