@phase:3
Feature: Apply Safe Recovery Repairs

# User Need:
#   A recovery user needs apply mode to write only reversible generated-state or
#   directory repairs in a controlled project.

  Scenario: Apply only safe reversible repairs in a temp project
    Given a temporary project with stale generated recovery state
    When I run "udd repair --apply --json"
    Then the apply repair report should write only safe actions
    And the apply repair report should write durable evidence
    And behavior scenario files should not be created

  Scenario: Apply missing expected directory repair
    Given a temporary project missing the expected journey directory
    When I run "udd repair --apply --json"
    Then the apply repair report should create the expected journey directory
    And the apply repair report should write durable evidence
    And behavior scenario files should not be created
