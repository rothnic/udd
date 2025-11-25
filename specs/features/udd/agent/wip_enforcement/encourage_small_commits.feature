Feature: Agent WIP Enforcement

  Scenario: Encourage Small Commits
    Given the iterate prompt defines commit guidelines
    When the agent makes changes
    Then the agent should commit in small logical chunks
    And the agent should use meaningful commit prefixes
