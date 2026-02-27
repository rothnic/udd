Feature: Cli

# User Need: Developers need a CLI lint command that validates Gherkin feature files
# so that journey-driven specs remain executable tests and don't break the CI pipeline.
# Who: Developer or CI system
# Why: Prevent malformed or incomplete feature files from causing false positives
# Alternatives Considered:
# - Rely on downstream test failures (slow, noisy)
# - Use a permissive lint that only warns (misses blocking errors)
# - Fail-fast validator that reports precise file/line errors (chosen)
# Success Criteria:
# - Validator reports syntax errors with file and line
# - Validator flags empty or missing sections as errors/warnings
# - Feature completeness checks (user need, alternatives, success criteria comments)

  Scenario: Lint Invalid Specs
    Given I am in the right state
    When I do something
    Then something happens

  Scenario: Lint reports syntax error for invalid feature files
    Given a feature file "specs/features/example/bad_syntax.feature" containing invalid gherkin
    When I run the udd lint command on that file
    Then the linter should report a syntax error with the file path and line number

  Scenario: Lint reports empty feature file as an error
    Given an empty feature file "specs/features/example/empty.feature"
    When I run the udd lint command on that file
    Then the linter should report that the feature file is empty or missing scenarios

  Scenario: Lint flags feature missing required SysML comments
    Given a feature file "specs/features/example/missing_sysml.feature" missing User Need and Success Criteria comments
    When I run the udd validate command
    Then the validator should include a warning or failure indicating missing SysML sections
