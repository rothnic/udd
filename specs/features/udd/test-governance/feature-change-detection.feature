Feature: Feature Change Detection

# User Need:
#   When feature specifications change, teams need to know which tests
#   may be affected so they can update tests proactively rather than
#   discovering failures later in CI.
#
# Alternatives Considered:
#   - Manual tracking: error-prone and often forgotten
#   - Always run all tests: slow and wasteful
#   - Git diff analysis alone: misses semantic changes
#
# Success Criteria:
#   - Changes to feature files are detected automatically
#   - Linked tests are flagged as potentially stale
#   - Developers are notified before commit
#   - CI validates that stale tests are updated

  Background:
    Given a UDD project is initialized
    And a feature file exists at "specs/features/auth/login.feature"
    And a test file "tests/auth/login.test.ts" links to the feature

  @phase:3
  Scenario: Detect change in feature file
    Given the feature file "auth/login.feature" has content
    When I modify the feature file content
    And I run "udd detect-changes"
    Then the change should be detected
    And the linked test should be flagged as potentially stale

  @phase:3
  Scenario: Status shows stale tests after feature change
    Given I modified "specs/features/auth/login.feature"
    And I have not updated "tests/auth/login.test.ts"
    When I run "udd status"
    Then the output should show "auth/login" as having stale tests
    And the output should recommend reviewing the linked tests

  @phase:3
  Scenario: New scenario added to feature
    Given a feature has 3 scenarios
    When I add a 4th scenario to the feature file
    And I run "udd detect-changes"
    Then the change should be detected as "new-scenario"
    And the output should suggest adding a test for the new scenario

  @phase:3
  Scenario: Scenario removed from feature
    Given a feature has 3 scenarios with corresponding tests
    When I remove 1 scenario from the feature file
    And I run "udd detect-changes"
    Then the change should be detected as "removed-scenario"
    And the output should warn about orphaned tests

  @phase:3
  Scenario: Scenario modified in feature
    Given a scenario has existing tests
    When I modify the scenario steps in the feature file
    And I run "udd detect-changes"
    Then the change should be detected as "modified-scenario"
    And the output should recommend reviewing the scenario tests

  @phase:3
  Scenario: Ignore whitespace-only changes
    Given a feature file exists
    When I modify only whitespace or formatting
    And I run "udd detect-changes"
    Then no changes should be detected
    And tests should not be flagged as stale

  @phase:3
  Scenario: Compare feature file with last known state
    Given the manifest tracks feature file hashes
    When I run "udd detect-changes --since-last-sync"
    Then only changes since the last manifest update should be reported
    And previously detected changes should not be re-reported
