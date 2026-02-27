Feature: UDD Traceability Compliance
  # User Need: UDD must dogfood itself with full traceability
  # Who: Developers maintaining UDD
  # Why: Ensure UDD practices what it preaches
  #
  # Success Criteria:
  #   - All journeys link to at least one scenario
  #   - Average feature completeness >= 90%
  #   - udd validate --strict passes

  Scenario: All journeys have linked scenarios
    Given UDD has journeys defined in product/journeys/
    When I check the manifest at specs/.udd/manifest.yml
    Then every journey should have at least one scenario linked
    And no journey should have an empty scenarios array

  Scenario: Feature completeness meets threshold
    Given UDD has feature files in specs/features/udd/
    When I run "udd validate"
    Then the average completeness score should be at least 90%
    And no feature should score below 60%

  Scenario: Strict validation passes
    Given UDD has complete traceability
    When I run "udd validate --strict"
    Then the command should succeed
    And the output should show no validation errors
