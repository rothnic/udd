# SysML-Informed Feature Template
# 
# This template helps you create comprehensive feature scenarios using SysML principles.
# Remove this header when creating your actual feature file.

Feature: [Feature Name]
  # User Need: [Who needs this and why?]
  # Who: [Specific user types/roles]
  # Why: [Business value or user problem being solved]
  # 
  # Alternatives Considered:
  #   - [Alternative 1]: [Brief description] - [Decision: Rejected/Deferred/Chosen] ([Reason])
  #   - [Alternative 2]: [Brief description] - [Decision: Rejected/Deferred/Chosen] ([Reason])
  #   - [Chosen Approach]: [Brief description] - CHOSEN ([Why this is best])
  #
  # Success Criteria:
  #   - [Measurable criteria 1]
  #   - [Measurable criteria 2]
  #   - [Measurable criteria 3]
  #
  # Edge Cases to Cover:
  #   - [Edge case 1]
  #   - [Edge case 2]
  #   - [Error condition]

  Background:
    Given [common preconditions that apply to all scenarios]
    And [additional setup if needed]

  Scenario: [Happy path - most common successful case]
    Given [initial state]
    And [additional context]
    When [user action]
    Then [expected outcome]
    And [additional verification]

  Scenario: [Alternative success path]
    Given [different initial state]
    When [user action]
    Then [expected outcome]

  Scenario: [Error handling - what if it goes wrong?]
    Given [setup for error condition]
    When [action that triggers error]
    Then [appropriate error response]
    And [system remains stable]

  Scenario: [Edge case - boundary condition]
    Given [edge case setup]
    When [action at boundary]
    Then [expected behavior at edge]

  Scenario: [Performance/scale consideration]
    Given [large dataset or load condition]
    When [user action]
    Then [completes within acceptable time]
    And [displays progress if needed]

# Guidelines for Using This Template:
# 
# 1. User Need Section:
#    - Be specific about WHO needs this feature
#    - Clearly state WHY it matters (business value)
#    - Include context about the user's workflow
#
# 2. Alternatives Considered:
#    - List ALL alternatives you considered
#    - Document why each was rejected, deferred, or chosen
#    - This helps future maintainers understand decisions
#
# 3. Success Criteria:
#    - Use measurable, testable criteria
#    - Include performance targets if relevant
#    - Think about what "done" looks like
#
# 4. Scenarios:
#    - Start with the happy path
#    - Cover error cases (what could go wrong?)
#    - Include edge cases (boundaries, limits, unusual conditions)
#    - Consider performance with large datasets
#    - Think about concurrent users if relevant
#
# 5. Keep It Focused:
#    - One feature per file
#    - Split large features into smaller ones
#    - Use Background for common setup
#
# 6. Examples of Complete Features:
#    - See docs/example-features/ for real-world examples
