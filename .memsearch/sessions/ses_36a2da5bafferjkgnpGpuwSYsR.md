# Create T12 e2e-journey-composition.md (@Sisyphus-Junior subagent)

**ID**: ses_36a2da5bafferjkgnpGpuwSYsR
**Project ID**: ad761ea6174e58ed763fc75290c3f403ed51079d
**Created**: 2/25/2026, 11:21:56 AM
**Stats**: 3 files changed, +343 -0

---

## USER (11:21:57 AM)

# Change Propagation Workflow

This document defines how we detect stale artifacts, propagate changes, and close the loop so artifacts stay consistent with product intent.

## State Machine

Canonical flow:

verified -> stale -> updated -> reviewed -> verified

Notes:
- "verified": artifact matches current requirements and tests. Considered authoritative.
- "stale": artifact likely affected by a change elsewhere. Needs investigation.
- "updated": author has applied the change to the artifact (draft or PR). Not yet reviewed.
- "reviewed": reviewer validated the update addresses the stale reason and did not introduce regressions.
- Transition back to "verified" completes propagation.

State diagram (text):
- verified
  - on detection of relevant upstream change -> stale
- stale
  - on author update -> updated
  - on false positive -> verified
- updated
  - on reviewer approval -> reviewed
  - on reviewer request changes -> stale
- reviewed
  - on final sign-off -> verified

## Stale Detection

Detection sources:
- Automated traceability checks (trace links changed, spec diffs)
- Test failures or regressions linked to artifact
- Manual report from reviewer, stakeholder, or AI assistant

Detection signals and thresholds:
- Trace link mismatch: spec id referenced by artifact changed or moved
- Spec version increase: spec/version bump touches area the artifact consumes
- Test coverage gap: new failing test maps to artifact

On detection: mark artifact as "stale" and record stale reason and source. If detection cannot determine a reason, record "no_reason_provided" and queue for human triage.

## AI Top-3 Example Propagation (end-to-end)

Example 1: Requirement tweak -> documentation update

1. Change: Product requirement updated to require CSV export include timestamps (specs/exports.feature updated).
2. Detection: traceability job finds specs/exports.feature changed and links to docs/usage/export.md. Artifact marked stale with reason requirement_updated.
3. Propagation: AI assistant creates a proposed update draft in docs/usage/export.md adding timestamp note and example. State -> updated.
4. Review: Maintainer inspects PR, requests minor wording fixes. State -> stale (update needed) while author addresses comments.
5. Author applies fixes, reviewer approves. State -> reviewed -> verified when merged and CI passes.

Example 2: API response shape change -> tests + client SDK

1. Change: API adds new optional field `discount_applied` in /orders response (specs/api/orders.yml changed).
2. Detection: CI tests start failing in client SDK package, traceability finds link between specs/api/orders.yml and packages/sdk/src/types.ts. Artifact marked stale with reason scenario_content_changed.
3. Propagation: Developer updates SDK types and a unit test to accept optional field. State -> updated.
4. Review: PR reviewed, reviewers run integration tests, approve. State -> reviewed -> verified.

Example 3: Use-case extension -> e2e scenario

1. Change: New use case: guest checkout with promo codes (journeys/checkout_guest.md added).
2. Detection: Sync job flags that e2e tests covering checkout do not exercise guest+promo. Tests missing; e2e test spec marked stale with reason use_case_extended.
3. Propagation: AI generates scaffold test that covers guest checkout + promo, developer fills in credentials and run locally. State -> updated.
4. Review: QA runs test in CI, passes. Approved -> reviewed -> verified.

## Stale Reason Taxonomy

- scenario_content_changed: Concrete content changed in a linked scenario or example (examples, request/response payloads changed).
- requirement_updated: Product requirement changed (acceptance criteria changed, performance SLAs changed).
- use_case_extended: A new user flow or variation was added that the artifact doesn't cover.
- spec_renamed_or_moved: Canonical spec file was renamed, moved, or re-keyed breaking trace links.
- test_failure: Test or CI signal indicates regression tied to artifact.
- dependency_changed: A library or infra dependency upgrade requires artifact updates (API surface changed).
- no_reason_provided: Detection flagged artifact but could not determine a clear reason; requires human triage.

Each stale record should include: reason (one of above), detected_by (automation | ai | human), detection_time, and evidence link(s).

## Invalid Transitions

Explicitly forbidden or invalid transitions to maintain discipline:
- verified -> updated (direct update without entering stale). All changes must be justified by a stale reason before updates, except for hotfixes documented separately.
- updated -> verified (skip review). Updated artifacts must be reviewed before being considered verified.
- reviewed -> stale (unless new upstream change occurs). You may only move back to stale if a new detection event occurs.
- verified -> reviewed (can't review without an update). Review is for changes, not for verified artifacts.

Rules and enforcement:
- Any attempt to create an "updated" change must reference a stale record id. If none exists, the change must include a justification and trigger a triage to create a stale record.
- Review must include explicit checkboxes: addresses_reason, no_regression, tests_updated_if_needed.

## Work Items and Metadata

Each propagation record should carry minimal metadata:
- id
- artifact_path
- current_state
- stale_reason
- detected_by
- detection_time
- assigned_to
- related_spec_refs
- evidence_links

## Edge Cases

- False positives: if investigation concludes no change required, transition stale -> verified with a resolution note.
- Large cascading changes: when a spec change touches many artifacts, use batched propagation with a parent propagation id and per-artifact subtasks.
- Emergency hotfixes: allow verified -> updated with `hotfix=true` flag and mandatory post-hoc stale reason entry.

## References

- specs/traceability-contract.yml
- .sisyphus/evidence/phase2/task-13-propagation.md (evidence)
- .sisyphus/evidence/phase2/task-13-no-reason.md (evidence of no reason case)


# E2E Journey Composition

This document defines how to compose journey-level end-to-end (E2E) tests from capability scenarios and lightweight orchestration glue. Journey E2E tests verify that a user can complete an outcome that spans multiple capabilities while keeping step definitions DRY and maintainable.

## Composition pattern

Journey E2E = capability scenario steps + journey orchestration glue

- Capability scenario steps: reuse existing step definitions that implement the domain actions (happy path and relevant variations). These live next to feature files in specs/ and tests/ implementations.
- Journey orchestration glue: small, journey-specific steps that arrange capabilities in sequence, pass context between steps, and assert end-to-end success criteria.

Keep orchestration glue minimal. If orchestration steps grow beyond coordinating calls and mapping context, extract a new capability scenario instead.

## Reuse vs new step definitions

When composing a journey, decide for each required behavior whether to reuse an existing step definition or create a new one.

- Reuse existing step definitions when:
  - The step expresses a single capability or domain action already covered by a capability feature.
  - The step maps directly to an implementation-backed helper (API client, page object, test utility).
  - The step is stable across journeys and has no journey-specific side effects.

- Create new journey step definitions when:
  - The step is orchestration only: it sequences capabilities, maps data between them, or asserts cross-capability success criteria.
  - It would otherwise duplicate condition handling that is unique to this journey.
  - It is a short adapter that composes multiple capability steps into one readable Gherkin line.

Rule of thumb: prefer reuse for capability behavior, prefer new small glue steps for orchestration.

## Worked example

Journey: "New user completes onboarding and creates first item"

Specs referenced:
- specs/auth/signup.feature  (capability: signup)
- specs/tasks/create.feature (capability: create task)

Journey feature (high level):

"""
# Journey: New user onboarding

Scenario: Onboard and create first task
  Given a fresh browser session
  When the user signs up with valid email and password
  And the user completes onboarding prompts
  And the user creates a new task titled "Buy milk"
  Then the task list contains "Buy milk"
"""

Implementation notes:
- Reuse the step implementations from the signup and create task capabilities: Given/When/Then from their respective feature step files.
- Add a small orchestration step `And the user completes onboarding prompts` that sequences a few capability-level steps or UI interactions, but does not reimplement signup or task creation logic.

## Journey orchestration example (pseudo-code)

// orchestration step implementation
function completeOnboardingPrompts(context) {
  // reuse page objects and helpers
  await onboardingPage.skipOptionalTours();
  await onboardingPage.setPreferences({ theme: 'light' });
  // stash values on context for downstream steps
  context.userPreferences = { theme: 'light' };
}

The orchestration glue should call into the same helpers used by capability tests so behavior remains consistent.

## Anti-duplication rules

1. Do not copy-paste capability step implementations into a journey. Always point to existing step definitions when the intent matches.
2. Do not create journey steps that duplicate domain logic. If a journey step requires substantial domain logic, move that logic into a capability step and reuse it in both the capability feature and the journey.
3. Keep journey step definitions thin. If a journey step becomes more than a few lines of orchestration logic, split responsibilities: extract domain logic to capability helpers, keep orchestration to sequencing and context mapping.
4. Name journey steps for readability, not reusability. Use plain, descriptive Gherkin lines that read like the user journey.
5. Tests must avoid duplicating assertions already covered by capability scenarios. Journey tests assert the cross-capability outcome and any end-to-end invariants only.

## When to create a new capability instead

- If two or more journeys need the same orchestration behavior, promote that orchestration into a capability feature with explicit scenarios and reusable steps.
- If orchestration contains branching business logic (many conditional branches), it likely belongs in a capability test with focused scenarios.

## References

- docs/architecture/canonical-derivation-model.md
- .sisyphus/evidence/phase2/task-12-compose.md
- .sisyphus/evidence/phase2/task-12-dup-assert.md

---

Notes
- Keep journey features focused on user outcomes. Use capability features for detailed behavior and edge cases.
- Update step registries or step index documentation if you add reusable capability steps so they are discoverable by other authors.


# Requirement Attachment Policy

## Purpose

This document defines how requirements are treated as first-class artifacts and how they attach to other repository artifacts. It prescribes an attachment matrix, required fields, evidence hooks, and a propagation example so teams can trace intent to implementation and verification.

## Requirement as First-Class Concept

- Definition: A requirement is a named, versioned artifact that describes a user need or system constraint, its success criteria, and acceptance evidence. Requirements live in the product/journeys or specs folders and are referenced by id (eg. RQ-1234).
- Ownership: Every requirement has an owner (actor or role) and a primary author.
- Versioning: Requirements must carry a revision id and date. If the requirement changes, create a new revision and link to prior revisions.
- Status: Draft, Proposed, Approved, Deprecated.

Treating requirements as first-class means:
- They are addressable by id in commit messages, PRs, and tests.
- They can be attached, detached, and propagated across artifacts using explicit metadata fields.

## Attachment Matrix

Requirements may attach at four levels. Use the matrix below to choose the correct attachment granularity.

| Requirement Type | Attached To | When to attach | Evidence Hook (field) |
|---|---:|---|---|
| journey-level (outcome) | product/journeys/*.md | When requirement describes an overall user outcome spanning features | journey.requirements[] -> refs to RQ ids |
| use-case (feature) | specs/<domain>/*.feature or product/journeys/* (step) | When requirement maps to a feature or detectable user flow | use_case.requirements[] or feature.requirements[] |
| scenario (behavior) | specs/<domain>/*.feature (scenario) | When requirement constrains a specific scenario or acceptance criterion | scenario.tags / scenario.requirements[] |
| component (implementation) | src/, packages/, or infra component | When requirement maps to a concrete component or NFR (perf, security) | component.metadata.requirements[] (eg package.json.requirements) |

Notes:
- Prefer the most specific attachment that still captures the requirement intent. A requirement attached to a scenario implies the enclosing use-case and journey may be affected, but explicit attachments are preferred for traceability.
- Multiple attachments are allowed. Use explicit evidence hooks (below) to avoid orphaned references.

## Required Fields for a Requirement

Each requirement artifact must include these fields in frontmatter or structured metadata when possible:

- id: string (RQ-YYYY-NNN)
- title: short descriptive title
- description: concise statement of need and rationale
- actor: who benefits (user, admin, system)
- priority: low | medium | high | critical
- type: functional | non-functional | regulatory | UX
- acceptance_criteria: list of statements, ideally Gherkin or measurable assertions
- evidence_hooks: list of locations or fields where verification evidence will appear
- owner: person or role
- status: Draft | Proposed | Approved | Deprecated
- revision: semver-like or date-based string

Example frontmatter (YAML):

---
id: RQ-2026-001
title: Export results as CSV
description: Analysts need a CSV export of search results so they can perform offline analysis.
actor: Analyst
priority: high
type: functional
acceptance_criteria:
  - Given a dataset, when user requests export, then a CSV file downloads containing the current result set
evidence_hooks:
  - specs/search/export.feature:Scenario:Export as CSV -> scenario.requirements
  - tests/search/export.e2e.test.ts -> test.meta.requirements
owner: product:analytics
status: Approved
revision: 2026-02-25
---

## Evidence Hooks

Evidence hooks are canonical places where proof that a requirement is met should appear. They are small metadata pointers stored near the artifact.

Common evidence hooks:

- outcome.scenarios: In journey markdown, list the scenario ids that realize the outcome.
- feature.requirements[] / scenario.requirements[]: In .feature files, add tags or a requirements array linking RQ ids.
- test.meta.requirements: In tests, add structured metadata linking to RQ ids (eg. test.meta = { requirements: ['RQ-...'] }).
- component.metadata.requirements: In package.json, component.yaml, or component manifest, include requirements array for NFRs.
- perf_test.results: Perf test outputs must reference the RQ id they validate.
- audit.report.references: Security or compliance reports should list requirement ids they cover.

Guidelines:
- Use the requirement id, not a free-text title, when attaching.
- Prefer structured metadata (frontmatter, JSON fields) rather than comments.
- Keep evidence concise: link to the test/feature, line or scenario name, and any result artifact (screenshot, artifact path, CI job id).

Example test metadata (TypeScript):

// tests/search/export.e2e.test.ts
/*
test.meta = {
  requirements: ['RQ-2026-001']
}
*/

## Propagation Rules and Example

Propagation defines how an attachment at one level implies or requires attachments at other levels.

Rules:

1. Downward propagation is optional, upward propagation is required.
   - If a requirement is attached to a journey, every use-case derived from that journey must declare whether it implements or defers the requirement.
   - If a requirement is attached to a component, tests and scenarios that validate the component must reference the requirement.

2. Explicit confirmation is required for approval.
   - When a requirement moves from Draft to Approved, linked scenarios and tests must include passing evidence references before the requirement is marked Approved in the registry.

Propagation Example:

1. Product owner creates RQ-2026-010: "Search must return results within 300ms for common queries", attaches it to product/journeys/search.md as a journey-level NFR.
2. The specs team reviews and attaches RQ-2026-010 to specs/search/response_time.feature at the scenario level with tag @RQ-2026-010.
3. The implementation team adds component.metadata.requirements: ["RQ-2026-010"] to packages/search-service/package.json and wires a perf test.
4. The perf test job outputs perf_test.results -> artifacts/perf/search-2026-02-25.json which contains { "requirement": "RQ-2026-010", "median": 280 }.
5. CI collects the artifact and records test.meta.requirements for the test run. A verification step posts the artifact path to the requirement registry entry.

This chain gives a verifiable trail from journey -> scenario -> component -> test artifact.

## Handling Orphaned Requirements

An orphaned requirement is an RQ referenced in evidence or code that has no authoritative declaration file. Teams must:

1. Create a requirement artifact in product/journeys or specs referencing the id, or
2. Remove the reference if it is stale, or
3. Mark as "orphan" in the requirement registry and assign an owner to resolve.

Automated tooling should run a periodic check to find referenced RQ ids that lack artifacts and surface them to owners.

## Governance

- Approvals: Product owners and architecture owners sign off on requirement status transitions.
- Audits: Security and compliance teams can claim evidence hooks to validate regulatory requirements.
- Tooling: The repository should provide scripts to collect evidence hooks into a single requirement registry (eg. .udd/requirement-registry.json).

## References

- docs/architecture/udd-concept-model.md
- .sisyphus/evidence/phase2/task-10-attach.md


