Feature: Select the next critical issue for resolution

  As a developer or agent
  I want to automatically select the highest priority unresolved issue
  So that I can focus on the most impactful recovery work first

  Background:
    Given a UDD project with a recovery backlog
    And the backlog contains unresolved issues

  @phase:3
  Scenario: Read recovery backlog
    Given the file ".udd/recovery-backlog.yml" exists
    When I load the backlog
    Then I should parse all issues with fields:
      | Field              | Type      |
      | id                 | string    |
      | type               | string    |
      | severity           | string    |
      | status             | string    |
      | auto_fixable       | boolean   |
      | dependencies       | array     |
      | needs_user_input   | boolean   |
    And I should filter for issues with "status: pending"

  @phase:3
  Scenario: Select highest priority critical issue
    Given pending issues exist in the backlog
    When I apply priority sorting
    Then I should select by severity order:
      | Priority | Severity  | Selection Criteria              |
      | 1        | critical  | Highest severity first          |
      | 2        | warning   | If no critical issues remain    |
      | 3        | info      | If no critical or warning       |
    And within same severity, I should sort by:
      | Criteria              | Order  |
      | Dependencies satisfied | First  |
      | Auto-fixable           | First  |
      | Timestamp (older)      | First  |

  @phase:3
  Scenario: Check dependencies are satisfied
    Given a candidate issue has dependencies
    When I verify dependency status
    Then I should confirm all dependencies are "completed"
    And if dependencies are not satisfied:
      | Dependency Status | Action                               |
      | pending           | Skip this issue, select another      |
      | in_progress       | Wait or skip                         |
      | blocked           | Skip and flag for review             |
    And blocked issues should be reported to user

  @phase:3
  Scenario: Handle all critical issues resolved
    Given no pending critical issues remain
    When I scan the backlog
    Then I should check for warning issues
    And if warning issues exist, I should:
      | Action                                           |
      | Ask user if they want to continue with warnings  |
      | Present count of remaining warning issues        |
      | Offer to exit and resume later                   |
    And if user chooses to exit, save state for resume

  @phase:3
  Scenario: Mark issue as in-progress
    Given an issue has been selected
    When I update the backlog
    Then I should set:
      | Field           | Value              |
      | status          | in_progress        |
      | started_at      | ISO 8601 timestamp |
      | assigned_to     | current agent/user |
    And I should save the updated backlog
    And I should return the issue details for processing

  @phase:3
  Scenario: Handle empty backlog
    Given the recovery backlog has no pending issues
    When I attempt to select next issue
    Then I should return "no_issues_remaining"
    And I should suggest running final validation
    And I should offer to generate recovery report

  @phase:4
  Scenario: Track selection history
    Given issues are being selected over time
    When each selection is made
    Then I should log to ".udd/selection-history.yml":
      | Field           | Description              |
      | issue_id        | Selected issue           |
      | selected_at     | Timestamp                |
      | selection_reason| Why this issue was chosen|
    And this log should help with audit and debugging
