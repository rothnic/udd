Feature: Final validation after recovery

  As a developer or agent
  I want to run comprehensive final validation
  So that I can confirm recovery was successful

  Background:
    Given a UDD project recovery is complete
    And sync has been run

  @phase:3
  Scenario: Run strict drift detection
    Given the recovery workflow is finishing
    When I run "udd doctor --strict"
    Then it should complete with exit code 0
    And the output should show:
      | Metric              | Expected Value |
      | Critical issues     | 0              |
      | Warning issues      | Optional       |
      | Info issues         | Optional       |
    And any critical issues should fail the validation

  @phase:3
  Scenario: Verify zero critical issues
    Given strict detection has run
    When I check the results
    Then I should confirm no critical issues remain:
      | Critical Issue Type    | Should Not Exist  |
      | scenario_orphan        | 0 orphans         |
      | test_failing           | 0 failing         |
      | validation_error       | 0 errors          |
      | journey_stale          | 0 stale           |
    And I should list any remaining issues

  @phase:3
  Scenario: Check all backlog tasks resolved
    Given the recovery backlog exists
    When I verify completion
    Then I should check:
      | Status    | Expected Count | Action                    |
      | completed | All critical   | Good                      |
      | skipped   | Documented     | Acceptable with reason    |
      | pending   | 0              | Should be empty           |
      | failed    | 0              | Should be resolved        |
    And I should report completion percentage

  @phase:3
  Scenario: Validate no orphaned scenarios
    Given final validation is running
    When I check for orphans
    Then I should verify:
      | Check                                | Expected Result |
      | Every scenario has a journey link    | 100% linked     |
      | No scenarios reference missing journeys | 0 broken refs |
      | Deleted scenarios removed from manifest | 0 ghost entries |
    And any orphans found should be reported as failures

  @phase:3
  Scenario: Check file integrity
    Given all files should be valid
    When I validate file integrity
    Then I should verify:
      | Check                       | Method                         |
      | All feature files parse     | Gherkin parser                 |
      | All test files are valid TS | TypeScript compiler            |
      | Manifest is valid YAML      | YAML parser                    |
      | No syntax errors            | Lint all modified files        |
    And any parse errors should fail validation

  @phase:3
  Scenario: Generate validation summary
    Given all checks have passed
    When I generate the summary
    Then it should include:
      | Section              | Content                           |
      | Status               | PASSED or FAILED                  |
      | Critical Issues      | Count (should be 0)               |
      | Warning Issues       | Count (optional)                  |
      | Files Validated      | Total number checked              |
      | Backlog Status       | Completion percentage             |
      | Time Taken           | Duration of recovery session      |
    And I should save it to ".udd/validation-summary.yml"

  @phase:4
  Scenario: Integration with CI/CD
    Given final validation runs in CI
    When the command executes
    Then it should:
      | Behavior                                  |
      | Exit 0 on success                         |
      | Exit non-zero on failure                  |
      | Output JSON with --json flag              |
      | Be usable in GitHub Actions               |
    And it should block deployment if failed
