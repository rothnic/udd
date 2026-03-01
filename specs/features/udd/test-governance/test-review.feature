Feature: Test Review Process

# User Need:
#   Teams need a lightweight review process for tests to ensure quality,
#   catch issues early, and maintain consistency across the codebase.
#
# Alternatives Considered:
#   - Mandatory PR reviews: adds latency for small changes
#   - Automated quality gates only: misses semantic issues
#   - No review process: leads to inconsistent test quality
#
# Success Criteria:
#   - New or modified tests can be marked for review
#   - Review status is visible in status output
#   - Review comments can be attached to specific tests
#   - Approved tests are clearly distinguished

  Background:
    Given a UDD project is initialized
    And feature files exist with linked tests

  @phase:1
  Scenario: Mark test as needing review
    Given I create a new test file "tests/auth/signup.test.ts"
    When I run "udd review-request tests/auth/signup.test.ts"
    Then the test should be marked with status "needs-review"
    And "udd status" should show the test as awaiting review

  @phase:1
  Scenario: Approve a test
    Given a test "tests/auth/signup.test.ts" is marked "needs-review"
    When I run "udd review-approve tests/auth/signup.test.ts --by reviewer@example.com"
    Then the test should be marked with status "approved"
    And the approval should include reviewer and timestamp
    And "udd status" should show the test as approved

  @phase:1
  Scenario: Request changes on a test
    Given a test "tests/auth/signup.test.ts" is marked "needs-review"
    When I run "udd review-changes tests/auth/signup.test.ts --comment 'Add edge case for invalid email'"
    Then the test should remain in "needs-review" status
    And the comment should be attached to the test record
    And "udd status --verbose" should show the review comment

  @phase:1
  Scenario: View tests awaiting review
    Given multiple tests exist with different review statuses
    When I run "udd status --needs-review"
    Then only tests with status "needs-review" should be displayed
    And approved and pending tests should be excluded

  @phase:1
  Scenario: Test approval blocks on unreviewed changes
    Given a test "tests/auth/signup.test.ts" is approved
    When I modify the test file
    And I run "udd status"
    Then the test should show status "approved-stale"
    And the output should suggest re-review due to changes

  @phase:1
  @error
  Scenario: Cannot approve own test
    Given I create and submit a test for review
    When I attempt to approve it as the same user
    Then the command should fail with code 1
    And the output should contain "Cannot approve own test"
    And the test should remain in "needs-review" status

  @phase:1
  Scenario: Bulk approve tests in a feature
    Given a feature "auth" has 3 tests all awaiting review
    When I run "udd review-approve --feature auth --by reviewer@example.com"
    Then all 3 tests should be marked as approved
    And the approval should apply to the entire feature
