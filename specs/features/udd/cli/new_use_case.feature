Feature: Create a new use case

  Scenario: Create a new use case
    Given I am in the project root
    When I run "udd new use-case my_new_use_case"
    Then a file "specs/use-cases/my_new_use_case.yml" should exist
    And the file content should contain "id: my_new_use_case"
