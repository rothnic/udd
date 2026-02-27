Feature: Inbox

# User Need: Developers and contributors need a fast, low-friction way to capture ideas or tasks from the command line so work-in-progress and fleeting thoughts aren't lost while coding.

# Alternatives Considered:
# - Web or GUI inbox: provides richer discovery and metadata but adds context switching and requires a running frontend.
# - API-based ingestion: good for integrations and automation but heavier to set up for quick, ad-hoc notes.
# - Editor/plugin commands: convenient inside editors but not universally available across environments.

# Success Criteria:
# - Items added with `udd inbox add` appear in the inbox immediately and are queryable via UDD commands.
# - Provided descriptions are stored and surfaced in detail views and tests verify the values.
# - The CLI command returns success (exit code 0) on creation and provides a clear error for invalid input.

  Scenario: Add item via CLI
    Given I have an empty inbox
    When I run "udd inbox add 'My new idea' --description 'Some details'"
    Then the inbox should contain "My new idea"
    And the item should have description "Some details"
