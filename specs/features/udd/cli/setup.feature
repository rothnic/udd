Feature: UDD CLI

  Scenario: Setup development environment
    Given I am in the project root
    When I run "npm run setup"
    Then the command should exit with code 0
    And the "setup" script should be defined in package.json

