Feature: Check Project Status

  Scenario: Check status of a project
    Given I have a valid UDD spec structure
    When I run "udd status"
    Then the command should exit with code 0
    And the output should contain "Project Status"
