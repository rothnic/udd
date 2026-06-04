@phase:3
Feature: Diagnose Project Health

# User Need:
#   Developers and agents need a fast, read-only command that explains whether
#   a UDD project is initialized, partially initialized, or drifting before they
#   choose remediation work.
#
# Alternatives Considered:
#   - Keep diagnostics inside "udd status --doctor": rejected because agents need
#     a first-class JSON contract that is separate from the broad status report.
#   - Salvage full recovery orchestration: rejected for this slice because
#     automated fixes and backlogs are broader than issue #52's diagnostic proof.
#   - Add "udd doctor" plus "udd health-check": accepted because doctor can list
#     actionable issues while health-check can provide a compact pass/fail gate.
#
# Success Criteria:
#   - Doctor JSON includes a status, issue summary, and issue list.
#   - Health-check JSON reports a healthy boolean and the same issue summary.
#   - Generated local metadata absence is advisory when source-controlled specs
#     are otherwise valid.
#   - Status JSON exposes health classification so agents can distinguish
#     blocking debt from advisory discovery drift.
#   - Real initialized temp projects produce structured diagnostics.
#   - Partially initialized and drifted temp projects report actionable issues.
#   - Error handling covers partial initialization without crashing.
#   - Edge cases include stale journey manifests and missing linked scenarios.

  Scenario: Report real initialized project diagnostics
    Given a temporary project initialized with "udd init --yes"
    When I run "udd doctor --json"
    Then the JSON report should identify the project as "healthy"
    And the report should include a "missing_scenario" issue
    And the "missing_scenario" issue should be advisory

  Scenario: Report generated manifest absence as advisory
    Given a temporary project with valid source-controlled specs but no generated manifest
    When I run "udd doctor --json"
    Then the JSON report should identify the project as "healthy"
    And the report should include a "manifest_missing" issue
    And the "manifest_missing" issue should be advisory

  Scenario: Expose health classification in status JSON
    Given a temporary project with valid source-controlled specs but no generated manifest
    When I run "udd status --json"
    Then the status JSON health summary should have zero critical issues
    And the status JSON should identify advisory discovery issues

  Scenario: Keep legacy status doctor aligned with advisory health
    Given a temporary project with valid source-controlled specs but no generated manifest
    When I run "udd status --doctor"
    Then the status doctor output should identify the project as healthy
    And the status doctor command should not fail

  Scenario: Report partial initialization diagnostics
    Given a temporary project with "specs/.udd" but no "product" directory
    When I run "udd health-check --json"
    Then the JSON health report should be unhealthy
    And the report should include a "product_missing" issue

  Scenario: Report drifted journey diagnostics
    Given a temporary project with a stale journey manifest entry
    When I run "udd doctor --json"
    Then the JSON report should identify the project as "healthy"
    And the report should include a "journey_stale" issue
    And the "journey_stale" issue should be advisory

  Scenario: Report deleted files still referenced by the manifest
    Given a temporary project with manifest entries for deleted journey and scenario files
    When I run "udd health-check --json"
    Then the JSON health report should be unhealthy
    And the report should include "missing_journey" and "missing_scenario" issues

  Scenario: Report malformed manifest diagnostics
    Given a temporary project with manifest scenarios stored as a list
    When I run "udd doctor --json"
    Then the JSON report should identify the project as "drift-detected"
    And the report should include a "manifest_invalid" issue

  Scenario: Report null journey manifest entries without crashing
    Given a temporary project with a null journey manifest entry
    When I run "udd health-check --json"
    Then the JSON health report should be unhealthy
    And the report should include a "missing_journey" issue

  Scenario: Ignore punctuation after unquoted journey scenario paths
    Given a temporary project with an unquoted journey scenario path followed by punctuation
    When I run "udd doctor --json"
    Then the JSON report should identify the project as "healthy"
    And the report should not include a "missing_scenario" issue
