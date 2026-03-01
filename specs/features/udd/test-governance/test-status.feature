Feature: Test Status Visibility

# User Need:
#   Developers and CI systems need clear visibility into test status
#   (passing, failing, skipped, not yet run) to understand project health
#   and prioritize work effectively.
#
# Alternatives Considered:
#   - Rely on test runner output alone: inconsistent format across runners
#   - Store status in external dashboard: adds latency and complexity
#   - Manual status updates: unreliable and quickly outdated
#
# Success Criteria:
#   - Status is visible at feature, scenario, and project level
#   - Last run timestamp and duration are tracked
#   - Failed tests show clear error context
#   - Status persists between runs for comparison

  Background:
    Given a UDD project is initialized
    And test files exist with valid feature linkages

  @phase:3
  Scenario: View test status for all features
    Given tests exist with various statuses
    When I run "udd status --tests"
    Then the output should show each feature with test counts
    And the output should include passing/failing/pending counts
    And the output should show last run timestamps

  @phase:3
  Scenario: Feature shows mixed test status
    Given a feature "checkout" has 3 scenarios
    And 2 scenarios have passing tests
    And 1 scenario has a failing test
    When I run "udd status"
    Then "checkout" should show status "partial"
    And the output should indicate "2 passing, 1 failing"

  @phase:3
  Scenario: Test never run shows as pending
    Given a feature "new-feature" has scenarios
    And no tests have been executed for "new-feature"
    When I run "udd status"
    Then "new-feature" should show status "pending"
    And the output should indicate tests need to be run

  @phase:3
  Scenario: Failed test shows error details
    Given a test "auth/login.e2e.test.ts" has failed
    And the failure is "AssertionError: expected 200 but got 401"
    When I run "udd status --verbose"
    Then the output should include the failure message
    And the output should show the failing test file path
    And the output should suggest checking the test output

  @phase:3
  Scenario: Filter status by outcome
    Given tests exist with passing, failing, and pending statuses
    When I run "udd status --failed-only"
    Then only features with failing tests should be displayed
    And passing and pending features should be hidden

  @phase:3
  Scenario: Test status aggregates across test types
    Given feature "payment" has unit tests, integration tests, and e2e tests
    When I run "udd status"
    Then the output should show aggregated status
    And the output should indicate test type breakdown
    And a failure in any type should mark feature as failing
