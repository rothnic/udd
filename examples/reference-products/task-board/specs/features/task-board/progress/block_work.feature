Feature: Track progress
  Scenario: Block work
    Given an in-progress task
    When a user marks it blocked with reason "Waiting on design"
    Then the task state is "Blocked" with that reason
