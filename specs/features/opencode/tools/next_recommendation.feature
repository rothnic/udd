1: @phase:3
2: Feature: OpenCode "next" recommendation command
3: 
4: # User need:
5: #  Orchestrators and agent-runners need a concise recommendation for the
6: #  next work item that prioritizes current-phase work, respects blocking
7: #  dependencies, and returns both human-friendly text and structured JSON
8: #  so automated agents can act.
9: #
10: # Conventions: follow existing opencode/tool feature patterns (see
11: # specs/features/opencode/tools/udd_status_tool.feature) and include a
12: # Background that ensures the OpenCode SDK and udd CLI are available.
13: 
14:   Background:
15:     Given the OpenCode SDK is available
16:     And the udd CLI is installed

17:   Scenario: Recommend highest-priority incomplete journey
18:     Given a project with multiple journeys in the current phase
19:       | journey_slug        | priority | status      |
20:       | user-onboarding     | 1        | incomplete  |
21:       | import-data         | 2        | incomplete  |
22:       | export-data         | 3        | complete    |
23:     When the user runs `udd opencode next`
24:     Then the command should recommend the journey with highest priority
25:     And the human-readable output should include the journey slug "user-onboarding"
26:     And the JSON output should contain:
27:       | field       | example_value |
28:       | recommended | "user-onboarding" |
29:       | reason      | "highest priority incomplete journey in current phase" |

30:   Scenario: Consider phase priorities when recommending work
31:     Given a project with journeys across phases
32:       | journey_slug        | phase | priority | status     |
33:       | technical-debt      | 2     | 1        | incomplete |
34:       | feature-A           | 3     | 1        | incomplete |
35:     When the user runs `udd opencode next --phase-priority`
36:     Then the command should prefer items in the current phase over later phases
37:     And the recommendation should point to the journey in the current phase
38:     And the JSON output should include the scored priorities and chosen_phase

39:   Scenario: Identify blocking dependencies before recommending work
40:     Given a project with journeys and blocking dependencies
41:       | journey_slug        | status      | blocks |
42:       | api-schema          | complete    | feature-B |
43:       | feature-B           | incomplete  | feature-C |
44:       | feature-C           | incomplete  |          |
45:     When the user runs `udd opencode next`
46:     Then the command should identify that "feature-B" is blocked by "feature-C"
47:     And the recommendation should surface the blocking dependency and suggest unblocking steps
48:     And the JSON output should include a "blocking" array with objects:
49:       | field     | description |
50:       | slug      | journey slug blocking the recommended item |
51:       | blocked_by| slug that must be completed first |

52:   Scenario: Suggest a specific scenario to implement next
53:     Given a journey "user-onboarding" with multiple scenarios
54:       | scenario_file                         | implemented |
55:       | specs/features/auth/signup.feature    | false       |
56:       | specs/features/onboarding/first_item.feature | true |
57:     When the user runs `udd opencode next --suggest-scenario`
58:     Then the command should recommend implementing "specs/features/auth/signup.feature"
59:     And the human-readable output should include the filename and a one-line rationale
60:     And the JSON output should include a "suggested_files" list with paths and suggested_actions

61:   Scenario: Provide context for files to modify and tests to create
62:     Given the recommended scenario requires a new CLI flag and tests
63:       | file_path                             | change_needed                      |
64:       | packages/opencode/src/cli/commands/next.ts | add --json and --phase-priority options |
65:       | tests/e2e/opencode/next.e2e.test.ts   | add test for JSON output and priority logic |
66:     When the user runs `udd opencode next --context`
67:     Then the command should output a human plan that lists files to edit and tests to add
68:     And the JSON output should include a "edit_plan" array with entries containing:
69:       | field       | example_value |
70:       | path        | "packages/opencode/src/cli/commands/next.ts" |
71:       | action      | "add --json and --phase-priority options" |

72:   Scenario: Output structured JSON for agent consumption
73:     Given a repository with metadata for journeys, scenarios, and tests
74:     When the user runs `udd opencode next --json`
75:     Then the command should print a single JSON object to stdout with keys:
76:       | key               | type    |
77:       | recommended       | string  |
78:       | reason            | string  |
79:       | suggested_files   | array   |
80:       | blocking          | array   |
81:       | edit_plan         | array   |
82:     And the JSON should be parseable by agents (valid JSON) and include actionable fields

83:   @wip @phase:3
84:   Scenario: Combine human-readable recommendation with machine JSON in one output
85:     Given the user prefers both formats
86:     When the user runs `udd opencode next --json --verbose`
87:     Then the command should print a short human summary followed by a JSON payload
88:     And the human summary should start with "Recommended:" and reference the chosen journey slug
