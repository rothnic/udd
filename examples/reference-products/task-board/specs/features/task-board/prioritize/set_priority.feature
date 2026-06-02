Feature: Prioritize work
  Scenario: Set priority
    Given a board with "Fix onboarding copy"
    When a user sets priority to "high"
    Then the task priority is "high"
