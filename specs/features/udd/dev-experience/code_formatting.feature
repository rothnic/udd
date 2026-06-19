Feature: Code Formatting

  Scenario: Code Formatting
    Given I have a TypeScript file with inconsistent spacing
    When I run the repository formatter
    Then the file should be rewritten with the configured tab indentation
