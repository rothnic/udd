@phase:2
Feature: Agent Phase Awareness

  Scenario: Agent understands deferred scenarios are intentionally deferred
    Given the iterate prompt defines phase accountability
    When the agent analyzes project status
    Then the agent should recognize deferred work as planned for future phases
    And the agent should prioritize current-phase blockers before future-phase work
