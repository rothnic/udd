Feature: Prioritize work
  Scenario: Reorder queue
    Given a board with "A" before "B"
    When a user moves "B" before "A"
    Then "B" is first in the backlog
