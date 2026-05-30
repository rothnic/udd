@phase:3
Feature: Phase Consistency Validation

# User Need:
#   Roadmap owners need a deterministic way to inspect current phase state and
#   detect when executable feature tags drift ahead of the active phase.
#
# Alternatives Considered:
#   - Store current phase in specs/VISION.md: rejected because VISION is stable
#     product intent and should not carry mutable planning state.
#   - Fail on all future @phase tags: rejected because future-phase planning is
#     useful when it stays visible and out of implementation scope.
#   - Read specs/roadmap.yml and report drift: accepted because roadmap is the
#     mutable planning source and warnings preserve planning flexibility.
#
# Success Criteria:
#   - The CLI reports the current roadmap phase by number and name.
#   - The CLI can update specs/roadmap.yml current_phase by phase number.
#   - Phase validation reports future-phase feature tags as warnings.
#   - Invalid or undefined phase tags are errors in strict checks.

  Scenario: Show current roadmap phase
    Given a UDD project with specs/roadmap.yml defining phases
    When I run "udd phase current"
    Then the output should show "Phase 3: Agent Integration"

  Scenario: Set current roadmap phase
    Given a UDD project with specs/roadmap.yml defining phases
    When I run "udd phase set 4"
    Then specs/roadmap.yml should set current_phase to "agent-intelligence"
    And "udd phase current" should show "Phase 4: Agent Intelligence"

  Scenario: Warn on future phase feature tags
    Given specs/roadmap.yml specifies current phase 3
    And a feature file is tagged @phase:4
    When I run "udd phase check"
    Then the output should warn "Phase 4 work detected but current phase is 3"
    And the command should exit successfully

  Scenario: Fail strict checks for invalid phase tags
    Given specs/roadmap.yml defines phases 1 through 4
    And a feature file is tagged @phase:0
    When I run "udd phase check --strict"
    Then the command should fail
    And the output should explain "Feature phase tags must be positive integers"
