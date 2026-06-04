Feature: Commit Hooks

  Scenario: Commit Hooks
    Given the repository has a Husky pre-commit hook
    When I inspect the hook configuration
    Then the hook should run lint-staged
    And lint-staged should run related tests, type checking, and Biome on staged TypeScript files
