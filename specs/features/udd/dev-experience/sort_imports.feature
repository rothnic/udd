Feature: Dev Experience

# User Need: Developers need import statements to be consistently
# ordered so tooling (linters, bundlers) behave predictably and PRs
# don't contain unrelated import reordering noise.
#
# Alternatives Considered:
# - Leave ordering to developers: rejected due to inconsistent styles
#   and noisy diffs. Prefer automated sorting.
# - Only enforce in CI: rejected because local developer feedback is
#   faster; prefer pre-commit fixes plus CI enforcement.
#
# Success Criteria:
# - Running "npm run check:fix" sorts imports in files with unsorted
#   imports and exits successfully.
# - Tests verify that previously unsorted files are transformed into
#   the expected sorted order and that the command can be run locally
#   and in CI.

  Scenario: Sort Imports
    Given I have a file with unsorted imports
    When I run "npm run check:fix"
    Then the imports should be sorted
 
