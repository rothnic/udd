Feature: Verify resolution and mark issue complete

  As a developer or agent
  I want to verify that a resolution actually fixed the issue
  So that I can confidently mark it complete and move on

  Background:
    Given a UDD project in recovery mode
    And a resolution has been executed for an issue

  @phase:3
  Scenario: Run targeted validation
    Given an issue has been resolved
    When I run targeted validation
    Then I should validate specific to issue type:
      | Issue Type         | Validation Method                        |
      | scenario_orphan    | Check journey link exists and is valid   |
      | test_failing       | Run the specific test, verify passes     |
      | journey_stale      | Check timestamp is recent                |
      | validation_error   | Re-run validation on the file            |
      | phase_mismatch     | Check phase tag matches intent           |
    And validation should be faster than full doctor run

  @phase:3
  Scenario: Update backlog status to completed
    Given validation passes
    When I update the backlog
    Then I should set:
      | Field              | Value                     |
      | status             | completed                 |
      | completed_at       | ISO 8601 timestamp        |
      | validation_result  | passed                    |
    And I should move the issue to "resolved" section
    And I should save the updated backlog file

  @phase:3
  Scenario: Log resolution for reporting
    Given an issue has been completed
    When I log the resolution
    Then I should append to ".udd/resolution-log.yml":
      | Field              | Description                    |
      | issue_id           | Original issue identifier      |
      | issue_type         | Type of drift issue            |
      | severity           | critical/warning/info          |
      | resolution_type    | auto/manual                    |
      | decision           | What was decided (if manual)   |
      | time_to_resolve    | Duration from start to complete|
      | completed_at       | ISO 8601 timestamp             |
    And this log feeds into recovery reports

  @phase:3
  Scenario: Handle validation failure
    Given validation fails after resolution
    When I detect the failure
    Then I should:
      | Action                                         |
      | Mark issue status as "resolution_failed"       |
      | Capture validation error details               |
      | Restore files if possible                      |
      | Flag for manual intervention                   |
      | Offer user options: retry, skip, or debug      |
    And failed resolutions should not block other issues

  @phase:3
  Scenario: Update progress statistics
    Given issues are being completed
    When I update statistics
    Then I should track:
      | Metric                   | Description                    |
      | total_issues             | Total in original backlog      |
      | completed_count          | Successfully resolved          |
      | failed_count             | Resolutions that failed        |
      | skipped_count            | User chose to skip             |
      | remaining_count          | Still pending                  |
      | completion_percentage    | Completed / Total * 100        |
    And display progress to user

  @phase:3
  Scenario: Check for dependent issues
    Given an issue has been completed
    When I check the dependency graph
    Then I should identify issues that were blocked by this one
    And I should update their status from "blocked" to "pending"
    And I should notify that new issues are now unblocked

  @phase:4
  Scenario: Generate completion certificate
    Given all issues in a session are completed
    When I generate the certificate
    Then it should include:
      | Section              | Content                           |
      | Session ID           | Unique recovery session           |
      | Start/End Time       | Session duration                  |
      | Issues Resolved      | Count by severity                 |
      | Time Saved           | Estimated vs manual recovery      |
      | Files Modified       | Summary of changes                |
    And it should be saved for historical records
