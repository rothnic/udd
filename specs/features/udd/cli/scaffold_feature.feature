Feature: Scaffold Feature from Template

  Scenario: Create new feature from SysML template
    Given I am in a UDD project
    When I run "udd new feature test_domain sample_feature"
    Then the command should exit with code 0
    And a feature file should be created at "specs/features/test_domain/sample_feature/sample_feature.feature"
    And the feature file should contain "Feature: Sample Feature"
    And the feature file should be valid Gherkin
