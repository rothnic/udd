@phase:3
Feature: Adapter-neutral agent handoff evidence

  As an agent operator
  I want handoff evidence built from shared UDD facts
  So that I can review next work, blockers, verification, and pause reasons without chat history

  Scenario: Evidence command returns reviewable handoff decisions
    When the OpenCode adapter requests evidence for the agent operator goal
    Then the evidence includes next work, user impact, blockers, and verification commands
    And the evidence includes proof status and explicit pause reasons
    And the evidence stays adapter-neutral without Codex-only or OpenCode-only behavior
