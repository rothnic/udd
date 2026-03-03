Feature: Present user decisions interactively during recovery

  As an agent orchestrating recovery
  I want to use the question tool to present decisions to the user
  So that ambiguous issues can be resolved with user guidance

  Background:
    Given the recovery backlog has issues requiring user input
    And the agent is in interactive recovery mode
    And the question tool is available

  @phase:3
  Scenario: Present options for orphaned scenario
    Given there is a "scenario_orphan" issue
    And the scenario is "specs/auth/oauth.feature"
    When the agent reaches this issue in the backlog
    Then it should present a question with:
      | Field       | Value                                                |
      | header      | "Recovery Decision Required"                         |
      | question    | "Scenario 'specs/auth/oauth.feature' has no journey link. What should we do?" |
      | options     | 4 choices (see below)                                |
    And the options should be:
      | Label           | Description                                           |
      | Link to journey | "Select which journey this scenario belongs to"       |
      | Delete scenario | "Remove this orphaned scenario (irreversible)"        |
      | Mark as draft   | "Keep but mark as work-in-progress"                   |
      | Skip for now    | "Leave unresolved and continue with other issues"     |
    And there should be a default option: "Skip for now"

  @phase:3
  Scenario: Handle user selects "Link to journey"
    Given the user selected "Link to journey" for an orphan
    When the agent processes this decision
    Then it should:
      1. Query available journeys: `udd journeys list`
      2. Present second question:
         ```
         header: "Select Journey"
         question: "Which journey should 'oauth.feature' be linked to?"
         options: [
           {label: "User Authentication", description: "Authentication and login flows"},
           {label: "API Integration", description: "Third-party API connections"},
           {label: "Create new journey", description: "Create a new journey for this scenario"}
         ]
         ```
      3. Update the selected journey file to include the scenario
      4. Create checkpoint with decision details
      5. Mark issue as "completed" in backlog

  @phase:3
  Scenario: Handle user selects "Delete scenario"
    Given the user selected "Delete scenario" for an orphan
    When the agent processes this decision
    Then it should:
      1. Confirm with user:
         ```
         header: "Confirm Deletion"
         question: "Delete 'specs/auth/oauth.feature'? This cannot be undone."
         options: [
           {label: "Yes, delete it", description: "Permanently remove the scenario file"},
           {label: "No, keep it", description: "Cancel deletion and return to options"}
         ]
         ```
      2. If confirmed, move file to `.udd/attic/scenarios/oauth.feature.bak`
      3. Update manifest to remove scenario reference
      4. Create checkpoint with deletion record
      5. Mark issue as "completed" in backlog

  @phase:3
  Scenario: Handle user selects "Skip for now"
    Given the user selected "Skip for now" for an issue
    When the agent processes this decision
    Then it should:
      1. Update backlog entry:
         ```yaml
         - id: "crit-001"
           type: "scenario_orphan"
           status: "skipped"
           skipped_at: "2026-03-02T17:30:00Z"
           reason: "user_deferred"
         ```
      2. Continue to next issue
      3. Report at end: "1 issue skipped (can be addressed later)"

  @phase:3
  Scenario: Present options for failing test
    Given there is a "test_failing" issue
    And the test is "tests/e2e/auth/login.e2e.test.ts"
    When the agent reaches this issue
    Then it should present:
      ```
      header: "Failing Test Recovery"
      question: "Test 'tests/e2e/auth/login.e2e.test.ts' is failing. How should we proceed?"
      context: "Error: Expected 200 but got 401\nLine 45: await expect(response.status).toBe(200)"
      options: [
        {label: "Fix the test", description: "Open test file for editing"},
        {label: "Mark as pending", description: "Add .todo() to skip temporarily"},
        {label: "Mark as known issue", description: "Link to existing bug report"},
        {label: "Skip for now", description: "Address later"}
      ]
      ```

  @phase:3
  Scenario: Present options for validation error
    Given there is a "validation_error" issue
    And the error is in "specs/use-cases/authentication.yml"
    When the agent reaches this issue
    Then it should present:
      ```
      header: "Validation Error"
      question: "Use case validation failed. How do you want to handle this?"
      context: "Error: Missing required field 'actor' at line 12"
      options: [
        {label: "Edit the file", description: "Open specs/use-cases/authentication.yml"},
        {label: "Show me the error details", description: "Display full validation report"},
        {label: "Skip for now", description: "Address later"}
      ]
      ```

  @phase:3
  Scenario: Context-aware questions with file previews
    Given the user is making a decision about a file
    When presenting the question
    Then it should include helpful context:
      ```
      Scenario: specs/auth/oauth.feature (orphaned)
      
      Last modified: 2026-02-15 (15 days ago)
      Size: 45 lines
      
      Preview:
        Feature: OAuth Authentication
          @phase:2
          Scenario: User logs in with OAuth
            Given the user is on the login page
            When they click "Sign in with Google"
            ...
      
      [Options presented below]
      ```

  @phase:3
  Scenario: Batch similar decisions
    Given there are 5 similar orphaned scenarios
    When they all have the same likely resolution
    Then the agent should ask:
      ```
      header: "Batch Decision"
      question: "5 scenarios have no journey links. They appear to be related to authentication."
      context: "Files:\n- specs/auth/oauth.feature\n- specs/auth/login.feature\n- specs/auth/logout.feature\n- specs/auth/password-reset.feature\n- specs/auth/mfa.feature"
      options: [
        {label: "Link all to 'User Authentication' journey", description: "Batch link all 5 scenarios"},
        {label: "Decide individually", description: "Review each scenario separately"},
        {label: "Skip all for now", description: "Address later"}
      ]
      ```

  @phase:3
  Scenario: Question timeout and defaults
    Given a question has been presented
    When the user doesn't respond within 60 seconds
    Then it should:
      1. Apply the default option (usually "Skip for now")
      2. Log: "No response, defaulting to 'Skip for now'"
      3. Continue with next issue
      4. Note in backlog: "auto-skipped due to timeout"

  @phase:3
  Scenario: Allow user to exit gracefully
    Given the user is in the middle of interactive recovery
    When they indicate they want to exit (Ctrl+C or "Exit" option)
    Then it should:
      1. Save current state to `.udd/recovery-session.yml`
      2. Note current issue and position
      3. Report: "Progress saved. Run 'udd doctor --fix --orchestrate --resume' to continue"
      4. Exit with code 0
    And no data should be lost

  @phase:3
  Scenario: Show progress during questions
    Given multiple issues require user input
    When presenting each question
    Then it should show progress:
      ```
      Recovery in Progress
      ====================
      
      Critical issues: 2/3 resolved
      Current: scenario_orphan (crit-002)
      
      Scenario: specs/auth/oauth.feature
      
      [Question options here]
      ```

  @phase:4
  Scenario: Recommendations based on patterns
    Given the agent detects a pattern in user decisions
    When the user has made 3 similar decisions
    Then it should offer:
      ```
      header: "Pattern Detected"
      question: "You've been linking auth scenarios to 'User Authentication'. Apply this to remaining 2 auth scenarios?"
      options: [
        {label: "Yes, apply pattern", description: "Auto-link remaining auth scenarios"},
        {label: "No, decide individually", description: "Continue reviewing each scenario"}
      ]
      ```
