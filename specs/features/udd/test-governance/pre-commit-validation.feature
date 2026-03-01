Feature: Pre-Commit Validation

# User Need:
#   Before committing code, developers need validation that tests
#   are up-to-date, features are properly linked, and no governance
#   rules are violated to maintain code quality.
#
# Alternatives Considered:
#   - Post-commit validation: issues enter history
#   - CI-only validation: slower feedback loop
#   - Optional validation: inconsistent enforcement
#
# Success Criteria:
#   - Staged changes are validated pre-commit
#   - Dirty tests block commits by default
#   - Validation failures have clear error messages
#   - Bypass mechanism exists for emergencies

  Background:
    Given a UDD project is initialized
    And git hooks are installed
    And I have staged changes ready to commit

  @phase:1
  Scenario: Pre-commit passes with clean tests
    Given all tests linked to changed features are clean
    And no governance rules are violated
    When I run "git commit -m 'update feature'"
    Then the commit should succeed
    And the pre-commit hook should exit with code 0

  @phase:1
  Scenario: Pre-commit blocks when tests are dirty
    Given I have modified "specs/features/auth/login.feature"
    And I have not marked the linked tests as clean
    When I run "git commit -m 'update feature'"
    Then the commit should be blocked
    And the output should indicate dirty tests must be reviewed
    And the specific dirty tests should be listed

  @phase:1
  Scenario: Pre-commit validates only staged files
    Given I have unstaged changes that violate rules
    And my staged changes are clean
    When I run "git commit -m 'clean changes'"
    Then the commit should succeed
    And unstaged violations should not block the commit

  @phase:1
  Scenario: Pre-commit detects broken feature links
    Given I staged a test file with an invalid @feature reference
    When I run "git commit -m 'add test'"
    Then the commit should be blocked
    And the output should indicate the broken link
    And the invalid reference should be shown

  @phase:1
  Scenario: Bypass pre-commit with flag
    Given tests are dirty but I need to commit anyway
    When I run "git commit -m 'WIP: feature update' --no-verify"
    Then the commit should succeed
    And a warning should be logged about bypassed validation

  @phase:1
  Scenario: Pre-commit shows summary of staged changes
    Given I have staged multiple feature and test files
    When the pre-commit hook runs
    Then it should display a summary of staged files
    And it should indicate which features are affected
    And validation progress should be shown

  @phase:1
  Scenario: Pre-commit runs fast for small changes
    Given I have staged only one small file
    When I run "git commit -m 'quick fix'"
    Then validation should complete within 2 seconds
    And the commit should proceed without noticeable delay

  @phase:1
  Scenario: Pre-commit detects missing tests for new scenarios
    Given I add a new scenario to a feature file
    And I do not add a corresponding test
    When I run "git commit -m 'add scenario'"
    Then the commit should be blocked
    And the output should indicate missing test coverage
    And the specific scenario should be identified
