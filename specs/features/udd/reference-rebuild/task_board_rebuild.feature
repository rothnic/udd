Feature: Task board reference rebuild

# User Need:
#   Reviewers need to see that UDD behavior contracts can drive two different
#   implementations of the same product behavior.

  @phase:3
  Scenario: Task board behavior survives rebuild
    Given a task-board reference product with five use cases and twelve scenarios
    When the same behavior suite runs against baseline and rebuild implementations
    Then both implementations preserve the same user-observable task-board behavior
