Feature: Run Tests

  Scenario: Run tests with visual feedback
    Given I have a valid UDD spec structure
    When I run "udd test"
    Then the command should exit with code 0
    And the output should contain "Feature:"
    And the output should contain "Scenario:"

