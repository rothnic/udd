@phase:3
Feature: OpenCode deep status

  As an OpenCode agent working in a UDD repository
  I want a shared deep status payload
  So that I can make project decisions without scraping human output

  Scenario: Status command returns shared project status JSON
    When the OpenCode adapter requests deep status as JSON
    Then the payload includes project identity, phase, git state, health, and scenario totals
    And the payload does not define Codex hook or goal-command behavior
