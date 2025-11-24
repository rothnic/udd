Feature: Linting Specs

  Scenario: Linting a valid spec structure
    Given I have a valid UDD spec structure
    When I run "udd lint"
    Then the command should exit with code 0
    And the output should contain "All specs are valid"
