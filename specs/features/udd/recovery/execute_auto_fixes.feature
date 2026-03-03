Feature: Execute automated fixes in recovery workflow

  As a developer or agent
  I want to automatically fix safe issues without user input
  So that I can quickly resolve straightforward drift

  Background:
    Given a recovery backlog exists with auto-fixable issues
    And I have 12 auto-fixable issues out of 20 total

  @phase:3
  Scenario: Execute all auto-fixes in batch
    When I run "udd doctor --fix --auto"
    Then the command should:
      1. Load the recovery backlog
      2. Filter for auto-fixable issues
      3. Execute each fix in dependency order
      4. Verify each fix succeeded
      5. Update backlog status to "completed"
    And I should see progress output:
      ```
      Executing auto-fixes...
      ✓ Fixed: test_missing - tests/e2e/auth/login.e2e.test.ts
      ✓ Fixed: journey_stale - product/journeys/onboarding.md
      ...
      ✓ Fixed: 12/12 auto-fixable issues
      ```

  @phase:3
  Scenario: Create missing scenario stub
    Given an issue of type "test_missing" for scenario "specs/features/auth/oauth.feature"
    When the auto-fix executes
    Then it should:
      1. Extract domain and action from path
      2. Generate basic scenario content:
         ```gherkin
         Feature: OAuth authentication
           @phase:1
           Scenario: OAuth authentication
             Given the system is initialized
             When the user performs OAuth authentication
             Then the action is completed successfully
         ```
      3. Create the file at specs/features/auth/oauth.feature
      4. Update manifest
    And the file should be valid Gherkin

  @phase:3
  Scenario: Create missing test stub
    Given an issue of type "test_missing" for test "tests/e2e/auth/oauth.e2e.test.ts"
    When the auto-fix executes
    Then it should:
      1. Read the corresponding scenario
      2. Generate test file with Given/When/Then stubs:
         ```typescript
         import { describeFeature } from "@amiceli/vitest-cucumber";
         
         describeFeature('feature/authentication/oauth.feature', ({ Scenario }) => {
           Scenario('OAuth authentication', ({ Given, When, Then }) => {
             Given('the system is initialized', () => {});
             When('the user performs OAuth authentication', () => {});
             Then('the action is completed successfully', () => {});
           });
         });
         ```
      3. Create the file at the correct path
      4. Mark test as "dirty" in test-reviews.yml
    And the test should be importable

  @phase:3
  Scenario: Fix stale journey by marking for sync
    Given an issue of type "journey_stale" for "product/journeys/user-onboarding.md"
    When the auto-fix executes
    Then it should:
      1. NOT automatically sync (requires manual review)
      2. Update backlog entry:
         ```yaml
         - id: "warn-001"
           type: "journey_stale"
           status: "completed"
           resolution: "marked_for_sync"
           action_required: "Run 'udd sync' to complete"
         ```
      3. Add note to recovery report
    And the journey file should remain unchanged

  @phase:3
  Scenario: Regenerate corrupt manifest
    Given an issue of type "manifest_corrupt"
    When the auto-fix executes
    Then it should:
      1. Backup existing manifest to manifest.yml.bak
      2. Generate minimal valid manifest:
         ```yaml
         version: "2.0"
         generated: "2026-03-02T17:00:00Z"
         journeys: {}
         features: {}
         tests: {}
         ```
      3. Update backlog status to "completed"
    And the project should be recoverable

  @phase:3
  Scenario: Handle auto-fix failure
    Given an auto-fixable issue
    When the fix fails (e.g., permission denied)
    Then it should:
      1. Log the error
      2. Mark issue status as "failed" in backlog
      3. Continue with other auto-fixes
      4. Report at end:
         ```
         ⚠️  1 auto-fix failed:
           - test_missing (tests/e2e/auth/oauth.e2e.test.ts): Permission denied
         
         Run with --verbose for details or fix manually.
         ```
    And not block other fixes

  @phase:3
  Scenario: Verify auto-fixes with doctor
    Given auto-fixes have been executed
    When the command completes
    Then it should automatically run "udd doctor"
    And verify fixed issues no longer appear
    And update backlog:
      | Issue ID | Status    | Verified |
      | warn-001 | completed | true     |
      | warn-002 | completed | true     |
    And report:
      ```
      Verification complete: 12/12 issues confirmed resolved
      ```

  @phase:3
  Scenario: Parallel auto-fix execution
    Given multiple independent auto-fixable issues
    When "udd doctor --fix --auto --parallel" runs
    Then it should execute fixes concurrently where safe:
      ```
      Executing auto-fixes in parallel (max 4 workers)...
      [1/4] Fixing test_missing: tests/e2e/auth/login.e2e.test.ts
      [2/4] Fixing test_missing: tests/e2e/auth/logout.e2e.test.ts
      [3/4] Fixing test_missing: tests/e2e/user/profile.e2e.test.ts
      [4/4] Fixing journey_stale: product/journeys/onboarding.md
      ✓ All parallel fixes completed
      ```
    And respect dependencies (don't run dependent fixes until blockers complete)

  @phase:4
  Scenario: Dry-run auto-fixes
    Given I want to preview auto-fixes before applying
    When I run "udd doctor --fix --auto --dry-run"
    Then it should show what would be fixed without making changes:
      ```
      Dry-run mode - no changes will be made

      Would fix 12 issues:
        ✓ test_missing: Create tests/e2e/auth/login.e2e.test.ts
        ✓ test_missing: Create tests/e2e/auth/logout.e2e.test.ts
        ...
      
      Run without --dry-run to apply fixes.
      ```
    And not modify any files
