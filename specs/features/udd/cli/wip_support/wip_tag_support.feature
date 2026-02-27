Feature: Phase Tag Support

# User Need: Project maintainers need a way to mark scenarios as belonging to future phases so current-phase health reports stay focused on current priorities and do not penalize planned future work.

# Alternatives Considered:
# - Relying solely on tags or labels in external trackers: separates source of truth and complicates sync.
# - Using branch-based phase separation: heavyweight and disrupts developer workflow.
# - Manual filtering during status reporting: error-prone and requires discipline.

# Success Criteria:
# - Scenarios tagged with @phase:N where N > current_phase are clearly marked as deferred in status output.
# - Deferred scenarios are excluded from unsatisfied/failing counts in summary reports.
# - Feature details surface the deferred state so users can understand why items are not counted.

  Scenario: Scenarios tagged @phase:N are deferred when N > current_phase
    Given I have a scenario file with the @phase:2 tag
    And the project current_phase is 1
    When I run "udd status"
    Then the health summary should not count deferred scenarios as failures
    And the scenario should show status "deferred" in feature details
