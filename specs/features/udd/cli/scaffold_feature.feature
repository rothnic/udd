Feature: Scaffold Feature from Template

# User Need:
#   Users must quickly create new feature scaffolds from a standard SysML-informed template so they can write scenarios and tests
#   without boilerplate. This reduces onboarding friction for contributors and ensures consistent feature structure.
#
# Alternatives Considered:
#   - Manual file creation: Simple but error-prone and inconsistent for teams.
#   - Editor snippets: Faster for individuals but not standardized across contributors and CI.
#   - Yeoman-style generator: Powerful but heavier; opted for a lightweight CLI command that fits UDD workflows.
#
# Success Criteria:
#   - Command creates the feature file in the correct path with expected content and valid Gherkin.
#   - Command returns clear, non-zero exit codes and messages on failure modes (missing directory, name collisions, invalid names).
#   - Scaffolds are idempotent when appropriate and surface helpful error messages when they are not.

  Scenario: Create new feature from SysML template
    Given I am in a UDD project
    When I run "udd new feature test_domain sample_feature"
    Then the command should exit with code 0
    And a feature file should be created at "specs/features/test_domain/sample_feature/sample_feature.feature"
    And the feature file should contain "Feature: Sample Feature"
    And the feature file should be valid Gherkin

  Scenario: Fail when target directory does not exist
    Given I am in a UDD project
    And the parent path "specs/features/nonexistent_domain" does not exist
    When I run "udd new feature nonexistent_domain new_feature"
    Then the command should exit with a non-zero code
    And the command should print an error containing "parent directory does not exist" or "cannot create"
    And no feature file should be created under "specs/features/nonexistent_domain/new_feature"

  Scenario: Fail when feature name already exists (duplicate)
    Given I am in a UDD project
    And a feature exists at "specs/features/test_domain/existing_feature/existing_feature.feature"
    When I run "udd new feature test_domain existing_feature"
    Then the command should exit with a non-zero code
    And the command should print an error containing "already exists" or "duplicate"
    And the existing feature file should remain unchanged

  Scenario: Fail when feature name format is invalid
    Given I am in a UDD project
    When I run "udd new feature test_domain invalid/name"
    Then the command should exit with a non-zero code
    And the command should print a validation error mentioning "invalid feature name" or "name may only contain"
    And no feature file should be created for the invalid name
