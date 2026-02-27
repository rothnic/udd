Feature: Deferred Status Display

# User Need: Users running `udd status` need a clear, visual distinction for deferred outcomes so they can quickly understand current obligations versus planned future work.

# Alternatives Considered:
# - Text-only lists with prefix markers: less discoverable at a glance.
# - Hiding deferred outcomes entirely from status: leads to confusion and loss of traceability.
# - Exporting separate reports per phase: useful for planning but cumbersome for quick checks.

# Success Criteria:
# - Deferred outcomes display a distinct blue diamond icon in the status output.
# - Deferred outcomes are excluded from unsatisfied/failed counts in summaries.
# - Users can still drill into deferred outcomes to see details and planned phase.

  Scenario: Status command shows deferred items separately
    Given I have outcomes with @phase:N scenarios where N > current_phase
    When I run "udd status"
    Then deferred outcomes should show with a blue diamond icon
    And deferred outcomes should not be counted in unsatisfied totals
