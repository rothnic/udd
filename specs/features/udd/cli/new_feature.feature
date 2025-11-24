Feature: Create a new feature

  Scenario: Create a new feature
    Given I am in the project root
    When I run "udd new feature my_area my_feature"
    Then a directory "specs/features/my_area/my_feature" should exist
    And a file "specs/features/my_area/my_feature/_feature.yml" should exist
    And the file content should contain "id: my_area/my_feature"
