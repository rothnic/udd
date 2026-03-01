Feature: Git Hooks Installation

# User Need:
#   Teams need automated checks that run before commits to catch
#   issues early, ensure test governance rules are followed, and
#   prevent broken tests from entering the codebase.
#
# Alternatives Considered:
#   - CI-only checks: feedback loop too slow
#   - Manual pre-commit checks: unreliable and forgotten
#   - IDE integrations: inconsistent across editors
#
# Success Criteria:
#   - Hooks can be installed via CLI command
#   - Installation is idempotent
#   - Hook functionality is configurable
#   - Uninstallation is supported

  Background:
    Given a UDD project is initialized
    And the project uses git for version control

  @phase:1
  Scenario: Install git hooks via CLI
    Given git hooks are not yet installed
    When I run "udd hooks install"
    Then the command should exit with code 0
    And a pre-commit hook should be created at ".git/hooks/pre-commit"
    And the hook should be executable

  @phase:1
  Scenario: Re-installing hooks is idempotent
    Given hooks are already installed
    When I run "udd hooks install"
    Then the command should exit with code 0
    And the existing hooks should be preserved
    And no duplicate hooks should be created

  @phase:1
  Scenario: Install hooks with backup
    Given a pre-commit hook already exists at ".git/hooks/pre-commit"
    When I run "udd hooks install --backup"
    Then the existing hook should be backed up
    And the UDD hook should be installed
    And the backup location should be reported

  @phase:1
  Scenario: Uninstall git hooks
    Given hooks are currently installed
    When I run "udd hooks uninstall"
    Then the UDD hooks should be removed
    And any backed-up hooks should be restored
    And the command should confirm successful uninstallation

  @phase:1
  Scenario: Install only specific hooks
    When I run "udd hooks install --only pre-commit"
    Then only the pre-commit hook should be installed
    And other hooks like pre-push should not be created

  @phase:1
  Scenario: Check hook installation status
    Given hooks may or may not be installed
    When I run "udd hooks status"
    Then the output should show which hooks are installed
    And the output should show which hooks are missing
    And configuration status should be displayed

  @phase:1
  Scenario: Install hooks with custom configuration
    When I run "udd hooks install --config validate-staged-only=true"
    Then the hooks should be installed
    And the configuration should be saved
    And subsequent hook runs should use the configuration

  @phase:1
  @error
  Scenario: Install fails when not in git repository
    Given I am not in a git repository
    When I run "udd hooks install"
    Then the command should exit with code 1
    And the output should indicate "not a git repository"
