Feature: Dev Experience

  Scenario: Sort Imports
    Given I have a file with unsorted imports
    When I run the repository formatter
    Then the imports should be sorted
