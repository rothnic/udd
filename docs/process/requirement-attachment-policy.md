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
