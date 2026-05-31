@phase:3
Feature: OpenCode issue list

  As an OpenCode agent checking a UDD repository
  I want diagnostic issues in a stable JSON shape
  So that I can report blockers and warnings consistently

  Scenario: Issues command returns shared diagnostic issues
    When the OpenCode adapter requests issues as JSON
    Then the payload includes status, summary counts, and issue records
    And each issue record includes a recommendation
