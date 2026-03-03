Feature: Bead Execution
  As a developer
  I want to execute beads in the correct order respecting dependencies
  So that work is completed efficiently and correctly

  Background:
    Given a bead graph exists with multiple beads
    And I can query for ready beads

  @phase:3
  Scenario: Query ready beads
    Given a bead graph with beads in various states:
      | bead | status | dependencies |
      | bead-A | completed | [] |
      | bead-B | in_progress | [] |
      | bead-C | ready | [bead-A] |
      | bead-D | pending | [bead-A,bead-B] |
      | bead-E | blocked | [bead-D] |
    When I query for ready beads
    Then I should get [bead-C]
    And bead-D should not be ready (still waiting on bead-B)
    And bead-E should not be ready (blocked)

  @phase:3
  Scenario: Start working on a bead
    Given bead-A is in status "ready"
    When I start bead-A with assigned worker "agent-1"
    Then bead-A status should be "in_progress"
    And bead-A metadata.assignedTo should be "agent-1"
    And bead-A metadata.started should be set
    And bead-A metadata.attempts should be 1

  @phase:3
  Scenario: Complete a bead successfully
    Given bead-A is in status "in_progress"
    When I complete bead-A with result:
      | field | value |
      | success | true |
      | message | Test file created successfully |
    Then bead-A status should be "completed"
    And bead-A metadata.completed should be set
    And bead-A result.success should be true
    And dependent beads should be checked for readiness

  @phase:3
  Scenario: Fail a bead
    Given bead-A is in status "in_progress"
    When I fail bead-A with error "File write permission denied"
    Then bead-A status should be "failed"
    And bead-A error.message should be "File write permission denied"
    And bead-A error.at should be set

  @phase:3
  Scenario: Retry a failed bead
    Given bead-A failed with 1 attempt
    When I start bead-A again
    Then bead-A status should be "in_progress"
    And bead-A metadata.attempts should be 2

  @phase:3
  Scenario: Parallel bead execution
    Given 5 beads all with status "ready" and executionMode "parallel"
    When workers request beads to work on
    Then all 5 beads can be assigned to different workers simultaneously
    And each bead status should be "in_progress"

  @phase:3
  Scenario: Serial bead execution respects ordering
    Given beads with executionMode "serial":
      | bead | status |
      | bead-A | in_progress |
      | bead-B | ready |
      | bead-C | ready |
    When a worker requests a bead
    Then only bead-A should be assigned (it's already in progress)
    And bead-B and bead-C should wait

  @phase:3
  Scenario: Exclusive bead blocks all others
    Given bead-A with executionMode "exclusive" is in_progress
    And beads bead-B and bead-C are ready
    When checking what can execute
    Then only bead-A should be executable
    And bead-B and bead-C should be blocked until bead-A completes
