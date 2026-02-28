# Convert use-cases to journeys (first batch) (@Sisyphus-Junior subagent)

**ID**: ses_369d043e8ffeBgAMjNCAoN0Ep9
**Project ID**: ad761ea6174e58ed763fc75290c3f403ed51079d
**Created**: 2/25/2026, 1:03:56 PM
**Stats**: 6 files changed, +190 -0

---

## USER (1:03:56 PM)

# Journey: Agent Customization

**Actor**: Developer  
**Goal**: Customize the GitHub Copilot agent for UDD workflows

## Context

The Copilot agent needs context about UDD to assist effectively. This journey
ensures the agent has access to project status and can guide users.

## Steps

1. Developer opens Copilot chat
2. Agent has access to `udd status` output
3. Agent guides user through UDD process
4. User gets contextual assistance

## Success Criteria

- Agent has access to project status
- Agent can guide users through UDD workflow
- Assistance is contextual and helpful

## Scenarios

- `specs/features/udd/agent/status_prompt.feature` - Agent status access
- `specs/features/udd/agent/guide_user.feature` - Agent guides user

## Use Cases

- `specs/use-cases/agent_customization.yml` - Original use case (legacy)

<!-- EOF -->


# Journey: Capture Ideas

**Actor**: Developer  
**Goal**: Quickly capture feature ideas before they are forgotten

## Context

Developers often have ideas while coding but lose them because 
capturing is too high-friction. This journey makes it effortless.

## Steps

1. **Trigger**: Developer has idea while working
2. **Capture**: Developer runs `udd inbox add "idea description"`
3. **Confirmation**: CLI confirms idea captured with ID
4. **Return**: Developer returns to coding immediately

## Success Criteria

- Capture takes < 5 seconds
- No context switching required
- Idea is traceable later

## Scenarios

- `specs/features/udd/cli/inbox/add_item_via_cli.feature` - Basic capture

## Use Cases

- `specs/use-cases/capture_ideas.yml` - Original use case (legacy)


# Journey: Manage Work In Progress

**Actor**: Developer, Agent  
**Goal**: Avoid accumulating too many changes at once

## Context

Large changesets are harder to review and more likely to introduce bugs.
This journey helps keep changes small and focused.

## Steps

1. Developer makes changes to code
2. Agent monitors changeset size
3. When threshold exceeded, agent warns developer
4. Developer is encouraged to commit current work

## Success Criteria

- Agent warns when too many files are changed
- Developer receives encouragement for small commits
- Work-in-progress is visible and manageable

## Scenarios

- `specs/features/udd/agent/wip_enforcement/warn_on_large_changeset.feature` - Warning on large changes
- `specs/features/udd/agent/wip_enforcement/encourage_small_commits.feature` - Encourage small commits

## Use Cases

- `specs/use-cases/manage_wip.yml` - Original use case (legacy)


# Journey: Project Setup

**Actor**: Developer, Agent  
**Goal**: Initialize and configure the UDD project for development

## Context

Setting up a new UDD project should be simple and automated. This journey
covers installation and initial configuration.

## Steps

1. Developer runs `npm install` to install dependencies
2. Runs `npm link` to make CLI available globally
3. Verifies installation with `udd --help`
4. Project is ready for development

## Success Criteria

- Dependencies are installed correctly
- CLI tool is linked and available globally
- Setup can be completed by agent or developer

## Scenarios

- `specs/features/udd/cli/setup.feature` - Project setup

## Use Cases

- `specs/use-cases/project_setup.yml` - Original use case (legacy)

<!-- EOF -->


# Journey: Run Tests

**Actor**: Developer  
**Goal**: Execute tests and track implementation progress

## Context

Tests verify that the system works as specified. Running tests should be
easy and provide clear feedback on what's passing and failing.

## Steps

1. Developer implements a feature
2. Runs `npm test` to execute all tests
3. Views results to see pass/fail status
4. Checks `udd status` for project-wide progress

## Success Criteria

- Tests can be executed via CLI
- Project status is visible and up-to-date
- Failures are clearly reported with context

## Scenarios

- `specs/features/udd/cli/run_tests.feature` - Execute tests via CLI
- `specs/features/udd/cli/check_status.feature` - View project status

## Use Cases

- `specs/use-cases/run_tests.yml` - Original use case (legacy)

<!-- EOF -->


# Journey: Validate Specs

**Actor**: Developer, Agent  
**Goal**: Ensure specs follow the defined structure and schemas

## Context

Specs need to be valid to ensure traceability and proper test generation.
This journey provides validation tools.

## Steps

1. Developer writes or updates specs
2. Runs `udd lint` to validate structure
3. Gets feedback on any issues
4. Fixes issues until validation passes

## Success Criteria

- Valid specs pass linting without errors
- Invalid specs report clear, actionable errors
- Validation is fast (< 1 second)

## Scenarios

- `specs/features/udd/cli/lint_valid_specs.feature` - Valid specs pass
- `specs/features/udd/cli/lint_invalid_specs.feature` - Invalid specs report errors

## Use Cases

- `specs/use-cases/validate_specs.yml` - Original use case (legacy)


