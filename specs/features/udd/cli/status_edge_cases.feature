Feature: udd status edge cases

  # These scenarios describe observable, deterministic CLI behavior when the
  # status command encounters uncommon repository states. Keep steps focused on
  # filesystem fixtures and printed output; avoid asserting on internal types.

  Scenario: No product directory present
    Given I am in a clean temporary directory without a "product" folder
    When I run "udd status"
    Then the command should exit with code 0
    And the output should contain "Project Status"
    And the output should contain "No journeys found" or "Project Status"

  Scenario: specs/.udd/manifest.yml missing while product/journeys exists
    Given I have a "product/journeys" directory with one valid journey file
    And there is no "specs/.udd/manifest.yml"
    When I run "udd status"
    Then the command should exit with code 0
    And the output should list the journey by name
    And the output should not crash or print a stack trace

  Scenario: Corrupted manifest YAML
    Given I have a "product/journeys" directory with one valid journey file
    And "specs/.udd/manifest.yml" exists but contains invalid YAML
    When I run "udd status"
    Then the command should exit with code 0
    And the output should warn about manifest parse issues or behave as if manifest is absent
    And the journey should still be listed in the output

  Scenario: Missing specs/features metadata file for a feature
    Given I have a feature directory under "specs/features" that does not contain "_feature.yml"
    When I run "udd status"
    Then the command should exit with code 0
    And the output should include the feature directory in Active Features only if metadata is present
    And the command should not crash

  Scenario: Unparseable journey file (invalid UTF-8 or binary noise)
    Given I have a "product/journeys" directory with one journey file containing binary or invalid text
    When I run "udd status"
    Then the command should exit with code 0
    And the output should warn about skipping the journey or treat it as unnamed
    And the command should not print a stack trace
