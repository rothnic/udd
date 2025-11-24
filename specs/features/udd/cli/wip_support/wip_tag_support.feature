Feature: Phase Tag Support

  Scenario: Scenarios tagged @phase:N are deferred when N > current_phase
    Given I have a scenario file with the @phase:2 tag
    And the project current_phase is 1
    When I run "udd status"
    Then the health summary should not count deferred scenarios as failures
    And the scenario should show status "deferred" in feature details
