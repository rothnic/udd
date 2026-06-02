Feature: Report status
  Scenario: Count by state
    Given a board with backlog, in-progress, and done tasks
    When a user asks for status counts
    Then the report shows one task in each state
