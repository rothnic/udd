@phase:3 @opencode @tools @issues
Feature: udd opencode issues - list blocking issues and problems

  # Package: OpenCode Agent Command
  # Command: `udd opencode issues`
  # Purpose: Provide a concise list of repository issues that block progress
  # and a machine-friendly JSON output for agents. Scenarios exercise both
  # human readable and JSON outputs, severity categorization, and common
  # issue classes (failing tests, missing tests, stub assertions, drift).

  Background:
    Given I am in the repository root
    And UDD is initialized

  @phase:3
  Scenario: Issues command lists all drift issues (human readable)
    Given the repository contains the following drift issues:
      | severity | type           | summary                                 |
      | critical | failing_test   | tests/e2e/authentication.e2e.test.ts    |
      | warning  | missing_scenario | specs/features/auth/login_basic.feature |
      | info     | documentation   | product/concept.md missing context      |
    When I run "udd opencode issues"
    Then the command should exit with code 0
    And the output should contain a section titled "Drift Issues"
    And the output should list each issue with its severity and summary
    And the output should contain "critical" and "tests/e2e/authentication.e2e.test.ts"

  @phase:3
  Scenario: Issues command categorizes by severity
    Given the repository has issues with mixed severities:
      | severity | count |
      | critical | 1     |
      | warning  | 2     |
      | info     | 3     |
    When I run "udd opencode issues"
    Then the output should include counts by severity
    And the output should contain "Critical issues: 1"
    And the output should contain "Warning issues: 2"
    And the output should contain "Info issues: 3"

  @phase:3
  Scenario: Issues command shows failing tests
    Given there is one failing test reported by the runner:
      | file                                           | reason               |
      | tests/e2e/payment.e2e.test.ts                  | assertion error      |
    When I run "udd opencode issues"
    Then the output should contain a subsection "Failing Tests"
    And the output should list "tests/e2e/payment.e2e.test.ts" with the reason "assertion error"

  @phase:3
  Scenario: Issues command shows missing test implementations
    Given the repository has scenarios without corresponding tests:
      | scenario_file                                 | expected_test_path                                |
      | specs/features/orders/checkout.feature        | tests/e2e/orders/checkout.e2e.test.ts             |
    When I run "udd opencode issues"
    Then the output should contain a subsection "Missing Tests"
    And the output should mention "specs/features/orders/checkout.feature"
    And the output should recommend creating "tests/e2e/orders/checkout.e2e.test.ts"

  @phase:3
  Scenario: Issues command shows stub assertions detected
    Given the test suite contains stub assertions in Phase 3 tests:
      | file                                        | stub_pattern                    |
      | tests/e2e/udd/test-governance.e2e.test.ts  | expect(true).toBe(true)         |
    When I run "udd opencode issues"
    Then the output should contain a subsection "Stub Assertions"
    And the output should list the file "tests/e2e/udd/test-governance.e2e.test.ts"
    And the output should explain why stub assertions are banned in Phase 3

  @phase:3
  Scenario: Issues command outputs structured JSON for agents
    Given the repository has multiple issues including a critical failing test:
      | severity | type         | file                                    |
      | critical | failing_test | tests/e2e/authentication.e2e.test.ts    |
    When I run "udd opencode issues --json"
    Then the command should exit with code 0
    And the output should be valid JSON
    And the JSON should contain an "issues" array
    And each issue object should include keys: "severity", "type", "summary", "file"
    And one of the issue objects should have "severity": "critical" and "file": "tests/e2e/authentication.e2e.test.ts"

  @phase:3
  Scenario: JSON output includes machine-friendly metadata for agents
    Given there is a missing manifest file issue:
      | type         | file                        | severity |
      | missing_file | specs/.udd/manifest.yml     | critical |
    When I run "udd opencode issues --json"
    Then the output should be valid JSON
    And the JSON "issues" array should include an object with:
      | field     | value                         |
      | type      | "missing_file"               |
      | file      | "specs/.udd/manifest.yml"    |
      | severity  | "critical"                  |
    And the JSON should include a top-level "generated_at" timestamp
