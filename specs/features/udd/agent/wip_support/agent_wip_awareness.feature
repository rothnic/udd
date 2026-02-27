@phase:2
Feature: Agent Phase Awareness

# User Need: Agents that assist in project automation need to be aware of phase-tagged (deferred) work so they don't mistakenly prioritize or attempt to implement future-phase scenarios ahead of schedule.

# Alternatives Considered:
# - Agents always surface deferred work as tasks: leads to noise and wasted agent effort.
# - Store phase info only in external trackers: loses tight integration with UDD status commands.
# - Use hard-coded rules per-agent: reduces flexibility and maintainability.

# Success Criteria:
# - The agent correctly interprets @phase:N tags and treats N > current_phase as planned future work.
# - The agent avoids prompting or attempting to implement deferred scenarios in the current iteration.
# - Tests assert the agent's analysis output explicitly recognizes deferred items and their planned phase.

  Scenario: Agent understands deferred scenarios are intentionally deferred
    Given I have @phase:N tagged scenarios in my project where N > current_phase
    When the agent analyzes project status
    Then the agent should recognize deferred work as planned for future phases
    And the agent should not prompt to implement deferred scenarios immediately
