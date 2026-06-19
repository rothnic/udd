Feature: Release candidate verification

  Scenario: CI runs release-candidate gates
    Given the repository defines release-candidate CI
    When a maintainer reviews the workflow
    Then CI should run lint, full tests, strict governance, repair dry-run, and clean package install smoke
    And the workflow should preserve release evidence for review
