@phase:3
Feature: Refuse Behavior Spec Rewrites

# User Need:
#   A recovery user needs the tool to refuse guessing user-authored behavior
#   specs and leave those decisions as review work.

  Scenario: Refuse missing behavior scenario repair
    Given a temporary project whose manifest references a missing behavior scenario
    When I run "udd repair --dry-run --json"
    Then the repair report should refuse to create the behavior scenario
    And the refusal should include the missing scenario path and reason

