@phase:3
Feature: UDD Status Custom Tool

  As an OpenCode agent working on a UDD project
  I want a structured status tool
  So that I can make informed decisions about next actions

  @todo
  Scenario: Get structured project status
    Given a UDD project with mixed test results
    When the agent calls the "udd-status" tool
    Then it should return a JSON object with:
      | field | description |
      | phase | Current phase number and name |
      | health | Overall project health (passing/failing/incomplete) |
      | features | List of features with their status |
      | recommendation | Suggested next action |
      | shouldContinue | Boolean indicating if more work is needed |

  @todo
  Scenario: Get next action recommendation
    Given a UDD project with a failing test
    When the agent calls the "udd-status" tool
    Then the recommendation should be "Fix failing test: <test_name>"
    And shouldContinue should be true

  @todo
  Scenario: Project complete status
    Given a UDD project with all tests passing
    When the agent calls the "udd-status" tool
    Then health should be "complete"
    And shouldContinue should be false
