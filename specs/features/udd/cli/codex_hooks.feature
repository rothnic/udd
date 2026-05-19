Feature: UDD CLI

  Scenario: Install Codex hooks into an external project
    Given I am in a project without Codex hooks
    When I run "udd hooks install-codex"
    Then ".codex/hooks.json" should include the UDD Codex hook
    And ".codex/hooks/pre-task.sh" should run UDD status checks

  Scenario: Initialize a project with Codex hooks
    Given I am in an empty project
    When I run "udd init --yes --codex-hooks"
    Then the UDD product structure should be created
    And ".codex/hooks.json" should include the UDD Codex hook
