# Reconstruct T5: docs/architecture/glossary-naming-policy.md (@Sisyphus-Junior subagent)

**ID**: ses_36a3889b3ffeQZyavJTGkx360n
**Project ID**: ad761ea6174e58ed763fc75290c3f403ed51079d
**Created**: 2/25/2026, 11:10:03 AM
**Stats**: 3 files changed, +413 -0

---

## USER (11:10:03 AM)

# Canonical Derivation Model

This document defines the canonical derivation chain used across UDD: how high-level product intent is turned into testable artifacts and, ultimately, implementation requirements. It codifies the required hop sequence used by trace queries in specs/traceability-contract.yml.

## Derivation Chain

Persona → Journey → Use Case → Scenario → E2E Test → Component → Requirement

Each arrow is a required hop. Tools and validation rules rely on these fields and ids to build forward and reverse trace graphs.

## Layer Definitions

- Persona
  - Role: Human archetype and source of user goals and context.
  - Location: product/actors.md (or journey frontmatter)
  - Key fields: id, name, description, goals
  - Must not contain implementation details.

- Journey
  - Role: Experience narrative that maps a Persona to one or more Use Cases.
  - Location: product/journeys/*.md
  - Key fields: id, actor (persona.id), goal, steps (list of use_case ids)
  - Steps must reference Use Case ids, not scenario files.

- Use Case
  - Role: Connects Journey intent to executable scenarios. Declares outcomes and referenced scenarios.
  - Location: specs/use-cases/*.yml
  - Key fields: id, name, actors, outcomes (with scenarios[])
  - Must not duplicate Gherkin scenario text.

- Scenario
  - Role: Single source of acceptance, expressed in Gherkin (.feature).
  - Location: specs/features/**/*.feature
  - Key fields: id (slug), title, feature_path
  - Drives E2E tests.

- E2E Test
  - Role: Test harness mapping that implements Scenario steps and verifies behavior.
  - Location: tests/e2e/**/*.e2e.test.ts
  - Key fields: id, scenario_path, status
  - Must reference scenario by id or feature_path.

- Component
  - Role: Implementation unit(s) responsible for delivering Use Cases and Requirements.
  - Location: specs/components/*.md or .yml
  - Key fields: id, name, responsibilities, public_interfaces, supported_use_cases, supported_scenarios
  - Components map to Requirements and E2E tests for impact analysis.

- Requirement
  - Role: Developer-facing contract that specifies acceptance criteria, implementation notes, and links to scenarios and components.
  - Location: specs/requirements/*.yml
  - Key fields: id, type, feature, description, scenarios, components

## How Validation Uses the Chain

The traceability contract (specs/traceability-contract.yml) defines forward and reverse queries that assume the canonical hop sequence. Validation rules mark missing fields as ERROR or WARN when a hop is broken. Tools must not accept direct references that skip layers unless a documented, approved exception exists.

## Worked Example (Happy Path)

Example: Team Member captures a task via CLI.

1) Persona

   - product/actors.md
   - id: "team-member"

2) Journey

   - product/journeys/daily-capture.md
   - id: "daily-capture-workflow"
   - actor: "team-member"
   - steps: ["capture_task"]

3) Use Case

   - specs/use-cases/capture_task.yml
   - id: "capture_task"
   - outcomes.scenarios: ["udd/cli/inbox/add_item_via_cli"]

4) Scenario

   - specs/features/udd/cli/inbox/add_item_via_cli.feature
   - id: "udd/cli/inbox/add_item_via_cli"

5) E2E Test

   - tests/e2e/udd/cli/inbox/add_item_via_cli.e2e.test.ts
   - scenario_path points to feature file

6) Component

   - specs/components/cli-command-service.md
   - id: "cli-command-service"
   - supported_scenarios: ["udd/cli/inbox/add_item_via_cli"]

7) Requirement

   - specs/requirements/persist_item_with_defaults.yml
   - id: "persist_item_with_defaults"
   - scenarios: ["udd/cli/inbox/add_item_via_cli"]
   - components: ["cli-command-service", "item-repository"]

This chain is also recorded as evidence in .sisyphus/evidence/phase2/task-4-chain.md. Each link is validated by the trace queries in specs/traceability-contract.yml.

## Anti-Example (Skipped Layer)

Invalid pattern: Journey directly references a Scenario path, skipping Use Case.

Example (invalid):

product/journeys/direct-capture.md

```yaml
id: "direct-capture-workflow"
actor: "team-member"
steps:
  - "specs/features/udd/cli/inbox/add_item_via_cli.feature"  # INVALID: direct scenario reference
```

Why this is rejected:

- The forward trace query journey_to_use_cases expects use_case ids in journey.steps. A direct scenario path returns no use_case, causing the trace to fail.
- Skipping Use Case removes the mapping between narrative intent and scenario scopes, creating semantic ambiguity when a scenario serves multiple use cases.
- Validation rules in specs/traceability-contract.yml flag this as ERROR: journey.steps missing use_case id.

Alternative: update journey.steps to include the use_case id (e.g., "capture_task") and ensure the Use Case lists the scenario.

Another invalid skip: E2E Test → Requirement (Component skipped). Every test must map to a Component before linking to Requirements to preserve ownership and impact analysis.

## Exception Policy

Only documented exceptions are allowed and must be approved and recorded in the evidence directory. Automatic validation rejects skips as described above. See .sisyphus/evidence/phase2/task-4-skipped-layer.md for the anti-example evidence and corrective actions.

## Traceability Queries

Use the trace queries in specs/traceability-contract.yml. Common queries:

- persona_to_journeys: find journeys where journey.actor = <persona.id>
- journey_to_use_cases: map journey.steps -> use_case.id
- use_case_to_scenarios: read use_case.outcomes[].scenarios
- scenario_to_tests: find e2e_test where scenario_path contains scenario.id
- requirement_impact: find e2e_tests and personas impacted by a requirement via scenario links

For automated checks, tools should call these trace queries and treat missing hops per invalidation_rules in the contract.

## References

- docs/architecture/udd-concept-model.md
- specs/traceability-contract.yml
- .sisyphus/evidence/phase2/task-4-chain.md
- .sisyphus/evidence/phase2/task-4-skipped-layer.md


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


# Journey Narrative Model

## Overview

Journey narratives describe the user's experience as a timeline of observable events and outcomes. They belong to the experience layer and must not include implementation or capability internals (APIs, method names, infra, feature flags, storage details, service calls, etc.). Journeys are human-facing artifacts used by product, design, QA, and writers to define what users feel and do, not how the system achieves it.

This document defines the canonical schema for journey narratives, gives field definitions, provides a full example with an emotional trajectory, and describes capability-leak detection rules authors and lint tooling should apply.

## Schema

A Journey Narrative is a single markdown document with these required top-level fields and sections:

Required fields
- id: string (unique slug, e.g., `onboarding-quick-start`)
- title: string (human-friendly title)
- actor: string (who the journey is about)
- goal: string (what success looks like for the actor)
- stages: ordered array of Stage objects
- touchpoints: array of Touchpoint objects (derived from stages, optional if described inline)
- channels: array of channels involved (e.g., web, mobile, email)
- emotions: array describing predominant emotions per stage (see Stage.emotions)
- pain_points: array of known pain points (mapped to stages)
- success_metrics: array of measurable outcome metrics
- references: array of related use_case ids or docs (implementation artifacts only via reference)

Stage object
- name: string (stage label, ordered)
- description: string (what the user is doing/experiencing)
- touchpoints: array of touchpoint ids or descriptions
- channels: subset of journey channels active in this stage
- emotions: ordered list showing emotional trajectory within the stage (e.g., ["curious", "cautious", "delighted"]). Each emotion may include intensity (low|medium|high) optionally.
- success_criteria: optional short statement of what success looks like for the stage

Touchpoint object
- id: string (local id)
- label: string (short label like "signup form" or "welcome email")
- description: string (what the user sees or does)
- observable_outcome: string (user-observable signal, e.g., "confirmation email received")

Success Metric object
- id: string (metric id or analytics id)
- name: string (human name)
- description: string (what it measures, must be outcome-focused)
- target: optional numeric or relative target (e.g., ">50% within 5 minutes")

## Field Definitions and Rules

- stages: Ordered timeline. Each stage must describe user-observable behavior and outcomes. Keep stage names short and outcome oriented (Discover, Evaluate, Decide, Use, Recover).
- touchpoints: Concrete moments where the user interacts with the product or receives a communication. Touchpoints should be phrased in user language ("user sees pricing page") not implementer language ("server renders /pricing route").
- channels: Channels are modes of delivery. Use canonical names: web, mobile_app, email, sms, phone_support, in_product_tooltip.
- emotions: Capture how the user feels. Emotions are adjectives or short phrases. You may provide intensity and a one-sentence rationale for each.
- pain_points: Specific user problems encountered, mapped to stages when possible. Avoid including root-cause system internals; state observable symptom and user impact.
- success_metrics: Outcome focused, tied to stages where relevant. Metrics must reference analytics ids or business metrics, not implementation counters.
- references: If an implementation detail is required, reference a Use Case or Component doc by id. Do not embed code or API details in the journey body.

Policy: No capability internals

Journey narratives MUST NOT contain:
- API paths, HTTP methods, SDK calls, code snippets, or service/method names (e.g., `POST /api/users`, `userService.createUser()`).
- Infra, storage, logs, or vendor names that reveal implementation (e.g., "store in S3", "CloudWatch").
- Feature flag names, rollout stages, or experiment ids (e.g., "enable myfeature_v2").

If a narrative needs implementation context, add a reference to a Use Case, Component, or Architecture doc. Keep the journey focused on what the user does and feels.

## Full Example: onboarding-quick-start

id: onboarding-quick-start
title: New user quick start
actor: New user
goal: Sign up and create their first task within 5 minutes
channels: [web, email]

stages:
- name: Discover
  description: User finds the product via search or referral and views the landing page.
  touchpoints: [landing_page]
  channels: [web]
  emotions: [{emotion: "curious", intensity: "medium"}]
  success_criteria: "User is interested enough to click Sign up"

- name: Sign up
  description: User completes an email sign up form and confirms account via email.
  touchpoints: [signup_form, confirmation_email]
  channels: [web, email]
  emotions: [{emotion: "cautious", intensity: "medium"}, {emotion: "relieved", intensity: "low"}]
  success_criteria: "Account created and confirmed"

- name: First task
  description: User creates their first task via the in-product flow and sees it listed in their dashboard.
  touchpoints: [create_task_modal, dashboard_list]
  channels: [web]
  emotions: [{emotion: "delighted", intensity: "high"}]
  success_criteria: "First task visible on dashboard"

touchpoints:
- id: landing_page
  label: Landing page
  description: "User views the product landing page with value proposition and call-to-action"
  observable_outcome: "Clicks Sign up"

- id: signup_form
  label: Signup form
  description: "User fills email and password and submits"
  observable_outcome: "Form submitted"

- id: confirmation_email
  label: Confirmation email
  description: "User receives an email with confirm link"
  observable_outcome: "Email delivered and link clicked"

- id: create_task_modal
  label: Create task modal
  description: "User enters task details and saves"
  observable_outcome: "Task appears on dashboard"

pain_points:
- stage: Sign up
  problem: "Email delivery delays cause confusion"
  impact: "Users abandon before confirming"

success_metrics:
- id: analytics.signup_confirm_rate
  name: Signup confirm rate
  description: Percentage of signups that confirm within 1 hour
  target: ">= 70%"

- id: analytics.first_task_time
  name: Time to first task
  description: Median time from account creation to first task
  target: "<= 5 minutes"

Emotional trajectory

Across stages the user's emotional curve is: curious (landing) -> cautious (signup) -> relieved (confirmation) -> delighted (first task). This trajectory helps prioritize pain_points and success_metrics: high-intensity delight at First task indicates the biggest opportunity to convert new users into active users.

## Capability-leak detection rules

Linting and human review should apply these detection rules. If any rule triggers, the narrative should be returned to the author for revision.

1) Code-like tokens
- Regex: any token matching /\b([a-zA-Z_][a-zA-Z0-9_]*\.[a-zA-Z_][a-zA-Z0-9_]*\(|POST\s+\/)\b/ — catches method calls and obvious HTTP mentions.

2) Infra/vendor identifiers
- Regex: /\b(S3|CloudWatch|BigQuery|RDS|DynamoDB|SQS|Kafka|GCS)\b/i

3) Feature-flag or experiment ids
- Regex: /\b(myfeature_[0-9a-zA-Z_-]+|experiment_[0-9]+|flag_[0-9a-zA-Z_-]+)\b/i

4) Storage/persistence verbs with resource hints
- Regex: /\b(store to|persist to|write to|save to)\b/i

5) Hard rule: If any field contains a match from rules 1-4, the narrative fails validation.

Remediation guidance
- Replace matched text with user-observable phrasing. Example: change "POST /api/users" to "User submits the sign up form".
- Move implementation details to a Use Case or Component doc and add an entry to references: [use_case:create-account]

## References
- docs/architecture/udd-concept-model.md
- .sisyphus/evidence/phase2/task-6-journey-narrative.md
- .sisyphus/evidence/phase2/task-6-leak.md


