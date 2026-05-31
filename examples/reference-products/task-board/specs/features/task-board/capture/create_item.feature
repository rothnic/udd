Feature: Task capture
  Scenario: Create item
    Given an empty task board
    When a user captures "Review signup flow" with description "Check first-run clarity"
    Then the board shows "Review signup flow" in Backlog
