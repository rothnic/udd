Feature: Dev-experience/test Discovery

# User Need: Developers and tooling maintainers need the test-discovery system to report editor status so that tooling can surface which editors or environments are detected and adjust integrations accordingly.

# Alternatives Considered:
# - Relying on user configuration files to declare editor presence: requires manual setup and can become stale.
# - Using heuristic environment detection only: simpler but less explicit and may mis-detect remote or containerized environments.
# - Providing a discovery CLI subcommand separate from status: increases commands to learn and maintain.

# Success Criteria:
# - The editor detection/state is discoverable by the test-discovery flow and surfaced consistently in the UI/CLI.
# - Detection behavior is robust across common environments (local, remote, container) and covered by tests.
# - There are clear logs or messages explaining detection decisions for troubleshooting.

  Scenario: Editor Status
    Given I am in the right state
    When I do something
    Then something happens
