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
