Feature: Linting Invalid Specs

  Scenario: Linting an invalid use-case spec
    Given I have a UDD project with a use-case spec missing required fields
    When I run "udd lint"
    Then the command should exit with a non-zero code
    And the output should contain "Spec validation failed"
    And the output should identify the invalid use-case file
