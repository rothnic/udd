Feature: Dirty Marking

# User Need:
#   When feature specifications change, tests need to be marked as "dirty"
#   (potentially outdated) so developers know to review and update them.
#   This prevents stale tests from giving false confidence.
#
# Alternatives Considered:
#   - Delete and recreate tests: loses history and effort
#   - Silent staleness: leads to untrusted test suites
#   - Automatic test updates: too risky and error-prone
#
# Success Criteria:
#   - Tests are marked dirty when linked features change
#   - Dirty status is visible in all status views
#   - Tests can be marked clean after review
#   - Dirty tests block CI if not addressed

  Background:
    Given a UDD project is initialized
    And a feature file exists at "specs/features/payment/checkout.feature"
    And a test file "tests/payment/checkout.test.ts" links to the feature

  @phase:3
  Scenario: Mark test as dirty when feature changes
    Given the test is currently clean
    When I modify "specs/features/payment/checkout.feature"
    And the system detects the change
    Then "tests/payment/checkout.test.ts" should be marked as dirty
    And the dirty timestamp should be recorded

  @phase:3
  Scenario: View dirty tests in status
    Given multiple tests exist
    And some tests are marked dirty
    When I run "udd status"
    Then dirty tests should be highlighted
    And the count of dirty tests should be displayed
    And each dirty test should show when it became dirty

  @phase:3
  Scenario: Mark test as clean after review
    Given "tests/payment/checkout.test.ts" is marked dirty
    When I run "udd mark-clean tests/payment/checkout.test.ts"
    Then the test should no longer be marked dirty
    And the clean timestamp should be recorded
    And the test should show as up-to-date in status

  @phase:3
  Scenario: Mark all tests in a feature as clean
    Given a feature has 3 dirty tests
    When I run "udd mark-clean --feature payment/checkout"
    Then all 3 tests should be marked clean
    And the operation should complete in a single command

  @phase:3
  Scenario: Dirty test prevents clean CI status
    Given a test is marked dirty
    When CI runs "udd validate"
    Then the validation should fail
    And the error should indicate dirty tests must be reviewed
    And the specific dirty test should be listed

  @phase:3
  Scenario: Force mark clean with confirmation
    Given a test is marked dirty
    When I run "udd mark-clean tests/payment/checkout.test.ts --force"
    Then I should be prompted for confirmation
    And after confirming, the test should be marked clean
    And a warning about forced clean should be recorded

  @phase:3
  @error
  Scenario: Cannot mark non-existent test as clean
    When I run "udd mark-clean tests/nonexistent.test.ts"
    Then the command should exit with code 1
    And the output should indicate the test file does not exist
