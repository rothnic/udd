Feature: UDD CLI

  # User Need:
  # A developer (actor) needs a reproducible, low-friction way to initialize the
  # repository for local development so they can run and test UDD features.
  # This includes creating required folders, installing dependencies, and
  # adding basic config files. The feature documents expected behaviors and
  # failure modes so automation and CI can validate initialization.
  
  # Alternatives Considered:
  # - Manual README instructions: simple but error-prone for new contributors.
  # - Interactive guided installer: richer UX but higher maintenance cost.
  # - Docker dev environment: isolates dependencies but increases tooling
  #   complexity for contributors who prefer local node installs.
  # The chosen approach: provide an npm script wrapper (`npm run setup`) that
  # performs common initialization steps and is easy to run locally and in CI.
  
  # Success Criteria:
  # - Running `npm run setup` in an empty repo exits 0 and creates expected
  #   files/folders (node_modules optional depending on env).
  # - If repo already initialized, command exits non-zero with clear message
  #   and does not overwrite user content unless forced.
  # - Custom project names and existing files are handled deterministically.

  Scenario: Setup development environment
    Given I am in the project root
    When I run "npm run setup"
    Then the command should exit with code 0
    And the "setup" script should be defined in package.json

  Scenario: Setup fails when directory already initialized
    Given the project root contains a file named ".udd/manifest.yml"
    And I am in the project root
    When I run "npm run setup"
    Then the command should exit with a non-zero code
    And the output should contain "already initialized" or similar explanatory message

  Scenario: Setup with a custom project name
    Given I am in an empty directory
    When I run "npm run setup -- --name my-custom-project"
    Then the command should exit with code 0
    And a configuration file should contain the project name "my-custom-project"

  Scenario: Setup in directory with existing files does not overwrite
    Given the project root contains a file named "README.md" with content "EXISTING"
    And I am in the project root
    When I run "npm run setup"
    Then the command should exit with code 0
    And the file "README.md" should still contain "EXISTING"

