Feature: Run Tests

# User Need: Developers need an integrated test runner that provides
# readable, human-friendly output (features and scenarios) so they can
# quickly understand test coverage and failures during development.
#
# Alternatives Considered:
# - Silent machine-readable output only: rejected because humans need
#   readable feedback during development. Keep both readable and
#   machine-parsable outputs when requested.
# - Delegate entirely to external test runners: rejected to keep the
#   UX consistent and provide UDD-specific hooks and formatting.
#
# Success Criteria:
# - `udd test` exits with code 0 on success and prints feature/scene
#   headers that make results easy to scan.
# - Output includes recognizable markers like "Feature:" and
#   "Scenario:" and supports CI-friendly modes if needed.

  Scenario: Run tests with visual feedback
    Given I have a valid UDD spec structure
    When I run "udd test"
    Then the command should exit with code 0
    And the output should contain "Feature:"
    And the output should contain "Scenario:"
