Feature: Editor Test Status

  Scenario: Editor Status
    Given the repository has VS Code Vitest settings
    When I inspect ".vscode/settings.json"
    Then static AST collection should be disabled for reliable scenario discovery
