Feature: Create a new requirement

  Scenario: Create a new requirement
    Given I am in the project root
    When I run "udd new requirement my_requirement"
    Then a file "specs/requirements/my_requirement.yml" should exist
    And the file content should contain "key: my_requirement"
