@phase:2
Feature: Agent WIP Enforcement

# User Need: Agents participating in iterative development must avoid creating unreviewable large diffs; they need guidance to keep changesets small so reviewers can effectively review and merge work.

# Alternatives Considered:
# - Enforcing strict commit size at the VCS level: prevents work but is rigid and may block valid refactors.
# - Leaving it to human reviewers: inconsistent and scales poorly with many automated changes.
# - Auto-splitting commits automatically: complex and risky if semantic boundaries aren't preserved.

# Success Criteria:
# - The agent emits a clear warning when uncommitted/unstaged changes exceed the configured threshold during iteration.
# - The warning includes actionable advice (files to split, suggested commit boundaries) and is verifiable in tests.
# - The agent's behavior is configurable via the iterate prompt settings.

  Scenario: Warn On Large Changeset
    Given the iterate prompt defines WIP limits
    When the agent runs the iteration checklist
    Then the agent should warn if uncommitted changes exceed the threshold
    And the agent should encourage committing in logical chunks
