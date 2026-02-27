Feature: Agent Customization

# User Need: Users interacting with UDD via agents need guidance that
# explains the workflow and next steps so they aren't left unsure what
# to do after a command or when a check fails.
#
# Alternatives Considered:
# - No agent guidance (minimal agent): rejected because it increases
#   cognitive load for new users. Prefer lightweight, repo-based
#   guidance that can be updated without code changes.
# - Full interactive onboarding flows: rejected for now due to higher
#   maintenance; use static agent config files to provide clear hints.
#
# Success Criteria:
# - Agent configuration files include human-readable guidance such as
#   "The UDD Workflow" and explicit next-step hints.
# - Tests verify the presence of these strings to ensure discoverability
#   and that agents can present the information to users.

  Scenario: Guide User through UDD process
    Given I have an agent configuration file ".github/agents/udd.agent.md"
    When I read the agent configuration
    Then it should contain "The UDD Workflow"
    And it should contain "Guide the user to the next step"
