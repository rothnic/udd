@phase:3
Feature: OpenCode "next" recommendation command

# User need:
#  Orchestrators and agent-runners need a concise recommendation for the
#  next work item that prioritizes current-phase work, respects blocking
#  dependencies, and returns both human-friendly text and structured JSON
#  so automated agents can act.
#
# Conventions: follow existing opencode/tool feature patterns (see
# specs/features/opencode/tools/udd_status_tool.feature) and include a
# Background that ensures the OpenCode SDK and udd CLI are available.

  Background:
    Given the OpenCode SDK is available
    And the udd CLI is installed

  Scenario: Recommend highest-priority incomplete journey
    Given a project with multiple journeys in the current phase
      | journey_slug        | priority | status      |
      | user-onboarding     | 1        | incomplete  |
      | import-data         | 2        | incomplete  |
      | export-data         | 3        | complete    |
    When the user runs `udd opencode next`
    Then the command should recommend the journey with highest priority
    And the human-readable output should include the journey slug "user-onboarding"
    And the JSON output should contain:
      | field       | example_value |
      | recommended | "user-onboarding" |
      | reason      | "highest priority incomplete journey in current phase" |

  Scenario: Consider phase priorities when recommending work
    Given a project with journeys across phases
      | journey_slug        | phase | priority | status     |
      | technical-debt      | 2     | 1        | incomplete |
      | feature-A           | 3     | 1        | incomplete |
    When the user runs `udd opencode next --phase-priority`
    Then the command should prefer items in the current phase over later phases
    And the recommendation should point to the journey in the current phase
    And the JSON output should include the scored priorities and chosen_phase

  Scenario: Identify blocking dependencies before recommending work
    Given a project with journeys and blocking dependencies
      | journey_slug        | status      | blocks |
      | api-schema          | complete    | feature-B |
      | feature-B           | incomplete  | feature-C |
      | feature-C           | incomplete  |          |
    When the user runs `udd opencode next`
    Then the command should identify that "feature-B" is blocked by "feature-C"
    And the recommendation should surface the blocking dependency and suggest unblocking steps
    And the JSON output should include a "blocking" array with objects:
      | field     | description |
      | slug      | journey slug blocking the recommended item |
      | blocked_by| slug that must be completed first |

  Scenario: Suggest a specific scenario to implement next
    Given a journey "user-onboarding" with multiple scenarios
      | scenario_file                         | implemented |
      | specs/features/auth/signup.feature    | false       |
      | specs/features/onboarding/first_item.feature | true |
    When the user runs `udd opencode next --suggest-scenario`
    Then the command should recommend implementing "specs/features/auth/signup.feature"
    And the human-readable output should include the filename and a one-line rationale
    And the JSON output should include a "suggested_files" list with paths and suggested_actions

  Scenario: Provide context for files to modify and tests to create
    Given the recommended scenario requires a new CLI flag and tests
      | file_path                             | change_needed                      |
      | packages/opencode/src/cli/commands/next.ts | add --json and --phase-priority options |
      | tests/e2e/opencode/next.e2e.test.ts   | add test for JSON output and priority logic |
    When the user runs `udd opencode next --context`
    Then the command should output a human plan that lists files to edit and tests to add
    And the JSON output should include a "edit_plan" array with entries containing:
      | field       | example_value |
      | path        | "packages/opencode/src/cli/commands/next.ts" |
      | action      | "add --json and --phase-priority options" |

  Scenario: Output structured JSON for agent consumption
    Given a repository with metadata for journeys, scenarios, and tests
    When the user runs `udd opencode next --json`
    Then the command should print a single JSON object to stdout with keys:
      | key               | type    |
      | recommended       | string  |
      | reason            | string  |
      | suggested_files   | array   |
      | blocking          | array   |
      | edit_plan         | array   |
    And the JSON should be parseable by agents (valid JSON) and include actionable fields

  @wip @phase:3
  Scenario: Combine human-readable recommendation with machine JSON in one output
    Given the user prefers both formats
    When the user runs `udd opencode next --json --verbose`
    Then the command should print a short human summary followed by a JSON payload
    And the human summary should start with "Recommended:" and reference the chosen journey slug
