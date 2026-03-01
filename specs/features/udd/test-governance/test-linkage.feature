Feature: Test-Feature Linkage

# User Need:
#   Developers need to know which test file corresponds to which feature file
#   so they can quickly navigate between specs and implementations,
#   understand coverage gaps, and maintain traceability.
#
# Alternatives Considered:
#   - Manual documentation: quickly becomes stale and unreliable
#   - Directory structure conventions: implicit and error-prone
#   - External tracking tools: adds overhead and separates from code
#
# Success Criteria:
#   - Every feature file has one or more linked test files
#   - Tests declare which feature they validate
#   - Status commands show linkage coverage
#   - Missing or broken links are flagged as warnings

  Background:
    Given a UDD project is initialized
    And the project has feature files in "specs/features/"
    And the project has test files in "tests/"

  @phase:3
  Scenario: Test file declares linkage to feature file
    Given a feature file exists at "specs/features/auth/login.feature"
    When I create a test file at "tests/auth/login.e2e.test.ts"
    And the test file contains "@feature('auth/login.feature')"
    Then the linkage should be valid
    And "udd status" should show the test as linked

  @phase:3
  Scenario: Feature file with no linked tests is flagged
    Given a feature file exists at "specs/features/payment/checkout.feature"
    And no test file links to "payment/checkout.feature"
    When I run "udd status"
    Then the output should flag "payment/checkout.feature" as having no tests
    And the feature should appear in the "untested" section

  @phase:3
  Scenario: Multiple tests can link to one feature
    Given a feature file exists at "specs/features/user/profile.feature"
    When I create test file "tests/user/profile-unit.test.ts" linking to "user/profile.feature"
    And I create test file "tests/user/profile-e2e.test.ts" linking to "user/profile.feature"
    Then both linkages should be valid
    And "udd status" should show 2 tests for "user/profile.feature"

  @phase:3
  @error
  Scenario: Test linking to non-existent feature file
    Given I create a test file at "tests/auth/invalid.test.ts"
    And the test file contains "@feature('auth/nonexistent.feature')"
    When I run "udd status"
    Then the output should warn about broken link to "auth/nonexistent.feature"
    And the test should appear in the "orphan tests" section

  @phase:3
  Scenario: Renaming feature file updates linkage
    Given a feature file exists at "specs/features/old-name.feature"
    And a test file links to "old-name.feature"
    When I rename the feature file to "specs/features/new-name.feature"
    And I run "udd sync"
    Then the linkage should be updated to "new-name.feature"
    And the test file declaration should reference the new path
