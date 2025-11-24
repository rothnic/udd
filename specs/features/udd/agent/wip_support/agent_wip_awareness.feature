@phase:2
Feature: Agent Phase Awareness

  Scenario: Agent understands deferred scenarios are intentionally deferred
    Given I have @phase:N tagged scenarios in my project where N > current_phase
    When the agent analyzes project status
    Then the agent should recognize deferred work as planned for future phases
    And the agent should not prompt to implement deferred scenarios immediately
