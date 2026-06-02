Feature: Task capture
  Scenario: Tag source
    Given an empty task board
    When a user captures "Fix onboarding copy" from "customer-call"
    Then the task source is "customer-call"
