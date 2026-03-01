Feature: Health Metrics

# User Need:
#   Teams need quantitative metrics about test health to track
#   improvements, identify trends, and make data-driven decisions
#   about quality investments.
#
# Alternatives Considered:
#   - Qualitative assessments: subjective and inconsistent
#   - Manual metric collection: time-consuming and error-prone
#   - External tools: adds complexity and cost
#
# Success Criteria:
#   - Key health metrics are calculated automatically
#   - Metrics are tracked over time
#   - Trends are visible in status output
#   - Thresholds can be configured

  Background:
    Given a UDD project is initialized
    And test data exists for metric calculation

  @phase:3
  Scenario: Calculate test coverage percentage
    Given 10 features have scenarios defined
    And 8 features have linked tests
    When I run "udd metrics coverage"
    Then the coverage percentage should be 80%
    And the metric should be displayed with precision to 1 decimal

  @phase:3
  Scenario: Calculate dirty test ratio
    Given 50 tests exist in the project
    And 5 tests are marked dirty
    When I run "udd metrics dirty-ratio"
    Then the dirty ratio should be 10%
    And the output should show both count and percentage

  @phase:3
  Scenario: Calculate average review wait time
    Given tests exist with various review wait times
    When I run "udd metrics review-wait-time"
    Then the average wait time should be calculated
    And the median wait time should also be shown
    And the calculation should exclude already-approved tests

  @phase:3
  Scenario: Calculate test flakiness score
    Given tests have run history with pass/fail data
    When I run "udd metrics flakiness"
    Then each test should have a flakiness score
    And flaky tests (inconsistent results) should be identified
    And the score should range from 0 (stable) to 100 (unreliable)

  @phase:3
  Scenario: Calculate test execution time trends
    Given tests have execution time history
    When I run "udd metrics execution-time"
    Then average execution time should be shown
    And trends (improving/degrading) should be indicated
    And outliers (sudden spikes) should be flagged

  @phase:3
  Scenario: View all metrics summary
    When I run "udd metrics"
    Then a summary of all metrics should be displayed
    And each metric should have its current value
    And trends should be shown where applicable
    And threshold violations should be highlighted

  @phase:3
  Scenario: Metrics respect date range filter
    Given historical metric data exists
    When I run "udd metrics --since 2024-01-01 --until 2024-02-01"
    Then only data within the date range should be considered
    And the metrics should reflect the filtered period

  @phase:3
  Scenario: Export metrics to file
    When I run "udd metrics --export metrics.json"
    Then metrics should be saved to "metrics.json"
    And the file should be in JSON format
    And it should include timestamp and all calculated values

  @phase:3
  Scenario: Compare metrics between periods
    Given historical data exists for multiple periods
    When I run "udd metrics --compare --periods 4"
    Then metrics for the last 4 periods should be compared
    And trends should be calculated and displayed
    And significant changes should be highlighted
