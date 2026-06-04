Feature: Test Governance Health Metrics

# User Need:
#   Test-governance owners need compact metrics for reviewed, stale, missing,
#   and CI-blocking proof states.

  Background:
    Given a UDD project is initialized

  @phase:3
  Scenario: Summarize governance adoption metrics
    Given the project has reviewed, stale, missing, and gate-blocking governance proof
    When I run "udd test-scan --json"
    Then the health metrics include reviewed, stale, missing, and gate-blocking counts

