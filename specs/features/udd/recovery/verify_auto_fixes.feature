Feature: Verify auto-fixes applied during recovery

  As a developer or agent
  I want to verify that auto-fixes actually resolved the issues
  So that I can trust the automated recovery process

  Background:
    Given a UDD project in recovery mode
    And auto-fixes have been executed

  @phase:3
  Scenario: Re-run drift detection after auto-fixes
    When I run "udd doctor --json"
    Then the command should complete successfully
    And the output should show reduced issue count:
      | Metric              | Before | After | Reduction |
      | Total issues        | 20     | 12    | 8         |
      | Critical issues     | 3      | 3     | 0         |
      | Warning issues      | 15     | 8     | 7         |
      | Info issues         | 2      | 1     | 1         |
    And all auto-fixable issues should be resolved

  @phase:3
  Scenario: Verify specific fix types
    Given auto-fixes were applied for issue types:
      | Issue Type         | Count |
      | test_missing       | 5     |
      | journey_stale      | 3     |
      | manifest_corrupt   | 1     |
    When I verify each fix type
    Then I should confirm:
      | Fix Type           | Verification Method                | Expected Result |
      | test_missing       | Check test file exists             | File present    |
      | journey_stale      | Check timestamp updated            | Within 1 min    |
      | manifest_corrupt   | Validate manifest structure        | Valid JSON/YAML |
    And any failed verifications should be logged

  @phase:3
  Scenario: Update backlog with fix status
    Given the recovery backlog exists
    When auto-fixes are verified
    Then I should update each fixed issue:
      | Field          | Value                              |
      | status         | completed                          |
      | fixed_at       | ISO 8601 timestamp                 |
      | fix_method     | auto                               |
      | verified       | true                               |
    And completed issues should be moved to "resolved" section
    And I should report completion statistics

  @phase:3
  Scenario: Report failed auto-fixes
    Given some auto-fixes failed to resolve issues
    When I check the fix results
    Then I should identify failed fixes:
      | Issue ID    | Type           | Error                     |
      | warn-005    | test_missing   | Permission denied         |
      | warn-012    | journey_stale  | File locked by process    |
    And failed fixes should be marked "status: failed"
    And they should be re-categorized as requiring manual handling
    And I should include error details for debugging

  @phase:3
  Scenario: Verify no new drift introduced
    Given auto-fixes have been applied
    When I run comprehensive validation
    Then I should confirm no new issues were created
    And I should verify:
      | Check                    | Expected Result |
      | No orphaned scenarios    | 0 orphans       |
      | No broken references     | 0 broken links  |
      | Valid manifest           | passes lint     |
      | Sync not required        | no stale files  |
    And any new issues should be flagged immediately

  @phase:4
  Scenario: Generate auto-fix verification report
    Given verification is complete
    When I generate the report
    Then it should include:
      | Section              | Content                           |
      | Summary              | Fixed X of Y auto-fixable issues  |
      | Success Details      | List of successfully fixed issues |
      | Failure Details      | List of failed fixes with errors  |
      | Time Spent           | Duration of auto-fix phase        |
      | Next Steps           | Instructions for manual fixes     |
    And the report should be saved to ".udd/recovery-reports/"
