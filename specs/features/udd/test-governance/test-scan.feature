Feature: Scan for Tests

# User Need:
#   Developers need to discover and catalog existing test files
#   in the project to establish baselines, identify orphaned tests,
#   and ensure all tests are properly linked to features.
#
# Alternatives Considered:
#   - Manual inventory: time-consuming and quickly outdated
#   - Convention-based discovery: implicit and error-prone
#   - IDE file search: misses metadata and context
#
# Success Criteria:
#   - Scan discovers all test files automatically
#   - Test files are categorized by type and status
#   - Orphaned tests are identified
#   - Missing feature links are flagged

  Background:
    Given a UDD project is initialized
    And test files exist in various directories

  @phase:1
  Scenario: Scan discovers all test files
    Given test files exist in "tests/" and subdirectories
    When I run "udd scan-tests"
    Then all test files should be discovered
    And the count should be displayed
    And the list should include file paths

  @phase:1
  Scenario: Scan categorizes tests by type
    Given tests exist of types unit, integration, and e2e
    When I run "udd scan-tests"
    Then tests should be grouped by type
    And counts per type should be shown
    And uncategorized tests should be flagged

  @phase:1
  Scenario: Scan identifies test-feature linkages
    Given some tests have @feature declarations
    And some tests do not
    When I run "udd scan-tests"
    Then linked tests should be shown with their feature
    And unlinked tests should be listed separately
    And the linkage coverage percentage should be calculated

  @phase:1
  Scenario: Scan detects orphaned tests
    Given a test links to "features/deleted.feature"
    When I run "udd scan-tests"
    Then the orphaned test should be identified
    And the broken link should be displayed
    And remediation suggestions should be provided

  @phase:1
  Scenario: Scan shows test metadata
    Given tests exist with various attributes
    When I run "udd scan-tests --verbose"
    Then for each test, file size should be shown
    And last modified date should be shown
    And feature linkage should be shown

  @phase:1
  Scenario: Scan exports discovery results
    When I run "udd scan-tests --export tests.json"
    Then results should be saved to "tests.json"
    And the format should be JSON
    And it should include all discovered test metadata

  @phase:1
  Scenario: Scan specific directory only
    Given tests exist in "tests/unit/" and "tests/e2e/"
    When I run "udd scan-tests tests/unit/"
    Then only tests in "tests/unit/" should be discovered
    And other directories should be excluded

  @phase:1
  Scenario: Scan detects duplicate test names
    Given two test files have the same describe/it names
    When I run "udd scan-tests"
    Then potential duplicates should be flagged
    And the conflicting names should be listed
    And locations should be provided for disambiguation

  @phase:1
  Scenario: Scan integrates with status
    When I run "udd status --with-tests"
    Then the status should include scan summary
    And test counts should be part of the overview
    And issues found during scan should be highlighted
