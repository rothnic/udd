Feature: Sync after recovery completion

  As a developer or agent
  I want to run sync for all modified journeys after recovery
  So that all artifacts are regenerated and consistent

  Background:
    Given a UDD project recovery is nearly complete
    And issues have been resolved

  @phase:3
  Scenario: Identify modified journeys
    Given recovery has modified files
    When I check what changed
    Then I should identify affected journeys:
      | Change Type              | Affected Journeys              |
      | Scenario linked          | Journey that now has scenario  |
      | Scenario deleted         | Journey that lost scenario     |
      | Test created             | Journey with new test          |
      | Phase updated            | Journey with phase changes     |
    And I should create a list of journeys needing sync

  @phase:3
  Scenario: Run sync for modified journeys
    Given modified journeys have been identified
    When I execute "udd sync"
    Then it should process each affected journey:
      | Step                                          |
      | Parse journey file                            |
      | Regenerate scenario stubs                     |
      | Update manifest entries                       |
      | Create or update test files                   |
    And it should complete without errors

  @phase:3
  Scenario: Handle new drift introduced during recovery
    Given sync has completed
    When I check for new drift
    Then I should run "udd doctor"
    And if new issues are found:
      | New Issue Type     | Action                                    |
      | Minor inconsistency| Auto-fix if safe                          |
      | Validation error   | Flag for user review                      |
      | Reference broken   | Critical - stop and alert user            |
    And new critical issues should pause recovery

  @phase:3
  Scenario: Update timestamps after sync
    Given sync has succeeded
    When I update metadata
    Then I should refresh sync timestamps:
      | Field                    | Action                        |
      | journey.last_synced      | Set to current time           |
      | manifest.updated_at      | Set to current time           |
      | recovery.sync_completed  | Set to current time           |
    And all timestamps should use ISO 8601 format

  @phase:3
  Scenario: Verify scenarios match journeys after sync
    Given sync has regenerated artifacts
    When I verify consistency
    Then I should check:
      | Verification              | Expected Result                  |
      | Scenario count matches    | Journey steps = scenarios        |
      | Test files exist          | One test per scenario            |
      | No orphaned scenarios     | All scenarios linked             |
      | Manifest is valid         | Passes schema validation         |
    And any mismatches should be reported

  @phase:3
  Scenario: Handle sync failures
    Given sync encounters an error
    When the failure occurs
    Then I should:
      | Action                                         |
      | Capture the error details                      |
      | Identify which journey failed                  |
      | Attempt to rollback changes                    |
      | Report failure to user                         |
      | Offer: retry, skip journey, or manual fix      |
    And partial sync results should be discarded

  @phase:4
  Scenario: Batch sync optimization
    Given many journeys were modified
    When I run sync
    Then I should process in dependency order
    And I should parallelize where safe
    And I should show progress: "Syncing journey X of Y"
