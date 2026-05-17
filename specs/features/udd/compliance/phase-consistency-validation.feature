@phase:3
Feature: Phase Consistency Validation

# User Need:
#   Teams need to detect when executable specs (@phase tags) drift from the
#   roadmap current phase or from the stable project vision that should found
#   new backlog. Without validation, teams may work on future-phase features,
#   miss that current-phase work is incomplete, or create backlog that no longer
#   serves the project purpose.
#
# Alternatives Considered:
#   - Manual review in sprint planning: Rejected because it's error-prone and
#     doesn't catch drift between planning sessions.
#   - CI gate that blocks @phase > current_phase: Rejected because it would
#     prevent drafting future scenarios. Prefer warnings, not hard blocks.
#   - Automated validation with suggestions: Accepted because it catches drift
#     without blocking legitimate forward-planning work.
#
# Success Criteria:
#   - Validation detects feature files with @phase tags that don't match the roadmap
#   - Roadmap and backlog decisions can be traced back to specs/VISION.md goals
#   - Reports clearly indicate which features are ahead of current phase
#   - Suggests which features should move to current phase based on journey links
#   - Validates phase numbering is sequential (no gaps like 1, 2, 4)
#   - Integrates with `udd validate --strict` for CI enforcement

  As a team lead managing a UDD project
  I want automated detection of phase tag drift
  So that specs stay aligned with the roadmap and team focus

  Background:
    Given a UDD project with specs/VISION.md defining stable project goals
    And specs/roadmap.yml defining phases
    And feature files with @phase:N tags
    And the manifest at specs/.udd/manifest.yml

  @phase:3
  Scenario: Detect features tagged for future phases
    Given specs/roadmap.yml specifies current phase 3
    And there are feature files with @phase:4 tags
    When I run phase consistency validation
    Then it should report features that exceed current phase
    And indicate they belong to "Agent Intelligence" phase
    And suggest reviewing for premature implementation

  @phase:3
  Scenario: Warn when roadmap and specs are misaligned
    Given specs/roadmap.yml specifies current phase 3
    And the active phase name is "Agent Integration"
    When I scan all feature files
    Then features with @phase:4 should trigger a warning
    And the warning should explain: "Phase 4 work detected but current phase is 3"
    And it should suggest moving them to @phase:3 if they are in-progress

  @phase:3
  Scenario: Suggest features for current phase based on journey links
    Given journeys in product/journeys/ link to specific features
    And the current phase is 3
    When a journey links to a feature tagged @phase:4
    Then validation should suggest: "Consider moving to @phase:3 - linked by active journey"
    And list the linking journey names

  @phase:3
  Scenario: Validate phase numbering is sequential
    Given phases defined in specs/roadmap.yml: 1, 2, 3, 4, 5
    When I check all feature files
    Then there should be no gaps in phase numbering
    And no feature should have @phase:0 or negative phase
    And missing intermediate phases should be flagged

  @phase:3
  Scenario: Allow future-phase tags for planning purposes
    Given a feature is tagged @phase:4
    And it has no implementation or test files
    When validation runs
    Then it should warn but not fail
    And note: "Future-phase planning allowed, monitor for scope creep"

  @phase:3
  Scenario: Block phase regression in strict mode
    Given specs/roadmap.yml specifies current phase 3
    And a feature is tagged @phase:2 (completed phase)
    When I run "udd validate --strict"
    Then it should report an error
    And explain: "Features cannot be added to completed phases"
    And suggest moving to current phase or removing tag
