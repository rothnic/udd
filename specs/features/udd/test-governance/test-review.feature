Feature: Test Review Evidence

# User Need:
#   Reviewers need source-controlled reviewed-test evidence that survives across
#   machines and cannot be overridden by ignored local cache.

  Background:
    Given a UDD project is initialized

  @phase:3
  Scenario: Record source-controlled review evidence with scan classification
    Given the project has a meaningful linked test
    When I run "udd test review tests/auth/login.e2e.test.ts"
    Then the test review manifest records the test as clean
    When I run "udd test-scan --json"
    Then the reviewed test is classified as reviewed proof

