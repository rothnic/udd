Feature: Task capture
  Scenario: Require title
    Given an empty task board
    When a user captures a task without a title
    Then the board rejects the task with "Title is required"
