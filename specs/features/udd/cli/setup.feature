Feature: UDD CLI

  Scenario: Setup development environment
    Given I am in the project root
    When I run "npm run setup"
    Then the command should exit with code 0
    And the "setup" script should be defined in package.json

  Scenario: Install packaged CLI in a clean consumer project
    Given I have a clean consumer project
    When I install the packed UDD package
    Then the installed "udd" binary should report the package version
    And the package entrypoints should be available
    And core workflows should run from the installed package
