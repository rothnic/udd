Feature: CI Validation

# User Need:
#   CI pipelines need to validate that all test governance rules
#   are satisfied before merging to ensure main branch quality and
#   prevent accumulation of technical debt.
#
# Alternatives Considered:
#   - Local-only validation: inconsistencies across environments
#   - Manual PR checks: unreliable and forgotten
#   - Post-merge validation: too late to prevent issues
#
# Success Criteria:
#   - CI can run comprehensive governance validation
#   - All dirty tests fail the build
#   - Missing test coverage is reported
#   - Exit codes signal pass/fail clearly

  Background:
    Given a UDD project is initialized
    And the project has a CI configuration

  @phase:3
  Scenario: CI validation passes on clean project
    Given all features have linked tests
    And all tests are marked clean
    And no governance rules are violated
    When CI runs "udd validate --ci"
    Then the command should exit with code 0
    And the output should indicate validation passed

  @phase:3
  Scenario: CI validation fails on dirty tests
    Given a test is marked dirty
    When CI runs "udd validate --ci"
    Then the command should exit with code 1
    And the output should list all dirty tests
    And the build should be marked as failed

  @phase:3
  Scenario: CI reports missing test coverage
    Given a feature has scenarios without linked tests
    When CI runs "udd validate --ci"
    Then the validation should fail
    And the output should list features with missing coverage
    And the specific scenarios without tests should be identified

  @phase:3
  Scenario: CI generates machine-readable report
    When CI runs "udd validate --ci --format json"
    Then the output should be valid JSON
    And the report should include validation status
    And it should include lists of issues by category
    And it should include summary statistics

  @phase:3
  Scenario: CI validation includes orphaned test detection
    Given a test file exists that links to a deleted feature
    When CI runs "udd validate --ci"
    Then the validation should fail
    And the orphaned test should be reported
    And remediation suggestions should be provided

  @phase:3
  Scenario: CI validation checks test status
    Given tests exist that are currently failing
    When CI runs "udd validate --ci"
    Then the validation should fail
    And failing tests should be listed
    And failure details should be included

  @phase:3
  Scenario: CI validation respects phase tags
    Given the project current_phase is 1
    And a scenario is tagged with @phase:2
    When CI runs "udd validate --ci"
    Then the @phase:2 scenario should not cause validation failure
    And the report should indicate deferred scenarios

  @phase:3
  Scenario: CI generates artifacts for review
    When CI runs "udd validate --ci --artifacts"
    Then validation reports should be saved to the artifacts directory
    And the report should be available for download
    And historical trends should be tracked
