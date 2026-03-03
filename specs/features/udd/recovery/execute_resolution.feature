Feature: Execute resolution based on user decision

  As a developer or agent
  I want to apply the user's decision to resolve an issue
  So that the recovery process makes actual progress

  Background:
    Given a UDD project in recovery mode
    And an issue has been analyzed
    And the user has provided a decision

  @phase:3
  Scenario: Execute link to journey decision
    Given the user chose "link to journey"
    And they selected journey "user-authentication"
    When I execute the resolution
    Then I should:
      | Step                                         |
      | Open the scenario file                       |
      | Add or update the journey reference          |
      | Update scenario metadata                     |
      | Save the file                                |
      | Validate the link is correct                 |
    And I should log the specific journey chosen

  @phase:3
  Scenario: Execute delete scenario decision
    Given the user chose "delete scenario"
    And they confirmed the deletion
    When I execute the resolution
    Then I should:
      | Step                                      |
      | Move file to ".udd/deleted-scenarios/"    |
      | Update manifest to remove reference       |
      | Log deletion with timestamp               |
      | Archive any related test files            |
    And the deletion should be reversible within 30 days

  @phase:3
  Scenario: Execute mark as draft decision
    Given the user chose "mark as draft"
    When I execute the resolution
    Then I should:
      | Step                                         |
      | Add @draft tag to scenario                   |
      | Update status in manifest                    |
      | Add note explaining why it's draft           |
      | Set reminder for review in 7 days            |
    And the scenario should be excluded from strict validation

  @phase:3
  Scenario: Execute fix test decision
    Given the user chose "fix test"
    And they provided specific changes
    When I execute the resolution
    Then I should:
      | Step                                         |
      | Apply the suggested changes to test file     |
      | Run the test to verify it passes             |
      | Update test metadata                         |
      | Log the fix applied                          |
    And if the test still fails, notify user

  @phase:3
  Scenario: Execute skip for now decision
    Given the user chose "skip for now"
    When I execute the resolution
    Then I should:
      | Step                                         |
      | Update backlog status to "skipped"           |
      | Add skip reason to issue record              |
      | Set revisit reminder (default 3 days)        |
      | Continue to next issue                       |
    And skipped issues should be tracked separately

  @phase:3
  Scenario: Handle execution errors
    Given a resolution execution fails
    When the error occurs
    Then I should:
      | Action                                         |
      | Capture the error message and stack trace      |
      | Restore files to pre-execution state           |
      | Mark issue status as "failed"                  |
      | Log failure details                            |
      | Present error to user with options             |
    And offer options: retry, skip, or manual fix

  @phase:3
  Scenario: Create checkpoint for audit trail
    Given a resolution has been executed successfully
    When I create the checkpoint
    Then I should write to ".udd/checkpoints.yml":
      | Field           | Value                         |
      | checkpoint_id   | Unique identifier             |
      | issue_id        | Related issue                 |
      | decision        | What was decided              |
      | action_taken    | What was done                 |
      | files_modified  | List of changed files         |
      | timestamp       | ISO 8601 datetime             |
      | user            | Who made the decision         |
    And checkpoints should be append-only

  @phase:4
  Scenario: Support batch execution
    Given multiple similar issues have the same decision
    When the user approves batch execution
    Then I should apply the decision to all matching issues
    And I should create individual checkpoints for each
    And I should provide a summary of batch results
