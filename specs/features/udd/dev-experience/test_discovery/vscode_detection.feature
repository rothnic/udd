Feature: Test Discovery

# User Need: The test-discovery system must detect VS Code environments so integrations (extensions, editor-aware tooling) can enable editor-specific features and developer prompts.

# Alternatives Considered:
# - Require explicit user opt-in via config: reduces false positives but adds friction.
# - Rely on presence of VSCode-specific files only (.vscode): can miss portable or containerized setups.
# - Use runtime handshake with an editor extension: reliable but requires extension installation.

# Success Criteria:
# - VS Code detection reliably identifies typical VS Code environments (local and remote) in tests.
# - Detection results enable or disable editor-specific features predictably and are logged for debugging.
# - Detection logic is non-invasive and provides a clear fallback when detection fails.

  Scenario: Vscode Detection
    Given I am in the right state
    When I do something
    Then something happens
