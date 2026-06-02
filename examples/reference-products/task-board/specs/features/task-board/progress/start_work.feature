Feature: Track progress
  Scenario: Start work
    Given a backlog task
    When a user starts work
    Then the task state is "In Progress"
