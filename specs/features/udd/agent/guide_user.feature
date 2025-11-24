Feature: Agent Customization

  Scenario: Guide User through UDD process
    Given I have an agent configuration file ".github/agents/udd.agent.md"
    When I read the agent configuration
    Then it should contain "The UDD Workflow"
    And it should contain "Guide the user to the next step"

