Feature: Generate recovery report

  As a developer or agent
  I want to generate a comprehensive recovery report
  So that we can review what was done and learn for next time

  Background:
    Given a UDD project recovery has completed
    And validation has passed

  @phase:3
  Scenario: Compile recovery statistics
    Given all recovery data is available
    When I compile statistics
    Then I should calculate:
      | Metric                  | Description                       |
      | Issues Found            | Total detected by doctor          |
      | Issues Fixed            | Successfully resolved             |
      | Issues Skipped          | User chose to defer               |
      | Auto-fixes Applied      | Fixed automatically               |
      | Manual Resolutions      | Required user input               |
      | Critical Issues         | High severity count               |
      | Warning Issues          | Medium severity count             |
      | Info Issues             | Low severity count                |

  @phase:3
  Scenario: Calculate time spent per phase
    Given timestamps were recorded
    When I analyze timing
    Then I should report duration for:
      | Phase                       | Time Metric                   |
      | Discovery & Backlog         | Detection to backlog created  |
      | Automated Resolution        | Auto-fix execution time       |
      | Interactive Resolution      | User decision time            |
      | Sync & Validation           | Final sync and validation     |
      | Total Recovery Time         | End to end duration           |
    And I should show time as human-readable (e.g., "5m 30s")

  @phase:3
  Scenario: Generate prevention recommendations
    Given the recovery is complete
    When I analyze patterns
    Then I should generate recommendations:
      | Pattern Found                | Recommendation                     |
      | Many stale journeys          | Run sync more frequently           |
      | Many orphaned scenarios      | Review PR process for scenarios    |
      | Frequent test failures       | Improve test isolation             |
      | Phase mismatches             | Document phase decisions better    |
      | Missing tests                | Enforce test creation in CI        |
    And I should prioritize by frequency

  @phase:3
  Scenario: Create report summary
    Given all data is compiled
    When I create the summary
    Then the report should include sections:
      | Section                   | Content                          |
      | Executive Summary         | High-level stats                 |
      | Issues Breakdown          | By type and severity             |
      | Resolution Details        | What was fixed and how           |
      | Time Analysis             | Phase durations                  |
      | Recommendations           | Prevention suggestions           |
      | Appendix                  | Full logs and checkpoints        |

  @phase:3
  Scenario: Archive backlog to recovery history
    Given the recovery backlog is complete
    When I archive it
    Then I should:
      | Step                                                  |
      | Create archive directory ".udd/recovery-history/"    |
      | Move backlog to "recovery-history/{session-id}.yml"  |
      | Include final status and timestamps                  |
      | Compress if older than 30 days                       |
    And I should maintain a catalog of archived recoveries

  @phase:3
  Scenario: Generate machine-readable report
    Given reports should be parseable
    When I generate machine output
    Then I should create JSON format:
      ```json
      {
        "session_id": "rec-2026-03-02-001",
        "summary": {
          "issues_found": 20,
          "issues_fixed": 18,
          "issues_skipped": 2
        },
        "phases": [
          {"name": "discovery", "duration_seconds": 30},
          {"name": "auto_fix", "duration_seconds": 120}
        ],
        "recommendations": [...]
      }
      ```
    And save to ".udd/recovery-reports/{session-id}.json"

  @phase:4
  Scenario: Generate human-readable report
    Given reports should be readable
    When I generate human output
    Then I should create Markdown format:
      | Section              | Format                    |
      | Title                | # Recovery Report         |
      | Stats                | Tables with counts        |
      | Timeline             | Bullet list with times    |
      | Recommendations      | Numbered list             |
    And save to ".udd/recovery-reports/{session-id}.md"

  @phase:4
  Scenario: Send notification on completion
    Given recovery is complete
    When I send notifications
    Then I should:
      | Channel           | Message Format               |
      | Console output    | Brief summary + next steps   |
      | Log file          | Full report details          |
      | Status file       | Exit code + summary JSON     |
    And notifications should respect quiet mode flag
