Feature: Test Governance Scan

# User Need:
#   Test-governance owners need a stable inventory that distinguishes usable
#   proof from weak, unlinked, or missing proof before enabling stricter gates.
#
# Alternatives Considered:
#   - Only reporting Vitest pass/fail: misses tests that are not tied to user
#     behavior
#   - Treating every missing review as blocking: too strict for first adoption
#   - Reading ignored local cache: creates non-reviewable gate outcomes
#   - Treating every implementation unit test as user proof: rejected because
#     strict governance is about scenario-backed proof, not internal regression
#     coverage

  Background:
    Given a UDD project is initialized

  @phase:3
  Scenario: Report stable test proof states with source references
    Given the project has linked, unlinked, orphaned, stubbed, reviewed, stale, missing, implementation-only, and manual integration proof candidates
    When I run "udd test-scan --json"
    Then the scan summary reports every governance proof state
    And each test entry includes source references and a proof state
    And the scan includes actionable findings with source references
    And implementation-only and manual integration tests do not create proof blockers
