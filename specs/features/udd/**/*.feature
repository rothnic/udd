Feature: Ensure UDD Traceability Compliance

  Scenario: Add missing SysML context to scenarios
    Given I am a User
    When I add missing sysml context to scenarios
    Then the action is completed successfully
