Feature: Bead Dependency Management
  As a developer
  I want beads to properly track dependencies
  So that work is executed in the correct order

  Background:
    Given the beads library is available
    And I understand the dependency model

  @phase:3
  Scenario: Test failures depend on scenario fixes
    Given a drift issue of type "test_failing" for scenario "auth/login"
    And a drift issue of type "scenario_orphan" for "auth/login.feature"
    When I create a bead graph from these issues
    Then the test_failing bead should depend on the scenario_orphan bead
    And the scenario_orphan bead should block the test_failing bead
    And the scenario_orphan bead status should be "ready"
    And the test_failing bead status should be "pending"

  @phase:3
  Scenario: Validation errors depend on manifest fixes
    Given a drift issue of type "manifest_corrupt"
    And a drift issue of type "validation_error" in specs/
    When I create a bead graph from these issues
    Then the validation_error bead should depend on the manifest_corrupt bead
    And the manifest_corrupt bead should have execution mode "exclusive"
    And no other beads should be ready until manifest is fixed

  @phase:3
  Scenario: Multiple independent beads can be ready
    Given drift issues:
      | type | file |
      | test_missing | tests/e2e/auth/login.e2e.test.ts |
      | test_missing | tests/e2e/auth/logout.e2e.test.ts |
      | test_missing | tests/e2e/auth/signup.e2e.test.ts |
    When I create a bead graph from these issues
    Then all 3 beads should have status "ready"
    And all 3 beads should have execution mode "parallel"
    And the graph should have 3 roots
    And the graph should have 3 leaves

  @phase:3
  Scenario: Completing a bead unblocks dependents
    Given a bead graph with dependencies:
      | bead | depends_on |
      | bead-B | bead-A |
      | bead-C | bead-A |
    And bead-A is completed
    When I check bead statuses
    Then bead-B should be "ready"
    And bead-C should be "ready"
    And bead-A should be "completed"

  @phase:3
  Scenario: Chained dependencies form critical path
    Given a bead graph with chain:
      | bead | depends_on |
      | bead-B | bead-A |
      | bead-C | bead-B |
      | bead-D | bead-C |
    When I calculate the critical path
    Then it should be [bead-A, bead-B, bead-C, bead-D]
    And only bead-A should be ready initially
    And the chain represents the longest dependency path

  @phase:3
  Scenario: Diamond dependency pattern
    Given a bead graph with diamond pattern:
      | bead | depends_on |
      | bead-B | bead-A |
      | bead-C | bead-A |
      | bead-D | bead-B,bead-C |
    When bead-A completes
    Then bead-B and bead-C should both become ready
    And bead-D should remain pending until both B and C complete
