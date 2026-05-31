Feature: Report status
  Scenario: Filter by owner
    Given tasks assigned to "Nora" and "Ike"
    When a user filters by owner "Nora"
    Then only Nora's tasks are shown
