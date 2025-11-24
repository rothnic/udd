Feature: Deferred Status Display

  Scenario: Status command shows deferred items separately
    Given I have outcomes with @phase:N scenarios where N > current_phase
    When I run "udd status"
    Then deferred outcomes should show with a blue diamond icon
    And deferred outcomes should not be counted in unsatisfied totals
