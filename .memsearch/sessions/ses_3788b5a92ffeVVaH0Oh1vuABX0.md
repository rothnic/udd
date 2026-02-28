# Create init edge cases feature file (@Sisyphus-Junior subagent)

**ID**: ses_3788b5a92ffeVVaH0Oh1vuABX0
**Project ID**: ad761ea6174e58ed763fc75290c3f403ed51079d
**Created**: 2/22/2026, 4:24:54 PM
**Stats**: 5 files changed, +217 -0

---

## USER (4:25:06 PM)

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


Feature: Manifest Corruption and Recovery

  As a developer using udd
  I want the CLI to detect corrupted or inconsistent manifests
  So I can be informed about what went wrong and how to recover

  # Notes:
  # - Scenarios are focused on user-observable reporting. They avoid
  #   prescribing internal implementation details. Tests will set up
  #   filesystem fixtures (broken manifest, missing scenario files, etc.)
  #   and assert on command exit codes and stdout/stderr messages.

  Scenario: Detect invalid YAML in manifest
    Given a project with product/journeys/ and a specs/.udd/manifest.yml that contains invalid YAML
    When I run "udd sync"
    Then the command should exit with code 0
    And the output should contain "Could not parse manifest" or "invalid manifest"
    And the sync should continue as if no manifest existed

  Scenario: Report deleted journey referenced in manifest
    Given a project where specs/.udd/manifest.yml references a journey "old_journey" but product/journeys/old_journey.md has been deleted
    When I run "udd status"
    Then the command should exit with code 0
    And the output should contain "manifest references missing journey: old_journey"
    And the output should suggest: "remove the manifest entry or run 'udd sync' to refresh manifest"

  Scenario: Report missing scenario referenced by a journey in the manifest
    Given a project where product/journeys/new_journey.md links to `specs/features/foo/bar.feature` but that scenario file is missing and manifest lists it
    When I run "udd sync"
    Then the command should exit with code 0
    And the output should contain "missing scenario: specs/features/foo/bar.feature"
    And the output should indicate that the scenario will be created when confirmed, or that dry-run will show proposed creation

  Scenario: Detect scenario hash mismatch between file and manifest
    Given a project where specs/.udd/manifest.yml lists a scenario `specs/features/baz/qux.feature` with a stored hash that does not match the file contents
    When I run "udd status"
    Then the command should exit with code 0
    And the output should contain "hash mismatch for specs/features/baz/qux.feature"
    And the output should show the manifest hash and the current file hash


# Feature: Orphan detection in status output
#
# Purpose: Ensure the status command reports scenarios that exist in features
# but are not referenced by any use case or journey. Keep steps implementation-
# agnostic and focused on observable CLI output and JSON output.

Feature: Orphan detection

  Background:
    Given I have a valid UDD spec structure

  # Happy path: status lists orphaned scenarios in human output
  Scenario: Orphaned scenarios are shown in human-readable status
    Given there is a feature with a scenario "area/feature/unused_scenario"
    And no use case or journey references "area/feature/unused_scenario"
    When I run "udd status"
    Then the command should exit with code 0
    And the output should contain "Orphaned Scenarios"
    And the output should contain "area/feature/unused_scenario"

  # Machine-readable JSON output includes orphan list
  Scenario: Orphaned scenarios are included in JSON status output
    Given there is a feature with a scenario "area/feature/orphan_json"
    And no use case or journey references "area/feature/orphan_json"
    When I run "udd status --json"
    Then the command should exit with code 0
    And the JSON output should have a top-level key "orphaned_scenarios"
    And the JSON array at "orphaned_scenarios" should contain "area/feature/orphan_json"

  # Negative case: referenced scenario is not reported as orphan
  Scenario: Referenced scenarios are not reported as orphans
    Given there is a feature with a scenario "area/feature/linked_scenario"
    And a use case references "area/feature/linked_scenario"
    When I run "udd status --json"
    Then the command should exit with code 0
    And the JSON array at "orphaned_scenarios" should not contain "area/feature/linked_scenario"

  # Edge: multiple orphans aggregated and counted in human output summary
  Scenario: Multiple orphaned scenarios are summarized and listed
    Given there are features with scenarios "area/feature/orphan1" and "area/feature/orphan2"
    And neither scenario is referenced by any use case or journey
    When I run "udd status"
    Then the command should exit with code 0
    And the output should contain "orphaned scenario(s)"
    And the output should contain "area/feature/orphan1"
    And the output should contain "area/feature/orphan2"


Feature: udd status edge cases

  # These scenarios describe observable, deterministic CLI behavior when the
  # status command encounters uncommon repository states. Keep steps focused on
  # filesystem fixtures and printed output; avoid asserting on internal types.

  Scenario: No product directory present
    Given I am in a clean temporary directory without a "product" folder
    When I run "udd status"
    Then the command should exit with code 0
    And the output should contain "Project Status"
    And the output should contain "No journeys found" or "Project Status"

  Scenario: specs/.udd/manifest.yml missing while product/journeys exists
    Given I have a "product/journeys" directory with one valid journey file
    And there is no "specs/.udd/manifest.yml"
    When I run "udd status"
    Then the command should exit with code 0
    And the output should list the journey by name
    And the output should not crash or print a stack trace

  Scenario: Corrupted manifest YAML
    Given I have a "product/journeys" directory with one valid journey file
    And "specs/.udd/manifest.yml" exists but contains invalid YAML
    When I run "udd status"
    Then the command should exit with code 0
    And the output should warn about manifest parse issues or behave as if manifest is absent
    And the journey should still be listed in the output

  Scenario: Missing specs/features metadata file for a feature
    Given I have a feature directory under "specs/features" that does not contain "_feature.yml"
    When I run "udd status"
    Then the command should exit with code 0
    And the output should include the feature directory in Active Features only if metadata is present
    And the command should not crash

  Scenario: Unparseable journey file (invalid UTF-8 or binary noise)
    Given I have a "product/journeys" directory with one journey file containing binary or invalid text
    When I run "udd status"
    Then the command should exit with code 0
    And the output should warn about skipping the journey or treat it as unnamed
    And the command should not print a stack trace


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


