Feature: Status Command Integration

# User Need:
#   The status command needs to integrate test governance information
#   so developers can see a complete picture of project health including
#   test status, dirty markers, and review states in one view.
#
# Alternatives Considered:
#   - Separate commands for each concern: harder to get overview
#   - Web dashboard: adds infrastructure overhead
#   - IDE integration: inconsistent across editors
#
# Success Criteria:
#   - Status shows test governance metrics
#   - Dirty tests are highlighted
#   - Review status is visible
#   - Filter options focus on specific concerns

  Background:
    Given a UDD project is initialized
    And feature files exist with linked tests

  @phase:3
  Scenario: Status shows test governance overview
    Given the project has features with various test states
    When I run "udd status"
    Then the output should include a "Test Governance" section
    And it should show counts of clean, dirty, and pending tests
    And it should show test coverage percentage

  @phase:3
  Scenario: Status highlights dirty tests prominently
    Given some tests are marked dirty
    When I run "udd status"
    Then dirty tests should be listed in a dedicated section
    And they should be visually highlighted (e.g., with color or markers)
    And the section should appear early in the output

  @phase:3
  Scenario: Status shows review queue
    Given some tests are awaiting review
    When I run "udd status"
    Then the output should include a "Review Queue" section
    And it should show tests needing review
    And it should indicate how long each has been waiting

  @phase:3
  Scenario: Status filters to governance issues only
    When I run "udd status --governance"
    Then the output should focus on governance concerns
    And it should show dirty tests, pending reviews, and coverage gaps
    And other status information should be minimized

  @phase:3
  Scenario: Status shows test coverage metrics
    Given features exist with varying test coverage
    When I run "udd status"
    Then the output should show coverage percentage per feature
    And it should show overall project coverage
    And features below threshold should be flagged

  @phase:3
  Scenario: Status shows stale features
    Given some features have not been tested recently
    When I run "udd status --include-stale"
    Then features with old test runs should be listed
    And the time since last test run should be shown
    And a recommendation to re-run tests should appear

  @phase:3
  Scenario: Status integrates with health score
    Given the project calculates an overall health score
    When I run "udd status"
    Then the health score should factor in test governance
    And dirty tests should reduce the score
    And missing coverage should reduce the score

  @phase:3
  Scenario: Status provides actionable next steps
    Given there are governance issues in the project
    When I run "udd status"
    Then the output should suggest specific actions
    And commands to fix issues should be shown
    And priority order should be indicated
