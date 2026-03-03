Feature: Detect empty test step implementations

# User need:
#   Prevent committing tests that contain empty step definitions like
#   `Given("...", () => {})` which add no verification and hide unimplemented
#   steps. The scanner should flag empty step implementations across common
#   test styles and async/regular functions.
#
# Success criteria:
#   - Empty step implementations are detected across arrow and regular function
#     styles, including async variants.
#   - The scanner reports file and line context so developers can fix the
#     offending step.

  Background:
    Given a UDD project is initialized
    And test files exist in the repository

  @phase:3
  Scenario: Detect empty arrow function step implementation
    Given a file "tests/steps/empty-arrow.test.ts" contains the code:
      """
      import { Given, When, Then } from 'cucumber';

      Given('an empty step', () => {});

      When('an action occurs', () => {
        // implemented
      });

      Then('verify outcome', () => {
        // implemented
      });
      """
    When I run "udd scan-tests --detect-empty-steps"
    Then the scan should report an empty step implementation in "tests/steps/empty-arrow.test.ts"
    And the report should include the line containing "Given('an empty step', () => {})"

  @phase:3
  Scenario: Detect empty async arrow function step implementation
    Given a file "tests/steps/empty-async-arrow.test.ts" contains the code:
      """
      import { Given } from 'cucumber';

      Given('an async empty step', async () => {});
      """
    When I run "udd scan-tests --detect-empty-steps"
    Then the scan should report an empty async step implementation in "tests/steps/empty-async-arrow.test.ts"
    And the report should include the line containing "Given('an async empty step', async () => {})"

  @phase:3
  Scenario: Detect empty regular function step implementation
    Given a file "tests/steps/empty-regular.test.ts" contains the code:
      """
      const { Given } = require('cucumber');

      Given('a regular empty step', function() {});
      """
    When I run "udd scan-tests --detect-empty-steps"
    Then the scan should report an empty regular function step implementation in "tests/steps/empty-regular.test.ts"
    And the report should include the line containing "Given('a regular empty step', function() {})"

  @phase:3
  Scenario: Detect empty async regular function step implementation (callback style)
    Given a file "tests/steps/empty-async-regular.test.ts" contains the code:
      """
      const { When } = require('cucumber');

      When('an async regular empty step', async function() {});
      """
    When I run "udd scan-tests --detect-empty-steps"
    Then the scan should report an empty async regular function step implementation in "tests/steps/empty-async-regular.test.ts"
    And the report should include the line containing "When('an async regular empty step', async function() {})"

  @phase:3
  Scenario: Detect multiple empty steps in one file with mixed styles
    Given a file "tests/steps/mixed-empty.test.ts" contains the code:
      """
      import { Given, Then } from 'cucumber';

      Given('empty arrow', () => {});
      Given('empty async arrow', async () => {});
      Then('empty regular', function() {});

      // a real step to ensure scanner doesn't false-positive implemented code
      Then('real check', () => {
        expect(true).toBe(true);
      });
      """
    When I run "udd scan-tests --detect-empty-steps"
    Then the scan should report three empty step implementations in "tests/steps/mixed-empty.test.ts"
    And the report should list the lines containing "Given('empty arrow', () => {})", "Given('empty async arrow', async () => {})", and "Then('empty regular', function() {})"

  @phase:3
  Scenario: Ignore non-empty step bodies that contain only comments or whitespace
    Given a file "tests/steps/comment-only.test.ts" contains the code:
      """
      import { Given } from 'cucumber';

      Given('comment only', () => {
        // TODO: implement later
      });
      """
    When I run "udd scan-tests --detect-empty-steps --treat-comments-as-empty"
    Then the scan should report an empty step implementation in "tests/steps/comment-only.test.ts"
    And the report should include the line containing "Given('comment only', () => {" 
