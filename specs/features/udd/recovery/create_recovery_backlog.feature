Feature: Create recovery backlog from detected drift

  As a developer or agent
  I want to create a structured backlog of recovery tasks
  So that I can track progress and work through issues systematically

  Background:
    Given drift detection has found 20 issues
    And the issues include 3 critical, 15 warnings, and 2 info

  @phase:3
  Scenario: Generate recovery backlog file
    When I run "udd doctor --create-backlog"
    Then a file ".udd/recovery-backlog.yml" should be created
    And it should contain a recovery session header:
      | Field     | Type   | Description                   |
      | id        | string | Unique session identifier     |
      | started   | ISO8601| When recovery started         |
      | status    | enum   | in_progress|paused|completed  |
    And it should contain an issues list

  @phase:3
  Scenario: Structure backlog entries
    Given the recovery backlog has been created
    When I read ".udd/recovery-backlog.yml"
    Then each issue entry should have:
      | Field             | Type    | Description                      |
      | id                | string  | Unique issue identifier          |
      | type              | string  | Issue type classification        |
      | severity          | enum    | critical|warning|info            |
      | file              | path    | File path related to issue       |
      | description       | string  | Human-readable description       |
      | autoFixable       | boolean | Can be fixed automatically       |
      | needsUserInput    | boolean | Requires user decision           |
      | dependencies      | array   | IDs of blocking issues           |
      | status            | enum    | pending|in_progress|completed|skipped|

  @phase:3
  Scenario: Prioritize backlog by severity
    Given the recovery backlog exists
    When I view the issues list
    Then issues should be sorted by:
      1. Severity (critical first, then warning, then info)
      2. Dependencies (blocked issues after their dependencies)
      3. Auto-fixable status (auto-fixable before user-input)
    And the first issue should be a critical issue

  @phase:3
  Scenario: Identify parallel work streams
    Given the recovery backlog has multiple issues
    When I analyze dependencies
    Then I should identify issues safe for parallel processing:
      | Issue Type      | Parallel Safe | Reason                        |
      | test_missing    | Yes           | No dependencies between tests |
      | journey_stale   | Yes           | Different domains don't block |
    And I should identify issues requiring serial processing:
      | Issue Type        | Serial Required | Reason                        |
      | scenario_orphan   | Yes             | May link to new scenarios     |
      | test_failing      | Yes             | Depends on scenario fixes     |

  @phase:3
  Scenario: Mark blocked issues
    Given there are issues with dependencies
    When the backlog is created
    Then dependent issues should be marked:
      ```yaml
      - id: "crit-002"
        type: "test_failing"
        dependencies: ["crit-001"]
        status: "blocked"
      ```
    And the blocking issue should be marked:
      ```yaml
      - id: "crit-001"
        type: "scenario_orphan"
        blocks: ["crit-002"]
        status: "pending"
      ```

  @phase:3
  Scenario: Estimate effort for planning
    Given the recovery backlog is being created
    When effort estimation runs
    Then each issue should have estimatedMinutes:
      | Issue Type        | Estimated Minutes | Rationale                     |
      | test_missing      | 2                 | Generate stub quickly         |
      | journey_stale     | 5                 | Sync and verify               |
      | scenario_orphan   | 10                | Decision + implementation     |
      | test_failing      | 30                | Debug and fix                 |
      | validation_error  | 15                | Edit and revalidate           |
    And total estimated time should be calculated

  @phase:3
  Scenario: Display backlog summary
    Given the recovery backlog has been created
    When I run "udd doctor --backlog-status"
    Then I should see a summary:
      ```
      Recovery Backlog Summary
      ========================
      Session: rec-2026-03-02-001
      Status: in_progress

      Issues: 20 total
        Critical: 3 (1 auto-fixable, 2 need input)
        Warning: 15 (12 auto-fixable, 3 need input)
        Info: 2 (0 auto-fixable, 2 need input)

      Progress: 0/20 completed
      Blocked: 2 issues waiting on dependencies

      Estimated time remaining: 2h 15m
      ```

  @phase:4
  Scenario: Export backlog to task manager
    Given the recovery backlog exists
    When I run "udd recovery export --format=github-issues"
    Then GitHub issues should be created for each critical issue
    And each issue should reference the backlog entry ID
    And the backlog should be updated with GitHub issue URLs
