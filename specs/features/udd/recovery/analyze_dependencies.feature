Feature: Analyze issue dependencies for recovery

  As a developer or agent
  I want to determine which issues block others
  So that I can identify safe parallel work streams and plan the recovery sequence

  Background:
    Given a UDD project with drift detected
    And the drift detection has produced a list of issues

  @phase:3
  Scenario: Build dependency graph from issues
    When I analyze the relationships between issues
    Then I should identify dependencies such as:
      | Dependent Issue    | Depends On         | Reason                          |
      | test_failing       | scenario_orphan    | Test needs valid scenario       |
      | link_orphans       | create_scenarios   | Need targets to link to         |
      | sync_all           | link_orphans       | Need valid links first          |
      | validate_phase     | fix_scenario       | Validation needs correct phase  |
    And each issue should have a "dependencies" field
    And the dependency graph should be acyclic

  @phase:3
  Scenario: Identify safe parallel work streams
    Given a dependency graph has been built
    When I analyze the graph for parallel safety
    Then I should identify parallel-safe tasks:
      | Task Type              | Why Safe                              |
      | create_missing_tests   | No dependencies between test files    |
      | create_missing_scenarios| Independent of other new scenarios   |
      | update_manifest        | Self-contained operation              |
      | fix_stale_timestamps   | Different files, no conflicts         |
    And each parallel-safe task should have "parallel_safe: true"

  @phase:3
  Scenario: Identify issues requiring user input
    Given issues have been categorized
    When I flag issues needing user decisions
    Then I should mark these as "requires_user_input: true":
      | Issue Type         | Decision Required                         |
      | scenario_orphan    | Delete, link, or mark as draft?          |
      | test_failing       | Fix, skip, or mark pending?              |
      | validation_error   | Edit file or skip validation?            |
      | phase_mismatch     | Implement now or defer to future phase?  |
    And these should be flagged for interactive resolution

  @phase:3
  Scenario: Detect circular dependencies
    Given issues with potential circular references
    When I analyze for cycles
    Then I should detect any circular dependencies
    And I should report the cycle:
      | Cycle Path                                          |
      | scenario_A → test_A → scenario_B → test_B → scenario_A |
    And I should break the cycle by selecting the weakest link
    And I should flag the break point for user review

  @phase:3
  Scenario: Calculate critical path
    Given a dependency graph with parallel streams
    When I calculate the critical path
    Then I should identify the longest dependency chain
    And I should estimate recovery time:
      | Path Component        | Estimated Time |
      | Auto-fixes (parallel) | 2 minutes      |
      | Critical issue 1      | 5 minutes      |
      | Critical issue 2      | 10 minutes     |
      | Sync all              | 3 minutes      |
    And I should report total estimated recovery time

  @phase:3
  Scenario: Group issues by domain for parallel processing
    Given issues span multiple domains
    When I group by domain
    Then I should create domain-specific work streams:
      | Domain     | Issues | Parallel Safe |
      | auth       | 3      | yes           |
      | api        | 5      | yes           |
      | ui         | 2      | yes           |
      | cross-cut  | 4      | no            |
    And cross-domain issues should be processed serially

  @phase:4
  Scenario: Export dependency graph for visualization
    Given the dependency analysis is complete
    When I export the graph
    Then I should generate a DOT format file
    And I should include node metadata:
      | Field        | Description                    |
      | id           | Issue identifier               |
      | type         | Issue type                     |
      | severity     | critical/warning/info          |
      | auto_fixable | Whether it can be auto-fixed   |
    And the file should be usable with graphviz tools
