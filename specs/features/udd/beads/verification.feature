Feature: Bead Verification
  As a developer
  I want beads to have verification criteria
  So that I can confirm work is completed correctly

  Background:
    Given the beads library supports verification specs
    And I understand different verification types

  @phase:3
  Scenario: File exists verification
    Given a bead of type "plan_create_test"
    And the bead tracks file "tests/e2e/auth/login.e2e.test.ts"
    When I check the verification spec
    Then verification.type should be "file_exists"
    And verification.file should be "tests/e2e/auth/login.e2e.test.ts"
    When the file exists
    Then verification should pass
    When the file does not exist
    Then verification should fail

  @phase:3
  Scenario: Command exit code verification
    Given a bead of type "plan_sync_journey"
    When I check the verification spec
    Then verification.type should be "command_exit_code"
    And verification.command should be "udd"
    And verification.args should be ["sync", "--dry-run"]
    When the command exits with code 0
    Then verification should pass
    When the command exits with non-zero code
    Then verification should fail

  @phase:3
  Scenario: Test pass verification
    Given a bead of type "plan_fix_test"
    And the bead tracks file "tests/e2e/auth/login.e2e.test.ts"
    When I check the verification spec
    Then verification.type should be "test_pass"
    And verification.file should be "tests/e2e/auth/login.e2e.test.ts"
    When the test passes
    Then verification should pass
    When the test fails
    Then verification should fail

  @phase:3
  Scenario: Manual verification
    Given a bead of type "plan_user_decision"
    When I check the verification spec
    Then verification.type should be "manual"
    And verification.description should explain how to verify
    When a human confirms completion
    Then verification should pass

  @phase:3
  Scenario: Verification description is human-readable
    Given beads of various types:
      | bead_type | expected_description_pattern |
      | plan_create_test | file exists |
      | plan_sync_journey | sync.*dry-run |
      | plan_fix_test | test.*passes |
      | plan_user_decision | human confirms |
    When I check each verification description
    Then each description should match its expected pattern
    And each description should be understandable without code knowledge

  @phase:3
  Scenario: Verification with custom expected exit code
    Given a verification spec with:
      | field | value |
      | type | command_exit_code |
      | command | grep |
      | args | ["pattern", "file.txt"] |
      | expectedExitCode | 1 |
    When the command exits with code 1
    Then verification should pass
    When the command exits with code 0
    Then verification should fail

  @phase:3
  Scenario: Bead without verification cannot complete
    Given a bead with no verification spec
    When attempting to complete the bead
    Then it should fail with error "Verification required"

  @phase:3
  Scenario: Verification results are stored
    Given a completed bead
    When verification passes with output "Created 42 lines"
    Then bead.result.outputs should include the output
    And bead.result.success should be true
    And the timestamp should be recorded
