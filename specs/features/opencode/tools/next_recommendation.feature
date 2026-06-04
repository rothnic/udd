@phase:3
Feature: OpenCode next recommendation

  As an OpenCode agent working through UDD backlog
  I want a next-work recommendation from shared status
  So that I can pick focused work without inventing a separate priority model

  Scenario: Next command returns a structured recommendation
    When the OpenCode adapter requests the next recommendation as JSON
    Then the payload includes the recommended item, reason, suggested files, and blockers
    And the payload explains user impact, verification commands, and pause reasons
    And the recommendation is derived from current UDD status and diagnostics
