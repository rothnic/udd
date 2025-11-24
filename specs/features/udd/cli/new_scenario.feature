Feature: Create a new scenario

  Scenario: Create a new scenario
    Given I have a feature "my_area/my_feature"
    When I run "udd new scenario my_area my_feature my_scenario"
    Then a file "specs/features/my_area/my_feature/my_scenario.feature" should exist
    And the file content should contain "Scenario: My scenario"
