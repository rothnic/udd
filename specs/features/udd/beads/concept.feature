Feature: Beads Concept and Domain Model
  As a developer
  I want to understand the beads concept
  So that I can use beads to model work with dependencies

  Background:
    Given the UDD project is initialized
    And the beads library is available at "src/lib/beads.ts"

  @phase:3
  Scenario: Bead represents a unit of work
    Given a drift issue exists with:
      | field | value |
      | type | test_missing |
      | file | tests/e2e/auth/login.e2e.test.ts |
      | severity | warning |
    When I convert the issue to a bead
    Then the bead should have:
      | field | value |
      | type | plan_create_test |
      | name | test_missing: login.e2e.test.ts |
      | executionMode | parallel |
      | canAutoExecute | true |
    And the bead should track the file "tests/e2e/auth/login.e2e.test.ts"

  @phase:3
  Scenario: Bead has verification criteria
    Given a bead of type "plan_create_test"
    When I check the verification specification
    Then the verification type should be "file_exists"
    And the verification file should match the bead's file
    And the verification should have a human-readable description

  @phase:3
  Scenario: Bead has lifecycle status
    Given a newly created bead
    Then the status should be "pending"
    When all dependencies are satisfied
    Then the status should change to "ready"
    When work starts
    Then the status should change to "in_progress"
    When work completes successfully
    Then the status should change to "completed"

  @phase:3
  Scenario: Bead execution modes
    Given beads with different execution modes:
      | bead_type | execution_mode |
      | plan_create_test | parallel |
      | plan_sync_journey | serial |
      | plan_fix_manifest | exclusive |
    Then each bead should have the correct execution mode
    And "parallel" beads can run concurrently
    And "serial" beads must run sequentially
    And "exclusive" beads block all other beads
