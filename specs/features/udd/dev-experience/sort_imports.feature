Feature: Dev Experience

  Scenario: Sort Imports
    Given I have a file with unsorted imports
    When I run "npm run check:fix"
    Then the imports should be sorted

