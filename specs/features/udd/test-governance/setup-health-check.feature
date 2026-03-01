Feature: Setup Health Checks

# User Need:
#   When setting up test governance in a project, teams need
#   validation that the environment is correctly configured
#   and all dependencies are in place to prevent silent failures.
#
# Alternatives Considered:
#   - Manual verification: error-prone and incomplete
#   - Learn through failures: wastes time on simple issues
#   - Documentation-only: often outdated and ignored
#
# Success Criteria:
#   - Setup command validates prerequisites
#   - Health checks verify configuration
#   - Missing components are clearly identified
#   - Remediation guidance is provided

  Background:
    Given I am setting up test governance for a project

  @phase:3
  Scenario: Health check passes on valid setup
    Given the project has valid UDD structure
    And all dependencies are installed
    When I run "udd health-check"
    Then the command should exit with code 0
    And the output should indicate all checks passed
    And a summary should show configuration status

  @phase:3
  Scenario: Health check detects missing manifest
    Given the project lacks ".udd/manifest.yml"
    When I run "udd health-check"
    Then the check should fail
    And the output should indicate missing manifest
    And it should suggest running "udd sync"

  @phase:3
  Scenario: Health check detects missing test directory
    Given the "tests/" directory does not exist
    When I run "udd health-check"
    Then the check should fail
    And the output should indicate missing test directory
    And it should suggest creating the directory

  @phase:3
  Scenario: Health check validates git hooks
    Given hooks should be installed but are not
    When I run "udd health-check"
    Then the check should warn about missing hooks
    And the output should suggest running "udd hooks install"

  @phase:3
  Scenario: Health check detects broken links
    Given test files link to non-existent features
    When I run "udd health-check"
    Then the check should fail
    And broken links should be listed
    And remediation steps should be suggested

  @phase:3
  Scenario: Health check validates CI configuration
    Given CI configuration should exist
    When I run "udd health-check"
    Then it should check for CI configuration files
    And it should validate UDD integration in CI
    And missing CI integration should be flagged

  @phase:3
  Scenario: Health check tests write permissions
    Given the project directory may have permission issues
    When I run "udd health-check"
    Then it should verify write access to ".udd/" directory
    And it should verify write access to manifest file
    And permission errors should be reported

  @phase:3
  Scenario: Health check provides detailed diagnostics
    When I run "udd health-check --verbose"
    Then detailed information should be shown for each check
    And passed checks should show their values
    And failed checks should show expected vs actual

  @phase:3
  Scenario: Health check suggests fixes
    Given some checks are failing
    When I run "udd health-check --fix"
    Then it should attempt automatic fixes where possible
    And it should report which issues were fixed
    And remaining issues should still be listed

  @phase:3
  Scenario: Health check integrates with status
    Given I want health as part of status output
    When I run "udd status --health"
    Then health check results should be included
    And critical issues should affect overall status
