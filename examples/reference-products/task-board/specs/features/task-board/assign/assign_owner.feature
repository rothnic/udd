Feature: Assign work
  Scenario: Assign owner
    Given a board with "Fix onboarding copy"
    When a user assigns it to "Nora"
    Then the owner is "Nora"
