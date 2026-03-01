Feature: Sync with Dirty Marking

# User Need:
#   When running sync operations, changes to feature files should
#   automatically trigger dirty marking on affected tests so developers
#   are immediately aware of what needs attention.
#
# Alternatives Considered:
#   - Separate dirty marking command: easy to forget
#   - Manual dirty marking: error-prone
#   - No automatic marking: staleness accumulates
#
# Success Criteria:
#   - Sync detects feature file changes
#   - Affected tests are automatically marked dirty
#   - Sync output clearly indicates dirty tests
#   --dry-run shows what would be marked dirty

  Background:
    Given a UDD project is initialized
    And feature files exist with linked tests

  @phase:3
  Scenario: Sync marks changed feature tests as dirty
    Given "specs/features/auth/login.feature" has linked tests
    And I have modified the feature file
    When I run "udd sync"
    Then the linked tests should be automatically marked dirty
    And the sync output should list the affected tests

  @phase:3
  Scenario: Sync output shows dirty test summary
    Given multiple feature files have changed
    When I run "udd sync"
    Then the output should include a "Dirty Tests" section
    And the section should count how many tests were marked dirty
    And it should list each feature with dirty tests

  @phase:3
  Scenario: Dry run shows dirty marking without applying
    Given I have modified "specs/features/auth/login.feature"
    When I run "udd sync --dry-run"
    Then the output should indicate which tests would be marked dirty
    And no tests should actually be marked dirty
    And the manifest should remain unchanged

  @phase:3
  Scenario: Sync does not re-mark already dirty tests
    Given a test is already marked dirty
    And the feature file changes again
    When I run "udd sync"
    Then the test should remain dirty
    And the dirty timestamp should reflect the most recent change
    And no duplicate dirty entries should be created

  @phase:3
  Scenario: Sync marks tests dirty for new scenarios only
    Given I add a new scenario to "specs/features/auth/login.feature"
    And existing scenarios are unchanged
    When I run "udd sync"
    Then tests should be marked dirty with reason "new-scenario"
    And the specific new scenario should be identified

  @phase:3
  Scenario: Sync with no changes does not mark anything dirty
    Given no feature files have changed since last sync
    When I run "udd sync"
    Then no tests should be marked dirty
    And the output should indicate "No changes detected"

  @phase:3
  Scenario: Sync reports stale tests separately from dirty
    Given some tests are dirty due to feature changes
    And some tests are failing
    When I run "udd sync"
    Then the output should have a "Dirty Tests" section
    And a separate "Test Status" section should show pass/fail
    And the distinction between dirty and failing should be clear
