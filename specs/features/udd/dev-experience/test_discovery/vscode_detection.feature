Feature: Test Discovery

  Scenario: Vscode Detection
    Given the repository uses Vitest for E2E scenario tests
    When I inspect the Vitest configuration
    Then the include pattern should cover test files under "tests/"
    And known generated or manual integration directories should be excluded
