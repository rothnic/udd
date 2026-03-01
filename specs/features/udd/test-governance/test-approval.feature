Feature: Approve Tests

# User Need:
#   Team leads and senior developers need a streamlined way to
#   approve tests that have been reviewed to maintain quality
#   standards and track what has been validated.
#
# Alternatives Considered:
#   - Git-based approval: mixes concerns and lacks metadata
#   - External approval tools: adds overhead
#   - Informal approval: not trackable or enforceable
#
# Success Criteria:
#   - Tests can be approved via CLI
#   - Approval records who approved and when
#   - Bulk approval is supported
#   - Approval status is visible in all views

  Background:
    Given a UDD project is initialized
    And test files exist awaiting approval

  @phase:3
  Scenario: Approve single test
    Given a test "tests/auth/signup.test.ts" needs approval
    When I run "udd approve tests/auth/signup.test.ts --by lead@example.com"
    Then the test should be marked as approved
    And the approver should be recorded as "lead@example.com"
    And the approval timestamp should be recorded

  @phase:3
  Scenario: Approve multiple tests at once
    Given tests "tests/auth/signup.test.ts" and "tests/auth/login.test.ts" need approval
    When I run "udd approve tests/auth/signup.test.ts tests/auth/login.test.ts --by lead@example.com"
    Then both tests should be marked as approved
    And the approval should apply to all specified tests

  @phase:3
  Scenario: Approve all tests in a feature
    Given the "auth" feature has 5 tests awaiting approval
    When I run "udd approve --feature auth --by lead@example.com"
    Then all 5 tests should be marked as approved
    And the feature approval status should be updated

  @phase:3
  Scenario: Approve with comment
    Given a test needs approval with context
    When I run "udd approve tests/auth/signup.test.ts --by lead@example.com --comment 'Good coverage of edge cases'"
    Then the approval should include the comment
    And the comment should be visible in status output

  @phase:3
  Scenario: View pending approvals
    Given some tests are approved and some are pending
    When I run "udd status --pending-approvals"
    Then only tests awaiting approval should be shown
    And approved tests should be excluded
    And wait time since submission should be displayed

  @phase:3
  Scenario: Revoke approval
    Given a test was approved in error
    When I run "udd revoke-approval tests/auth/signup.test.ts --by lead@example.com"
    Then the test should return to "needs-review" status
    And the revocation should be recorded
    And the previous approval should be retained in history

  @phase:3
  @error
  Scenario: Cannot approve already approved test
    Given a test is already approved
    When I run "udd approve tests/auth/signup.test.ts --by other@example.com"
    Then the command should warn about existing approval
    And the new approval should be recorded as re-approval

  @phase:3
  Scenario: Approval shows in test history
    Given a test has been approved multiple times
    When I run "udd test-history tests/auth/signup.test.ts"
    Then the approval history should be displayed
    And each approval should show approver and date
    And comments should be included in the history

  @phase:3
  Scenario: Approval required before merge
    Given the project requires approval for merge
    And a test is not yet approved
    When CI runs validation
    Then the build should fail
    And the output should indicate approval is required
