Feature: Analyze issue context for decision making

  As a developer or agent
  I want to load and analyze all relevant context for an issue
  So that I can present informed options to the user

  Background:
    Given a UDD project in recovery mode
    And an issue has been selected for resolution

  @phase:3
  Scenario: Load related files
    Given an issue references specific files
    When I analyze the issue context
    Then I should load related files based on issue type:
      | Issue Type         | Files to Load                              |
      | scenario_orphan    | scenario file, journey candidates          |
      | test_failing       | test file, scenario file, implementation   |
      | journey_stale      | journey file, related scenarios            |
      | validation_error   | file with error, schema definition         |
      | phase_mismatch     | scenario file, manifest, phase config      |
    And I should read file contents into memory

  @phase:3
  Scenario: Check git history for recent changes
    Given files have been loaded
    When I check git history
    Then I should retrieve recent commits affecting these files:
      | Field         | Description                        |
      | commit_hash   | Short SHA of the commit            |
      | author        | Who made the change                |
      | timestamp     | When the change was made           |
      | message       | Commit message                     |
      | diff_summary  | Brief description of changes       |
    And I should look back up to 10 commits or 30 days

  @phase:3
  Scenario: Identify decision points requiring user input
    Given files and history are loaded
    When I analyze for decision points
    Then I should identify ambiguous situations:
      | Situation              | Question to Ask                              |
      | Multiple journey candidates | Which journey owns this scenario?      |
      | Test fails ambiguously      | Fix test code or mark scenario pending?|
      | Scenario partially done     | Complete or mark as draft?             |
      | Phase unclear               | Current phase or future phase?         |
    And each decision point should have context and implications

  @phase:3
  Scenario: Gather scenario context for orphans
    Given a scenario_orphan issue
    When I analyze possible journey links
    Then I should find candidate journeys by:
      | Method             | Description                               |
      | Directory matching | Same directory structure                  |
      | Keyword matching   | Similar terms in titles/descriptions      |
      | Tag analysis       | Shared tags or categories                 |
      | Historical links   | Previously linked journeys                |
    And I should score each candidate by relevance
    And present top 3-5 candidates to user

  @phase:3
  Scenario: Analyze test failure context
    Given a test_failing issue
    When I load the test and scenario
    Then I should identify failure type:
      | Failure Type        | Indicators                    |
      | Assertion failure   | Expected vs actual mismatch   |
      | Timeout             | Test took too long            |
      | Setup error         | Before hooks failed           |
      | Import error        | Module not found              |
      | Implementation bug  | Code under test has bug       |
    And I should check if the scenario changed recently
    And I should check if the implementation changed recently

  @phase:3
  Scenario: Build context summary
    Given all context has been gathered
    When I build the summary
    Then I should create a structured context object:
      | Field               | Content                          |
      | issue               | Full issue details               |
      | files               | Relevant file contents           |
      | git_history         | Recent changes                   |
      | decision_points     | Ambiguities requiring input      |
      | recommendations     | Suggested actions with rationale |
    And this context should be passed to the presentation layer

  @phase:4
  Scenario: Cache context for performance
    Given context analysis can be expensive
    When I analyze an issue
    Then I should cache results in ".udd/context-cache/"
    And the cache key should be based on issue id and file hashes
    And I should invalidate cache when files change
