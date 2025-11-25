@phase:2
Feature: Agent WIP Enforcement

  Scenario: Warn On Large Changeset
    Given the iterate prompt defines WIP limits
    When the agent runs the iteration checklist
    Then the agent should warn if uncommitted changes exceed the threshold
    And the agent should encourage committing in logical chunks
