Feature: Strategic program commands

# User Need:
#   Maintainers and agents need command surfaces that prove traceability,
#   governance, repair planning, and handoff evidence without relying on chat
#   history.

  @phase:3
  Scenario: Strategic command surfaces return reviewable evidence
    Given the UDD strategic program is being verified
    When the agent runs trace, impact, governance, repair, and evidence commands
    Then each command returns machine-readable output with source-controlled proof
    And authoring scaffolds scenarios without fake passing tests
