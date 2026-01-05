Feature: Validate Feature Completeness
  # User Need: Developers need feedback on whether their feature scenarios are complete
  # Who: Developers, Product Owners, Quality Engineers
  # Why: Ensure feature scenarios follow SysML-informed best practices and cover edge cases
  # 
  # Alternatives Considered:
  #   - Manual code review: Rejected (inconsistent, time-consuming, subjective)
  #   - Agent-only validation: Deferred (Phase 4, for more sophisticated analysis)
  #   - Linting only structure: Rejected (doesn't check completeness of scenarios)
  #   - Automated completeness scoring: CHOSEN (fast, consistent, actionable feedback)
  #
  # Success Criteria:
  #   - Command runs in < 5 seconds for typical project
  #   - Provides clear, actionable feedback
  #   - Scores features on 0-100% completeness scale
  #   - Identifies missing SysML context
  #   - Flags incomplete scenario coverage

  Scenario: Validate all feature files in project
    Given I have feature files in the specs directory
    When I run "udd validate"
    Then the command should succeed
    And the output should show completeness scores for each feature
    And the output should show an average completeness score

  Scenario: Validate specific feature file
    Given I have a feature file "docs/example-features/export_data.feature"
    When I run "udd validate -f docs/example-features/export_data.feature"
    Then the command should succeed
    And the output should show the completeness score for that feature

  Scenario: Validate reports missing SysML context
    Given I have a feature file without SysML comments
    When I run "udd validate -f specs/features/udd/cli/check_status.feature"
    Then the output should warn about missing user need context
    And the output should warn about missing alternatives analysis
    And the output should warn about missing success criteria

  Scenario: Validate scores complete features at 100%
    Given I have a complete feature file "docs/example-features/export_data.feature"
    When I run "udd validate -f docs/example-features/export_data.feature"
    Then the completeness score should be 100%
    And the output should show "Complete"
