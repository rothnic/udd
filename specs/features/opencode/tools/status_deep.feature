Feature: udd opencode status (deep)

  # Package: OpenCode Agent Command
  # Command: `udd opencode status`
  # Purpose: Provide a deep, agent-friendly project status tailored for OpenCode
  # agents and automation. This command emits both human-friendly summaries and
  # structured JSON suitable for programmatic consumption by agents.
  #
  # Conventions / Notes:
  #  - Follow existing CLI feature patterns in specs/features/udd/cli/
  #  - Scenarios tagged with @phase:3 (production-ready agent tooling)
  #  - Include both human-readable and JSON-output scenarios

  Background:
    Given I am in the repository root
    And UDD is initialized

  @phase:3 @opencode @status
  Scenario: Status command shows overall project health overview (human readable)
    Given a codebase with multiple journeys, scenarios, and tests
    When I run "udd opencode status"
    Then the command should exit with code 0
    And the output should contain "OpenCode Agent Status"
    And the output should contain a high-level health summary such as "Healthy" or "Issues detected"
    And the output should contain a summary section named "Project Health Overview"
    And the output should contain lines like "Journeys: 12, Scenarios: 34, Tests: 78"

  @phase:3 @opencode @status
  Scenario: Status command lists all journeys and their completion status
    Given product/journeys contains the following journeys:
      | name                 | status     |
      | onboarding           | complete   |
      | export_data          | in_progress|
      | billing_migration    | missing    |
    When I run "udd opencode status"
    Then the command should exit with code 0
    And the output should include a section "Journeys" with each journey and its status
    And the output should contain "onboarding — complete"
    And the output should contain "export_data — in_progress"
    And the output should contain "billing_migration — missing"

  @phase:3 @opencode @status
  Scenario: Status command shows current phase from specs/VISION.md
    Given specs/VISION.md declares the current phase as "Phase 3 - Comprehensive"
    When I run "udd opencode status"
    Then the command should exit with code 0
    And the output should contain "Current Phase: Phase 3 - Comprehensive"

  @phase:3 @opencode @status
  Scenario: Status command identifies blocking issues
    Given there are two blocking issues in the repository:
      | type       | summary                               |
      | test_fail  | tests/e2e/authentication.e2e.test.ts  |
      | missing    | product/journeys/billing_migration.md |
    When I run "udd opencode status"
    Then the command should exit with code 0
    And the output should contain a section "Blocking Issues"
    And the output should list each blocking issue with type and summary
    And the output should contain "tests/e2e/authentication.e2e.test.ts" and "product/journeys/billing_migration.md"

  @phase:3 @opencode @status
  Scenario: Status command shows test coverage metrics
    Given the test runner reports coverage metrics: statements: 87%, branches: 72%, functions: 90%, lines: 86%
    When I run "udd opencode status"
    Then the command should exit with code 0
    And the output should contain a section "Test Coverage"
    And the output should contain "Statements: 87%" and "Branches: 72%" and "Lines: 86%"

  @phase:3 @opencode @status
  Scenario: Status command outputs structured JSON for agents when --json is passed
    Given the repository has journeys, scenarios, and tests
    When I run "udd opencode status --json"
    Then the command should exit with code 0
    And the output should be valid JSON
    And the JSON should include keys: "project", "phase", "journeys", "issues", "coverage"
    And the JSON "phase" value should equal the current phase from specs/VISION.md
    And the JSON "journeys" should be an array of objects with "name" and "status"

  @phase:3 @opencode @status
  Scenario: JSON output includes machine-friendly issue objects with severity and file
    Given there is one blocking issue: missing manifest file
    When I run "udd opencode status --json"
    Then the command should exit with code 0
    And the output should be valid JSON
    And the JSON "issues" array should contain an object:
      | field    | value                          |
      | severity | "blocking"                    |
      | type     | "missing_file"                |
      | file     | "specs/.udd/manifest.yml"     |
