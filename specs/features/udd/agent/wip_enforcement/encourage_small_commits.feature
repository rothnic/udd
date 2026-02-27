Feature: Agent WIP Enforcement

# User Need: Automated agents must produce commits that are easy to review and trace; developers need commit history that communicates intent through small, focused commits with meaningful prefixes.

# Alternatives Considered:
# - Letting agents create single large commits: simpler but harms code review and bisectability.
# - Human-only commits after agent changes: adds friction and doubles work.
# - Strict template-enforced commit messages: ensures consistency but can be onerous for agents to generate.

# Success Criteria:
# - Agents produce multiple small commits for logically separate changes during iteration in tests.
# - Commit messages use meaningful prefixes (e.g., feat:, fix:, chore:) as configured.
# - The behavior is configurable via iterate prompt and covered by tests that inspect commit history.

  Scenario: Encourage Small Commits
    Given the iterate prompt defines commit guidelines
    When the agent makes changes
    Then the agent should commit in small logical chunks
    And the agent should use meaningful commit prefixes
