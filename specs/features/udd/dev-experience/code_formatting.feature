Feature: Dev-experience

# User Need: Developers need consistent code formatting across the
# repository so diffs are smaller, reviews focus on logic, and tooling
# behaves predictably.
#
# Alternatives Considered:
# - No enforced formatting: rejected due to noisy diffs and style
#   debates. Prefer automatic formatting via pre-commit hooks or CI.
# - Manual style guide without autoformatting: rejected because of
#   human error. Prefer autoformatters with editor integrations.
#
# Success Criteria:
# - Formatting tools can be run automatically (hooks/CI) to fix or
#   report style issues.
# - Tests assert that running the formatting command results in
#   consistent file layout and that tools exit with success when files
#   are formatted correctly.

  Scenario: Code Formatting
    Given I am in the right state
    When I do something
    Then something happens
