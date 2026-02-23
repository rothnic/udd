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
