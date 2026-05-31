Feature: Track progress
  Scenario: Complete with note
    Given an in-progress task
    When a user completes it with note "Released"
    Then the task state is "Done" and the review note is "Released"
