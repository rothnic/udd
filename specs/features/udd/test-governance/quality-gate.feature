Feature: Test Governance Quality Gate

# User Need:
#   Teams adopting governance need advisory gate output first, then strict mode
#   for CI once blocking findings are configured and understood.

  Background:
    Given a UDD project is initialized

  @phase:3
  Scenario: Non-strict and strict gates report the same findings with different exit behavior
    Given the project has strict-mode governance findings
    When I run "udd gate test-governance --json"
    Then the gate reports findings without failing
    When I run "udd gate test-governance --strict --json"
    Then the strict gate fails with the same blocking findings

  @phase:3
  Scenario: Pass strict gate with reviewed linked non-stub proof
    Given the project has reviewed linked non-stub proof
    When I run "udd gate test-governance --strict --json"
    Then the strict gate passes with no blocking findings
