Feature: Check Project Status

  # User Need:
  #   Developers and maintainers need a quick, reliable way to inspect
  #   the mapping between product journeys, generated scenarios, and
  #   test coverage so they can track progress and detect gaps early.
  #
  # Alternatives Considered:
  #   - Build a web dashboard to show status (higher UX cost, slower iteration)
  #   - Rely on CI reports alone (delays feedback, harder to explore details)
  #   - Emit machine-readable artifacts only (harder for humans to inspect)
  #
  # Success Criteria:
  #   - `udd status` returns a human-friendly summary of journeys → scenarios → tests
  #   - Clear, actionable messages for uninitialized, empty, or stale states
  #   - Validation tooling rates this feature file with >= 90% completeness

  Scenario: Check status of a project
    Given I have a valid UDD spec structure
    When I run "udd status"
    Then the command should exit with code 0
    And the output should contain "Project Status"

  @error
  Scenario: Status check fails when UDD is not initialized
    Given I am in a repository without UDD initialized
    When I run "udd status"
    Then the command should exit with code 1
    And the output should contain "UDD is not initialized" or "run 'udd init'"

  Scenario: Status with no journeys defined (empty project)
    Given UDD is initialized
    And there are no journey files in "product/journeys/"
    When I run "udd status"
    Then the command should exit with code 0
    And the output should contain "No journeys defined" or "0 journeys"

  Scenario: Status with stale/outdated manifest warns the user
    Given UDD is initialized
    And the .udd/manifest.yml is older than one or more journey files
    When I run "udd status"
    Then the command should exit with code 0
    And the output should contain "manifest is stale" or "run 'udd sync' to update"
