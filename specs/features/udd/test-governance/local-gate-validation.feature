Feature: Local Test Governance Gate

# User Need:
#   Developers and agents need a local way to find weak or stale tests before
#   enabling broader repository gates.
#
# Alternatives Considered:
#   - CI-first enforcement: too broad while the repo still has known baseline drift
#   - Metrics-only reporting: does not prevent stub tests from creating false confidence
#   - Pre-commit hooks in this slice: risks blocking unrelated local work too early
#
# Success Criteria:
#   - Test scanning identifies linked, unlinked, orphaned, and stubbed tests
#   - Test review records that affect gates stay in source-controlled evidence
#   - Ignored local cache state cannot change gate outcomes
#   - Gate checks are explicit and advisory unless strict mode is requested

  Background:
    Given a UDD project is initialized

  @phase:3
  Scenario: Scan tests for governance findings
    Given the project has linked, unlinked, orphaned, and stubbed tests
    When I run "udd test-scan --json"
    Then the scan reports linked, unlinked, orphaned, and stubbed counts
    And the linked test includes its feature path

  @phase:3
  Scenario: Resolve feature comment references with feature extension
    Given the project has a test linked by an "@feature" comment ending in ".feature" plus punctuation
    When I run "udd test-scan --json"
    Then the feature comment test is reported as linked

  @phase:3
  Scenario: Record a source-controlled test review
    Given the project has a meaningful linked test
    When I run "udd test review tests/auth/login.e2e.test.ts"
    Then the test review manifest records the test as clean
    And "udd test status --json" reports the review record

  @phase:3
  Scenario: Run an explicit local gate
    Given the project has dirty local review state
    When I run "udd gate test-governance"
    Then the gate reports findings without failing
    When I run "udd gate test-governance --strict"
    Then the strict gate fails with the dirty test listed

  @phase:3
  Scenario: Block strict gates on invalid source-controlled review state
    Given the project has an invalid source-controlled review manifest
    When I run "udd gate test-governance --strict"
    Then the strict gate fails with the review manifest issue listed

  @phase:3
  Scenario: Ignore invalid local review cache for gate decisions
    Given the project has an invalid ignored local review cache
    When I run "udd gate test-governance --strict"
    Then the strict gate does not fail because of local cache state
