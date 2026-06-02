Feature: Assign work
  Scenario: Show unassigned
    Given a board with an unassigned task
    When a user views unassigned work
    Then the task appears in the unassigned list
