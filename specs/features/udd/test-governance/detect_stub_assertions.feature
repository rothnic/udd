Feature: Detect stub assertions in tests

# User Need:
#   Prevent developers from committing tautological or stub assertions
#   (for example `expect(true).toBe(true)`) that provide no verification value.
#
# Alternatives Considered:
#   - Lint rules only: fast but may be brittle for file-type variations
#   - Runtime test hooks: catches at test time but later in feedback loop
#   - Static scan during pre-commit/CI: preferred for early, deterministic feedback
#
# Success Criteria:
#   - Stub assertions are detected across common test file patterns
#   - Scanner flags files and provides precise locations and examples
#   - Enforcement is phase-aware (@phase tags) so future-phase stubs can be tolerated

  Background:
    Given a UDD project is initialized
    And test files exist in the repository

  @phase:3
  Scenario: Detect exact stub pattern expect(true).toBe(true) in unit test
    Given a file "tests/unit/sample.test.ts" contains the code:
      """
      test('noop', () => {
        expect(true).toBe(true);
      });
      """
    When I run "udd scan-tests --detect-stubs"
    Then the scan should report a stub assertion in "tests/unit/sample.test.ts"
    And the report should include the line containing "expect(true).toBe(true)"

  @phase:3
  Scenario: Detect expect(true).toBeTruthy() variation in spec file
    Given a file "tests/specs/example.spec.ts" contains the code:
      """
      it('always truthy', () => {
        expect(true).toBeTruthy();
      });
      """
    When I run "udd scan-tests --detect-stubs"
    Then the scan should report a stub assertion in "tests/specs/example.spec.ts"
    And the report should include the line containing "expect(true).toBeTruthy()"

  @phase:3
  Scenario: Detect tautological assertions with double negatives and negation helpers
    Given a file "tests/negation/neg.test.ts" contains the code:
      """
      test('negation noop', () => {
        expect(false).not.toBe(false);
        expect(!!true).toBe(true);
      });
      """
    When I run "udd scan-tests --detect-stubs"
    Then the scan should report stub assertions in "tests/negation/neg.test.ts"
    And the report should list both "expect(false).not.toBe(false)" and "expect(!!true).toBe(true)"

  @phase:3
  Scenario: Detect stubs in e2e test filename pattern .e2e.test.ts
    Given a file "tests/e2e/flow.e2e.test.ts" contains the code:
      """
      it('e2e noop', async () => {
        // this is a stub used by some teams during scaffolding
        expect(true).toBe(true);
      });
      """
    When I run "udd scan-tests --detect-stubs"
    Then the scan should report a stub assertion in "tests/e2e/flow.e2e.test.ts"
    And the file should be classified as an e2e test in the report

  @phase:3
  Scenario: Ignore legitimate assertions that are not tautological
    Given a file "tests/real/assertions.test.ts" contains the code:
      """
      test('real check', () => {
        const result = doWork();
        expect(result.success).toBe(true);
      });
      """
    When I run "udd scan-tests --detect-stubs"
    Then the scan should not report a stub assertion in "tests/real/assertions.test.ts"

  @phase:3
  Scenario: Detect common tautological helper patterns across file extensions
    Given a file "tests/mixed/sample.test.ts" contains the code:
      """
      describe('mixed', () => {
        it('tautologies', () => {
          expect(true).toBe(true);
          expect(Boolean(1)).toBeTruthy();
        });
      });
      """
    And a file "tests/mixed/sample.test.tsx" contains the code:
      """
      // jsx harness - still should be scanned
      test('jsx taut', () => expect(true).toBe(true));
      """
    When I run "udd scan-tests --detect-stubs"
    Then the scan should report stub assertions in both "tests/mixed/sample.test.ts" and "tests/mixed/sample.test.tsx"
