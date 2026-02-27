Feature: udd status edge cases

  # User Need:
  #   Developers and automation need `udd status` to report project health
  #   reliably even when repository metadata is missing, corrupt, or extreme
  #   (large numbers of journeys). The command must remain non-destructive,
  #   deterministic in its output, and surface actionable warnings.
  #
  # Alternatives Considered:
  #   - Fail fast with non-zero exit when any metadata is invalid (rejected):
  #     simpler implementation but hurts CI and automation that rely on status
  #     as a best-effort health check.
  #   - Silently ignore errors and proceed (rejected): hides problems from
  #     the developer and delays detection of corrupt or missing files.
  #   - Best-effort with warnings (adopted): list what can be parsed and
  #     warn about issues, keep exit code 0 where possible so status remains
  #     safe to run in automation.
  #
  # Success Criteria:
  #   - `udd status` exits 0 for non-fatal problems and prints clear warnings
  #     when manifest/journey files are missing or malformed.
  #   - The command never prints unhandled stack traces for repository errors.
  #   - Edge conditions (binary files, extremely large counts) are handled
  #     deterministically: either skipped with warnings or summarized.

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

  Scenario: Corrupted journey file with partial YAML structure
    Given I have a "product/journeys" directory with one journey file that contains partial YAML (truncated document with missing closing markers)
    When I run "udd status"
    Then the command should exit with code 0
    And the output should include a clear warning that the journey file could not be parsed
    And the output should suggest the filename and an actionable hint (e.g., "inspect file for YAML errors")
    And the command should not print a stack trace or internal error

  Scenario: Extremely large number of journeys (performance and summarization)
    Given I have a "product/journeys" directory containing 5000 valid journey files and one invalid journey file
    When I run "udd status"
    Then the command should exit with code 0 within a reasonable time
    And the output should summarize the total journeys (e.g., "5000 journeys, 1 problem")
    And the output should not attempt to render 5000 full entries verbatim (summary or paged view expected)
    And the output should surface the first 5 journeys and indicate how to view the rest (e.g., "use --limit or open product/journeys")
