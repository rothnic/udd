Feature: Test Governance Status

# User Need:
#   Maintainers need status and agent evidence to explain governance debt without
#   opening multiple raw manifests.

  Background:
    Given a UDD project is initialized

  @phase:3
  Scenario: Surface governance summary in project status and agent evidence
    Given the project has reviewed, stale, and missing governance proof
    When I run "udd status --json"
    Then status includes a test governance summary
    When I run "udd opencode evidence --json --goal goals/015-test-governance-upgrade.md"
    Then agent evidence includes the same test governance summary

