Feature: Create Bead-Based Recovery Plan
  As a developer
  I want to generate a structured plan using beads
  So that I can understand the work DAG and execute it properly

  Background:
    Given the UDD project has drift detected
    And the doctor command supports "--plan" flag

  @phase:3
  Scenario: Generate plan from drift
    Given drift detection finds issues:
      | type | severity | file |
      | manifest_corrupt | critical | specs/.udd/manifest.yml |
      | test_missing | warning | tests/e2e/auth/login.e2e.test.ts |
      | journey_stale | warning | product/journeys/onboarding.md |
    When I run "udd doctor --plan"
    Then a plan should be created at ".udd/plan.yml"
    And the plan should contain 3 beads
    And the plan should have a namespace starting with "plan/"
    And the plan should track roots and leaves
    And the plan should have statistics:
      | stat | value |
      | total | 3 |
      | pending | 3 |
      | ready | 1 |

  @phase:3
  Scenario: Recovery plan includes dependency analysis
    Given drift detection finds issues:
      | id | type | severity | file |
      | issue-1 | manifest_corrupt | critical | specs/.udd/manifest.yml |
      | issue-2 | validation_error | critical | specs/use-cases/auth.yml |
    When I run "udd doctor --plan"
    Then the validation_error bead should depend on the manifest_corrupt bead
    And the manifest_corrupt bead should block the validation_error bead
    And the validation_error bead status should be "pending"
    And the manifest_corrupt bead status should be "ready"

  @phase:3
  Scenario: View plan status
    Given a plan exists at ".udd/plan.yml"
    And the plan has beads in various states:
      | bead_id | status |
      | bead-1 | completed |
      | bead-2 | in_progress |
      | bead-3 | ready |
      | bead-4 | pending |
    When I run "udd doctor --bead-status"
    Then I should see the plan namespace
    And I should see statistics:
      | stat | count |
      | completed | 1 |
      | in_progress | 1 |
      | ready | 1 |
      | pending | 1 |
    And I should see ready beads listed

  @phase:3
  Scenario: Recovery plan with no drift
    Given drift detection finds no issues
    When I run "udd doctor --plan"
    Then I should see "No drift detected - no plan needed!"
    And no plan file should be created
