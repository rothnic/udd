# Glossary and Naming Policy

This document records the approved terminology and naming patterns used across the UDD repository. The goal: remove ambiguity, make traceability deterministic, and provide concrete file/name examples authors and agents can follow.

## Approved Terms
| Term | Definition | Usage |
|------|------------|-------|
| Persona | A human archetype representing a class of users, their goals, context, and constraints. | Recorded in product/actors.md and referenced by journeys. Use when describing who benefits from a capability. |
| Journey | An experience-first narrative describing stages a Persona goes through to achieve a goal. | Stored under product/journeys/{kebab-id}.md. Link to Use Cases, not scenario steps. |
| Use Case | Mapping from a Journey need to testable behaviors. | YAML artifacts in specs/use-cases/{kebab-id}.yml referencing scenario paths. |
| Scenario | Single source of acceptance written in Gherkin and stored in .feature files. One scenario per file policy applies. | specs/<domain>/{kebab-id}.feature or specs/features/<domain>/<feature-name>/<kebab-id>.feature |
| Requirement | Developer-facing contract linking scenarios to implementation details and non-functional constraints. | docs/requirements/{kebab-id}.md or specs/requirements/{kebab-id}.yml. Use for API contracts, performance constraints. |
| Component | Documented implementation unit (service, module, UI component, schema). | components/{kebab-id}.md. Include owners, interfaces, tests mapping. |
| E2E Test | The executable test that verifies a Scenario (Vitest + Gherkin). | tests/<domain>/{kebab-id}.e2e.test.ts. Distinguish from Test Review. |
| Test Review | Human or automated assessment of tests and scenarios quality. | docs/test-reviews/{kebab-id}.md or as PR review artifacts. |

## Disallowed / Ambiguous Terms
These terms have caused confusion in the repo. Avoid them; use the replacements below.
| Term | Why Disallowed | Replacement |
|------|----------------|-------------|
| Actor | Ambiguous with Persona and product/actors.md naming. | Persona (use in prose), keep product/actors.md filename unchanged for historical reasons. |
| Feature | Overloaded: BDD feature file vs high-level product feature. | Scenario (single behavior) or Feature container (directory) — prefer Scenario for acceptance text, Feature directory only as container. |
| Story, Epic, Ticket | Agile terms overloaded in trace fields and cause non-deterministic mapping. | Use Journey, Use Case, or Requirement depending on scope. |
| Test | Vague: may mean E2E test, unit test, or Test Review. | E2E Test (executable) or Test Review (assessment). Be explicit. |
| Task / Job | Implementation-level labels, ambiguous in product prose. | Requirement or Component task lists. |

Guidance: do not use disallowed terms in trace fields, IDs, or YAML keys. If you see them in historical artifacts, migrate the reference to an approved term when updating the file.

## Naming Patterns
This section defines the canonical patterns for IDs and file names. Follow these strictly to make linting and tracing deterministic.

### IDs
- kebab-case (lowercase, numbers allowed): ^[a-z0-9]+(-[a-z0-9]+)*$
- No spaces, underscores, or camelCase in ids
- IDs must be human-meaningful and short (prefer <= 4 segments)
- Examples:
  - persona: project-manager
  - journey: daily-planning
  - use-case: daily-reschedule
  - scenario: reschedule-event

### File Names (by concept)
- Journeys: product/journeys/{kebab-id}.md
  - Example: product/journeys/daily-planning.md
- Personas (actors): product/actors.md (centralized list) and product/personas/{kebab-id}.md for long-form persona docs
  - Example: product/personas/project-manager.md
- Use Cases: specs/use-cases/{kebab-id}.yml
  - Example: specs/use-cases/daily-reschedule.yml
- Scenarios (Gherkin): specs/<domain>/{kebab-id}.feature
  - Flat scenarios: specs/scheduling/reschedule-event.feature
  - Template-based features (container): specs/features/<domain>/<feature-name>/<kebab-id>.feature
    - Example: specs/features/reporting/export_csv/export_csv.feature
- Requirements: specs/requirements/{kebab-id}.yml or docs/requirements/{kebab-id}.md
  - Example: specs/requirements/reschedule-api.yml
- Components: components/{kebab-id}.md
  - Example: components/scheduling-service.md
- Tests: tests/<domain>/{kebab-id}.e2e.test.ts
  - Example: tests/scheduling/reschedule-event.e2e.test.ts
- Test Reviews: docs/test-reviews/{kebab-id}.md

### Tagging and Relationship Keys
- Use explicit keys in YAML and manifest files: persona_id, journey_id, use_case_id, scenario_path, requirement_id, component_id
- Do not use generic keys like "feature", "story", or "ticket" in trace YAML

## Examples (Concrete)
- Journey file: product/journeys/daily-planning.md
  - Frontmatter/heading: # Journey: daily-planning
  - Link to use case: Use Case: specs/use-cases/daily-reschedule.yml

- Use Case YAML (specs/use-cases/daily-reschedule.yml):
  ```yaml
  id: daily-reschedule
  title: Daily reschedule
  persona_id: project-manager
  scenario_paths:
    - specs/scheduling/reschedule-event.feature
  preconditions:
    - user_authenticated: true
  ```

- Scenario file path: specs/scheduling/reschedule-event.feature
  - Scenario name: "User reschedules an event"

- Requirement file: specs/requirements/reschedule-api.yml
  - Contains requirement_id: reschedule-api
  - Maps to scenario: specs/scheduling/reschedule-event.feature

## Migration and Enforcement
- When editing existing artifacts, update IDs and references to follow kebab-case and approved terms.
- Linting: the repo's lint/check step enforces many style rules. Use `npm run check` locally. If check fails, fix naming to match patterns.
- Backwards compatibility: historical filenames (product/actors.md) may remain, but in-document terminology must use Persona instead of Actor.

## Quick Reference Cheat Sheet
- Use Persona, Journey, Use Case, Scenario, Requirement, Component, E2E Test, Test Review
- Avoid Story, Epic, Ticket, Feature (ambiguous), Actor (in prose: use Persona)
- IDs: kebab-case only
- Scenario files: one scenario per file, stored under specs/

---

Policy authored from Phase 2 evidence: .sisyphus/evidence/phase2/task-5-naming.md and .sisyphus/evidence/phase2/task-5-ambiguous.md and concept model docs.
