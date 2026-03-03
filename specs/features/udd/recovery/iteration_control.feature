Feature: Control iteration and workflow flow in recovery

  As an agent orchestrating recovery
  I want to control the iteration flow
  So that the workflow proceeds systematically without getting stuck

  Background:
    Given a recovery backlog exists with pending issues
    And the agent is using the orchestrated recovery workflow

  @phase:3
  Scenario: Process one task at a time
    Given I run "udd doctor --fix --orchestrate"
    When the command starts
    Then it should:
      1. Check for existing backlog (create if none)
      2. Find next uncompleted critical issue
      3. Process that ONE issue to completion
      4. Verify the fix
      5. Update backlog
      6. Report status
      7. Exit cleanly
    And it should NOT automatically continue to next user-input issue

  @phase:3
  Scenario: Resume after completion
    Given I previously ran "udd doctor --fix --orchestrate"
    And it completed one issue and exited
    When I run it again
    Then it should:
      1. Load the existing backlog
      2. Find the next uncompleted issue
      3. Check if previous issue was verified
      4. Continue from where it left off
    And report: "Resuming recovery. 1/20 issues completed."

  @phase:3
  Scenario: Auto-continue for auto-fixable issues
    Given the next issue is auto-fixable
    When the agent processes it
    Then it should:
      1. Execute the auto-fix
      2. Verify it succeeded
      3. Check if next issue is also auto-fixable
      4. If yes, continue automatically
      5. If no, exit and report: "Auto-fixes complete. 5 issues fixed. Run again for next issue."

  @phase:3
  Scenario: Stop before user-input issues
    Given auto-fixable issues are complete
    And the next issue requires user input
    When the agent detects this
    Then it should:
      1. Complete any remaining auto-fixes
      2. Report summary:
         ```
         Recovery Progress Update
         ========================
         Completed: 12 auto-fixable issues
         Next: scenario_orphan (requires your input)
         
         Run 'udd doctor --fix --orchestrate' to continue
         with interactive resolution.
         ```
      3. Exit cleanly (code 0)

  @phase:3
  Scenario: Report progress after each iteration
    Given recovery is in progress
    When each issue completes
    Then it should display:
      ```
      Recovery Progress
      =================
      Session: rec-2026-03-02-001
      
      Completed: 5/20 issues
        ✓ Critical: 2/3
        ✓ Warning: 3/15
        ⏳ Remaining: 15 issues
      
      Current phase: Interactive resolution
      Next issue: scenario_orphan (crit-003)
      
      Estimated remaining: 1h 45m
      ```

  @phase:3
  Scenario: Handle all critical issues complete
    Given all critical issues are resolved
    And only warnings and info remain
    When the agent checks backlog
    Then it should ask:
      ```
      header: "Critical Issues Resolved"
      question: "All 3 critical issues are fixed. Continue with 15 warnings?"
      options: [
        {label: "Yes, continue", description: "Proceed with warning-level issues"},
        {label: "No, pause here", description: "Stop now, resume warnings later"},
        {label: "Auto-fix warnings only", description: "Fix auto-fixable warnings, skip others"}
      ]
      ```

  @phase:3
  Scenario: Complete recovery
    Given all issues are resolved or skipped
    When the agent verifies backlog
    Then it should:
      1. Run final validation: `udd doctor --strict`
      2. Generate recovery report
      3. Archive backlog to `.udd/recovery-history/`
      4. Display:
         ```
         ✓ Recovery Complete!
         
         Summary:
         - 20 issues processed
         - 18 resolved
         - 2 skipped (deferred)
         
         Time: 2h 15m
         
         Recommendations:
         - Run 'udd sync' to finalize
         - Set up pre-commit hooks to prevent future drift
         ```
      5. Update session status to "completed"

  @phase:3
  Scenario: Handle stuck workflow
    Given an issue cannot be resolved
    When all resolution options fail
    Then it should:
      1. Mark issue as "stuck" in backlog
      2. Add detailed error log
      3. Skip to next issue
      4. Report at end: "1 issue stuck - see .udd/recovery-errors.log"
      5. Provide guidance: "Manual intervention required for issue crit-005"

  @phase:3
  Scenario: Timeout protection
    Given a single issue is taking too long
    When execution exceeds 5 minutes for one issue
    Then it should:
      1. Interrupt current operation
      2. Save state
      3. Report: "Issue taking unusually long. Saved state. Run with --verbose for details."
      4. Exit cleanly
    And allow resumption without data loss

  @phase:4
  Scenario: Parallel work detection and coordination
    Given the backlog has parallel-safe issues
    When running with "--parallel" flag
    Then it should:
      1. Identify independent work streams
      2. Execute up to 4 in parallel
      3. Coordinate dependencies
      4. Report progress per stream:
         ```
         Parallel Recovery (4 workers)
         =============================
         Worker 1: ✓ test_missing (auth/login)
         Worker 2: ✓ test_missing (auth/logout)
         Worker 3: → journey_stale (onboarding) [in progress]
         Worker 4: ⚠️ waiting for dependency
         ```
      5. Consolidate results

  @phase:4
  Scenario: Integration with CI/CD
    Given recovery is running in CI environment
    When executing in non-interactive mode
    Then it should:
      1. Auto-fix what it can
      2. Skip user-input issues with warning
      3. Generate JSON report
      4. Exit with code 1 if critical issues remain
      5. Report: "CI mode: 12 auto-fixed, 3 require manual review"

  @phase:4
  Scenario: Daily recovery check
    Given I want to run recovery as part of daily workflow
    When I run "udd recovery --daily"
    Then it should:
      1. Quick scan for critical issues only
      2. Auto-fix any that appeared
      3. Report brief status
      4. Exit quickly (< 30 seconds)
    And NOT require user input unless critical issues found
