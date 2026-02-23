Feature: udd init edge cases

  # User Need: Ensure udd init behaves predictably when the repository
  # already contains partial or invalid product/specs state.

  Background:
    Given I am in the project root

  Scenario: Running "udd init" when product/ already exists
    Given a directory "product" exists with minimal files
    When I run "udd init"
    Then the command should exit with code 0
    And the output should contain "UDD already initialized"
    And no files outside product/ and specs/ are modified

  Scenario: User chooses not to reinitialize existing product/
    Given a directory "product" exists with minimal files
    And I answer "no" to the reinitialize prompt
    When I run "udd init"
    Then the command should exit with code 0
    And the output should contain "Reinitialize? This will overwrite existing files."

  Scenario: Partial state present (specs/.udd exists but product/ missing)
    Given a directory "specs/.udd" exists with a manifest file
    And no "product" directory exists
    When I run "udd init"
    Then the command should exit with code 0
    And the command should create "product/README.md"
    And the output should contain "✓ Created product/README.md"

  Scenario: Empty product directory (exists but no journeys)
    Given a directory "product" exists and is empty
    When I run "udd init"
    Then the command should exit with code 0
    And the command should create "product/journeys/new_user_onboarding.md"

  Scenario: Invalid files present in product (non-markdown files)
    Given a directory "product" exists containing an unexpected file "product/.DS_Store"
    When I run "udd init"
    Then the command should exit with code 0
    And the output should contain "✓ Created product/README.md"
    And the unexpected files should be left untouched

  Scenario: Skip prompts with --yes flag when already initialized
    Given a directory "product" exists with minimal files
    When I run "udd init --yes"
    Then the command should exit with code 0
    And the output should NOT contain "Reinitialize?"
