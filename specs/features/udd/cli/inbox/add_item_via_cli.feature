Feature: Inbox

  Scenario: Add item via CLI
    Given I have an empty inbox
    When I run "udd inbox add 'My new idea' --description 'Some details'"
    Then the inbox should contain "My new idea"
    And the item should have description "Some details"
