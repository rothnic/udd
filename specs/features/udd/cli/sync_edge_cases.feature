Feature: Sync command edge cases

  # These scenarios cover edge cases for the `udd sync` command.
  # Keep steps concrete so E2E tests can exercise filesystem states and
  # verify user-observable output. Do not prescribe internal implementation.

  Scenario: No journeys directory present
    Given I am in an empty project directory
    When I run "udd sync"
    Then the command should exit with code 1
    And the output should contain "No product/journeys/ directory found."

  Scenario: Empty journeys directory
    Given I have a UDD project with an empty "product/journeys" directory
    When I run "udd sync"
    Then the command should exit with code 0
    And the output should contain "No journey files found in product/journeys/"

  Scenario: Invalid journey syntax is ignored with warning
    Given I have a journey file "product/journeys/broken_journey.md" containing invalid markdown
    And the rest of the project is initialized
    When I run "udd sync"
    Then the command should exit with code 0
    And the output should contain "⚠ Could not parse: broken_journey.md"
    And the manifest should not include an entry for "broken_journey"

  Scenario: Dry-run mode previews creations without modifying files or manifest
    Given I have a journey file "product/journeys/new_user.md" referencing "specs/features/auth/signup.feature"
    And the referenced scenario file does not exist
    When I run "udd sync --dry-run"
    Then the command should exit with code 0
    And the output should contain "(dry-run: would create)"
    And the referenced scenario file "specs/features/auth/signup.feature" should not exist
    And the manifest should remain unchanged

  Scenario: Corrupted manifest is recovered by starting fresh
    Given the file "specs/.udd/manifest.yml" exists and contains malformed YAML
    And I have a valid journey file "product/journeys/simple.md"
    When I run "udd sync"
    Then the command should exit with code 0
    And the output should contain "Syncing journeys to scenarios"
    And the manifest should contain an entry for "simple"
