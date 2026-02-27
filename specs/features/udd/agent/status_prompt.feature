Feature: Agent Customization

# User Need: Repository maintainers and integrators need configurable
# agent prompts (like status prompts) so the automation and agents can
# present consistent, project-specific commands and messaging.
#
# Alternatives Considered:
# - Hard-coded prompts in agent code: rejected because it prevents
#   per-repo customization and requires code changes for wording.
# - Full UI-based prompt editor: rejected as high friction; prefer
#   simple markdown prompt files in the repo.
#
# Success Criteria:
# - Prompt files live under .github/prompts/ and contain expected
#   command tokens (e.g. "udd status").
# - Agents read prompts successfully and tests assert presence of key
#   strings to ensure prompts are discoverable and parseable.

  Scenario: Status Prompt
    Given I have a prompt file ".github/prompts/status.prompt.md"
    When I read the prompt file
    Then it should contain "udd status"
    And it should contain "command"
