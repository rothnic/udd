Feature: Test Governance Regression Detection

# User Need:
#   A stale reviewed test should be visible as regression risk and block strict
#   governance gates, even before impact-based test selection exists.
#
# Goal 017 will decide which tests are affected by changed files. This goal only
# proves that already-marked stale reviewed tests are acted on consistently.

  Background:
    Given a UDD project is initialized

  @phase:3
  Scenario: Block strict gates on stale reviewed proof without local cache input
    Given the project has stale reviewed proof and clean ignored local cache
    When I run "udd gate test-governance --strict --json"
    Then the strict gate fails because stale reviewed proof is blocking

