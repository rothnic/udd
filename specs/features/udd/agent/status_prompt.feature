Feature: Agent Customization

  Scenario: Status Prompt
    Given I have a prompt file ".github/prompts/status.prompt.md"
    When I read the prompt file
    Then it should contain "udd status"
    And it should contain "command"

