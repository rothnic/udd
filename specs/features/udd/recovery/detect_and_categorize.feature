Feature: Detect and categorize drift issues for recovery

  As a developer or agent
  I want to detect and categorize all drift issues
  So that I can create a prioritized recovery backlog

  Background:
    Given a UDD project with drift detected
    And the project has journeys, scenarios, and tests

  @phase:3
  Scenario: Run comprehensive drift detection
    When I run "udd doctor --json"
    Then the command should output structured JSON
    And the output should contain a list of issues
    And each issue should have:
      | Field          | Type    |
      | id             | string  |
      | severity       | string  |
      | type           | string  |
      | file           | string  |
      | message        | string  |
      | autoFixable    | boolean |
      | requiresUserInput | boolean |
    And issues should be categorized by severity:
      | Severity | Description                                    |
      | critical | Blocks sync, broken references                |
      | warning  | Should fix, stale scenarios, missing tests    |
      | info     | Nice to have, low coverage, documentation gaps|

  @phase:3
  Scenario: Categorize issues by severity
    Given drift detection has found multiple issues
    When I analyze the issues
    Then critical issues should include:
      | Type               | Example                                    |
      | journey_stale      | Journey modified since last sync          |
      | scenario_orphan    | Scenario has no journey link              |
      | test_failing       | Test is failing                           |
      | validation_error   | Validation error in use case              |
    And warning issues should include:
      | Type               | Example                                    |
      | test_missing       | Test stub missing for scenario            |
      | journey_stale      | Journey not synced for over 7 days        |
    And info issues should include:
      | Type               | Example                                    |
      | low_coverage       | Journey has low scenario coverage         |

  @phase:3
  Scenario: Count issues by severity
    Given drift detection has completed
    When I check the summary
    Then I should see counts for:
      | Severity | Count |
      | critical | 3     |
      | warning  | 15    |
      | info     | 2     |
    And the total issue count should be 20

  @phase:3
  Scenario: Identify auto-fixable issues
    Given drift detection has found issues
    When I filter for auto-fixable issues
    Then I should see issues marked with "autoFixable: true"
    And these should include:
      | Issue Type      | Why Auto-Fixable                          |
      | test_missing    | Can generate test stub                    |
      | journey_stale   | Can mark for sync (with verification)     |
      | manifest_corrupt| Can regenerate minimal manifest           |
    And the count should be displayed for planning

  @phase:3
  Scenario: Identify issues requiring user input
    Given drift detection has found issues
    When I filter for issues requiring user input
    Then I should see issues marked with "requiresUserInput: true"
    And these should include:
      | Issue Type        | Why User Input Required                    |
      | scenario_orphan   | Must decide: delete, link, or draft       |
      | test_failing      | Must decide: fix, skip, or mark pending   |
      | validation_error  | Must decide: edit file or skip            |
    And these should be flagged for interactive resolution

  @phase:4
  Scenario: Export detection results for backlog creation
    Given drift detection has completed
    When I run "udd doctor --json --output=drift-report.json"
    Then a JSON file should be created
    And it should contain the full issue list
    And it should include metadata:
      | Field        | Value                           |
      | timestamp    | ISO 8601 datetime               |
      | projectPath  | Absolute path to project        |
      | uddVersion   | Version of UDD CLI              |
    And this file should be usable for backlog generation
