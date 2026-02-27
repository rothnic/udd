Feature: Dev-experience

# User Need: Developers need automated commit hooks to enforce project
# quality gates (linting, tests, format checks) so errors are caught
# before code reaches the shared repository and CI.
#
# Alternatives Considered:
# - Rely only on CI checks: rejected because it delays feedback and
#   increases CI cycles. Prefer local hooks to give fast developer
#   feedback.
# - Enforce hooks via team policy only: rejected as unreliable; prefer
#   automated enforcement with easy opt-out for experiments.
#
# Success Criteria:
# - Commit hooks are detectable and testable via the feature (given the
#   right state, running a commit triggers the checks).
# - Hooks provide clear failure messages and allow developers to fix
#   issues locally before pushing.

  Scenario: Commit Hooks
    Given I am in the right state
    When I do something
    Then something happens
