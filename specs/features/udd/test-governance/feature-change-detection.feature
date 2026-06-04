Feature: Impact-Driven Regression Selection

# User Need:
#   Reviewers and agents need one command that turns a changed source file into
#   affected behavior and concrete verification commands.

  Background:
    Given the UDD project has traceable use cases, scenarios, and tests

  @phase:3
  Scenario: Recommend targeted verification for changed feature, use case, test, goal, and untraceable paths
    When I analyze impact for a changed feature file
    Then the impact output includes affected behavior and a targeted test command
    When I analyze impact for a changed use case file
    Then the impact output includes linked scenarios and test commands
    When I analyze impact for a changed test file
    Then the impact output traces back to the behavior contract it proves
    When I analyze impact for a changed goal file
    Then the impact output includes goal context and project-health commands
    When I analyze impact for an untraceable implementation file
    Then the impact output labels the path as untraceable with fallback validation
    When I analyze impact for a scenario with linked proof
    Then the impact output includes the linked test path
    When I analyze impact for a reference-product use case
    Then the impact output includes reference-product scenarios and missing proof commands
    When I analyze impact for a scenario with missing proof
    Then the impact output recommends the expected missing test path
