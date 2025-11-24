import { loadFeature, describeFeature } from '@amiceli/vitest-cucumber';
import { expect } from 'vitest';
import { runUdd } from '../../../utils';

const feature = await loadFeature('specs/features/udd/cli/lint_valid_specs.feature');

describeFeature(feature, ({ Scenario }) => {
  Scenario('Linting a valid spec structure', ({ Given, When, Then, And }) => {
    let commandOutput: { stdout: string, stderr: string };
    let commandError: any;

    Given('I have a valid UDD spec structure', () => {
      // Already true in this repo
    });

    When('I run "udd lint"', async () => {
      try {
        commandOutput = await runUdd('lint');
      } catch (error: any) {
        commandError = error;
      }
    });

    Then('the command should exit with code 0', () => {
      if (commandError) {
        console.error(commandError.stdout);
        console.error(commandError.stderr);
        throw new Error(`Command failed with code ${commandError.code}`);
      }
    });

    And('the output should contain "All specs are valid"', () => {
      expect(commandOutput.stdout).toContain('All specs are valid');
    });
  });
});
