@phase:3
Feature: Traceability Reference Resolution

# User Need:
#   Journey authors need concise references, while agents and CLI output need
#   canonical scenario file paths for traceability and sync manifests.
#
# Alternatives Considered:
#   - Require every journey step to repeat full feature paths: rejected because
#     it makes journeys noisy and duplicates use-case knowledge.
#   - Resolve references through use-case specs: accepted because use cases are
#     the canonical bridge between outcomes and scenario files.
#
# Success Criteria:
#   - Use-case ids resolve to their linked scenario feature files.
#   - Direct feature file references remain supported.
#   - Sync manifest output stores canonical scenario file paths.

  Scenario: Resolve journey use-case references
    Given a use case links to a scenario path
    When a journey step references that use case id
    Then traceability should resolve the reference to the scenario feature file

  Scenario: Sync manifest stores resolved scenario paths
    Given a journey step references a use case id
    When I run "udd sync --auto"
    Then the manifest should list the resolved scenario feature path
