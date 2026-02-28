# Implement Task 5 glossary and naming policy (@Sisyphus-Junior subagent)

**ID**: ses_36a9f0c80ffeGkY6JP53b97pjD
**Project ID**: ad761ea6174e58ed763fc75290c3f403ed51079d
**Created**: 2/25/2026, 9:18:04 AM
**Stats**: 1 files changed, +111 -0

---

## USER (9:18:05 AM)

# Glossary and Naming Policy for UDD Traceability (Phase 2)

Scope
- This document defines approved terms, disallowed ambiguous terms, replacements, and concrete naming rules for artifact ids, file names, tags, and relationship markers used by udd-core traceability. It is documentation-only and does not modify code or tests.

Glossary: Approved Terms
- Persona: human archetype with measurable goals. Location: product/actors.md. id pattern: kebab-case (team-member).
- Journey: ordered user steps representing an outcome. Location: product/journeys/*.md. id pattern: kebab-case (new-user-onboarding).
- Use Case: compact YAML mapping of persona intent to scenarios. Location: specs/use-cases/*.yml. id pattern: kebab-case (capture_ideas).
- Scenario: single Gherkin Scenario block in a .feature. Identity: area/feature/slug (todos/basic/add_todo_with_title).
- Requirement: implementation-facing technical requirement. Location: specs/requirements/*.yml. id pattern: kebab-case (persist_todo_with_defaults).
- Component: implementation unit (service/module/widget). Location: specs/components/*.md. id pattern: kebab-case (task_service).
- E2E Test: test verifying a scenario. Location: tests/**/*.e2e.test.ts. id pattern: kebab-case matching scenario slug (add_item_via_cli).
- Test Review: verification artifact linking test to scenario. Location: tests/**/*test-review.yml. id pattern: <test-id>.test-review (add_item_via_cli.test-review).

Disallowed / Ambiguous Terms and Replacements
- Actor (ambiguous) -> use Persona. Rationale: "actor" has runtime semantics in other contexts and was used inconsistently. Keep product/actors.md file name but prefer the term Persona in docs and trace fields.
- Feature (overloaded) -> use Scenario for single Gherkin scenario, Feature only as .feature file container name. Rationale: "feature" is overloaded between BDD feature files and product features; be explicit when you mean scenario vs feature directory.
- Use Case vs Journey confusion: ban using "use-case" and "journey" interchangeably. Replacement: Journey = user flow (product/journeys); Use Case = mapping artifact (specs/use-cases).
- Test (ambiguous) -> use E2E Test for implementation verification; use Test Review for fidelity checks. Rationale: avoids mixing code/test status with spec artifacts.
- Story / Epic / Ticket -> disallowed as canonical terms in trace fields. Use Journey, Use Case, or Requirement as appropriate.

Rationale for bans
- Ambiguous labels cause broken trace queries and automated mismatches. The traceability contract and tooling rely on deterministic id patterns and location semantics.

Naming Rules

1) Concept ids
- Use kebab-case for all artifact ids unless explicitly path-based. Allowed chars: lower-case letters, numbers, and hyphen. No spaces, no underscores in id fields except where historical YAML uses underscore in use_case ids; migrate to kebab-case over time.
- Scenario id: use path-style identity area/feature/slug where each segment is kebab-case (e.g., udd/cli/inbox/add_item_via_cli -> normalize to udd/cli/inbox/add-item-via-cli for filenames; trace fields may preserve path with slashes).

2) File names and paths
- Persona entries: product/actors.md (single file). persona ids referenced in frontmatter or YAML use kebab-case.
- Journeys: product/journeys/<kebab-case-id>.md (e.g., product/journeys/new-user-onboarding.md).
- Use Cases: specs/use-cases/<kebab-case-id>.yml (e.g., specs/use-cases/capture-ideas.yml).
- Scenarios (feature files): specs/features/<area>/<feature>/<slug>.feature where <area> and <feature> are kebab-case and <slug> is kebab-case (e.g., specs/features/todos/basic/add-todo-with-title.feature). Each .feature must contain exactly one Scenario block.
- Requirements: specs/requirements/<kebab-case-id>.yml (persist-todo-with-defaults.yml).
- Components: specs/components/<kebab-case-id>.md or .yml (task-service.md).
- E2E tests: tests/e2e/<area>/<feature>/<slug>.e2e.test.ts matching scenario slug (add-todo-with-title.e2e.test.ts).
- Test Review: tests/<area>/<feature>/<slug>.test-review.yml (add-todo-with-title.test-review.yml).

3) Tags / Markers
- Phase tags: @phase:N where N is integer. Use only on scenario files to indicate planned phase. Example: @phase:2
- Trace tags: @trace:<id> may be used inside feature comments to link to requirement or use_case id. Use sparingly; primary link must remain in use_case or requirement YAML.
- Status markers: use only the enum values defined in traceability-contract.yml for status fields (passing, failing, pending).

4) Relationship markers (how links are represented)
- Journey.step → either `use_case:<use-case-id>` or `specs/features/<area>/<feature>/<slug>.feature` (preferred: use_case). Example: "User signs up → use_case:capture-ideas".
- Use Case outcomes → scenarios: list scenario ids in area/feature/slug format. Example: outcomes.scenarios: [todos/basic/add-todo-with-title]
- Requirement.scenarios → list scenario slugs (kebab-case) or full path; prefer full relative path when ambiguity exists. Example: scenarios: [specs/features/todos/basic/add-todo-with-title.feature]
- E2E Test.scenario_path → must be the feature file path. Example: scenario_path: specs/features/todos/basic/add-todo-with-title.feature

Concrete Examples (all concepts)
- Persona/Actor record
  - File: product/actors.md
  - id: team-member
  - name: Team Member

- Journey
  - File: product/journeys/new-user-onboarding.md
  - id: new-user-onboarding
  - actor: team-member
  - steps:
    - "Sign up → use_case:signup"

- Use Case
  - File: specs/use-cases/signup.yml
  - id: signup
  - name: Sign up
  - actors: [team-member]
  - outcomes.scenarios: [udd/auth/signup]

- Scenario (feature)
  - File: specs/features/udd/auth/signup.feature
  - Identity: udd/auth/signup

- E2E Test
  - File: tests/e2e/udd/auth/signup.e2e.test.ts
  - id: signup
  - scenario_path: specs/features/udd/auth/signup.feature

- Component
  - File: specs/components/auth-service.md
  - id: auth-service
  - supported_scenarios: [udd/auth/signup]

- Requirement
  - File: specs/requirements/persist-user.yml
  - id: persist-user
  - feature: udd/auth
  - scenarios: [specs/features/udd/auth/signup.feature]

- Test Review
  - File: tests/e2e/udd/auth/signup.test-review.yml
  - id: signup.test-review
  - test_id: signup
  - scenario_path: specs/features/udd/auth/signup.feature

Ban on overloaded labels
- Never use a single term to refer to multiple concepts. Example bans:
  - Do not use "actor" to mean both runtime actor and persona. Use "Persona" in docs and trace fields; keep file name actors.md for compatibility.
  - Do not use "feature" in trace fields to mean scenario id. If you mean scenario, use area/feature/slug pattern.

Migration notes
- Where historical files use underscores or mixed-case, prefer new kebab-case names in new artifacts. Tooling and lints will flag migration needs.

Enforcement and verification
- udd lint and npm run check should flag violations of these rules where possible. Keep policy documentation here; do not implement enforcement in code as part of this task.

Contact and change process
- Propose changes to this policy via normal PR process. If a relaxation is needed, update docs/architecture/glossary-naming-policy.md and include migration steps.


