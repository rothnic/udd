Feature: Linting Specs

# User Need: Developers and CI systems need a reliable lint step to
# validate the structure and minimal correctness of UDD spec files so
# that regressions or malformed specs are caught early.
#
# Alternatives Considered:
# - Only run lint in CI: rejected because fast local feedback is
#   valuable to developers. Prefer both local and CI linting.
# - Strict enforcement with non-zero exit for minor issues: rejected
#   because it may block iterative work. Keep lint meaningful and
#   fixable, with clear messages.
#
# Success Criteria:
# - `udd lint` exits with code 0 on a valid spec structure.
# - Output clearly states success (e.g. "All specs are valid") and
#   on failures provides file-level diagnostics suitable for CI parsing.

  Scenario: Linting a valid spec structure
    Given I have a valid UDD spec structure
    When I run "udd lint"
    Then the command should exit with code 0
    And the output should contain "All specs are valid"
