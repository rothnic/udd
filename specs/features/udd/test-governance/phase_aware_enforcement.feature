Feature: Phase-aware enforcement of test quality rules

# Purpose:
#   Ensure that stub/tautological assertions are enforced for the current
#   development phase and any previous phases, while allowing future-phase
#   tests to contain stubs. This enables incremental adoption and deferral
#   of quality gates for planned work.

  Background:
    Given a UDD project is initialized
    And the project vision current_phase is 3

  @phase:3 @governance @test-quality
  Scenario: Fail when Phase 3 tests contain stub assertions (current phase)
    Given a file "tests/unit/phase3_stub.test.ts" contains the code:
      """
      test('noop phase3', () => {
        expect(true).toBe(true);
      });
      """
    When I run "udd doctor --check-stubs --strict"
    Then the doctor should fail with a message about stub assertions in "tests/unit/phase3_stub.test.ts"
    And the output should reference the current phase (3)

  @phase:3 @governance @test-quality
  Scenario: Fail when Phase 2 tests contain stub assertions (previous phase)
    Given a file "tests/legacy/phase2_stub.test.ts" contains the code:
      """
      it('legacy noop', () => {
        expect(true).toBeTruthy();
      });
      """
    And the file is tagged @phase:2 in its associated spec metadata
    When I run "udd doctor --check-stubs --strict"
    Then the doctor should fail and list "tests/legacy/phase2_stub.test.ts" as a violating file
    And the report should explain that Phase 2 is before the current phase (3)

  @phase:3 @governance @test-quality
  Scenario: Allow stubs in Phase 4+ tests (future phase)
    Given a file "tests/future/phase4_stub.test.ts" contains the code:
      """
      test('future noop', () => {
        expect(true).toBe(true);
      });
      """
    And the file is tagged @phase:4 in its associated spec metadata
    When I run "udd doctor --check-stubs --strict"
    Then the doctor should NOT fail because the file is in a future phase (4)
    And the report should mark the finding as "deferred: future phase"

  @phase:3 @governance @test-quality
  Scenario: Strict mode vs lenient mode (strict blocks, lenient reports only)
    Given a file "tests/mixed/lenient_case.test.ts" contains the code:
      """
      test('maybe stub', () => expect(true).toBe(true));
      """
    When I run "udd doctor --check-stubs --strict"
    Then the doctor should fail for "tests/mixed/lenient_case.test.ts"
    When I run "udd doctor --check-stubs --mode=lenient"
    Then the doctor should succeed but emit a warning listing "tests/mixed/lenient_case.test.ts"

  @phase:3 @governance @test-quality
  Scenario: Configurable strictness allows keeping stubs for selected directories
    Given a configuration file ".udd/config.yml" contains:
      """
      stub_enforcement:
        current_phase_only: true
        allow_list:
          - "tests/generated/**"
      """
    And a file "tests/generated/scaffold.test.ts" contains the code:
      """
      test('scaffold', () => { expect(true).toBe(true); });
      """
    When I run "udd doctor --check-stubs --strict"
    Then the doctor should NOT fail for "tests/generated/scaffold.test.ts"
    And the report should indicate the file matched allow_list and was exempted
