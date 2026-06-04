@phase:3
Feature: Plan Recovery Repairs

# User Need:
#   A recovery user needs a ranked dry-run plan that predicts safe writes and
#   separates generated-state fixes from manual behavior decisions.

  Scenario: Produce ranked dry-run repair evidence
    Given a temporary project with partial initialization and unsafe behavior drift
    When I run "udd repair --dry-run --json"
    Then the dry-run repair report should propose safe ranked actions
    And the dry-run repair report should refuse unsafe behavior rewrites
    And the dry-run evidence should not be written

