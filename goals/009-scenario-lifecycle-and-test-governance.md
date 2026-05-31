# Goal 009: Scenario Lifecycle and Test Governance

## Agent Entry

Convert stale, missing, reviewed, and deferred scenario states into explicit
lifecycle behavior that developers and agents can trust before enabling stricter
quality gates.

## Timebox and Team Shape

- Target duration: 2 engineering weeks.
- Suggested team: 4-6 engineers across test infrastructure, CLI, docs, status,
  and migration.
- Primary users: maintainers reviewing behavior changes and agents deciding
  whether tests are trustworthy.

## Objective

Make UDD able to classify scenario and test lifecycle state accurately, record
human review decisions without committing generated local state, and enforce
gates only when explicitly requested.

## Scope

- Scenario lifecycle states: missing, stale, deferred, unreviewed, reviewed,
  failing, passing, and orphaned.
- Test inventory scanning for linked, unlinked, orphaned, stubbed, and generated
  tests.
- Source-controlled review evidence for any decision that affects status or
  gates. Local ignored cache state, if retained, must be non-authoritative and
  regenerable.
- Strict and non-strict gate modes.

## Non-Goals

- CI enforcement by default.
- Replacing Vitest.
- Full approval workflow UI.
- Hiding existing test debt by relabeling failures as success.

## Measurables

- `udd test-scan --json` reports linked, unlinked, orphaned, and stubbed tests.
- `udd gate test-governance` reports findings without failing by default.
- `udd gate test-governance --strict` fails on configured blocking findings.
- Reviewed-test decisions that affect gates are recorded as source-controlled
  human-authored evidence; ignored local cache state cannot change gate results.
- Status output separates deferred and stale work from current blocking debt.

## Tasks

- [ ] Update use cases, feature scenarios, and failing E2E tests for lifecycle
      and governance behavior before implementation.
- [ ] Define lifecycle states and allowed state transitions.
- [ ] Implement test inventory scanning across `tests/e2e`.
- [ ] Detect feature imports that do not link to known scenario IDs.
- [ ] Detect stubbed tests using explicit heuristics and reviewer-visible
      evidence.
- [ ] Add source-controlled review evidence files or annotations for decisions
      that affect gates.
- [ ] Keep any local review cache non-authoritative, ignored, and regenerable.
- [ ] Add commands for recording, listing, and clearing review evidence.
- [ ] Implement non-strict governance gate reporting.
- [ ] Implement strict governance gate failure behavior.
- [ ] Integrate lifecycle state into `udd status`.
- [ ] Add phase-aware treatment for intentionally deferred scenarios.
- [ ] Add tests for clean, dirty, stubbed, orphaned, and deferred fixtures.
- [ ] Document how agents should report unresolved test governance debt.
- [ ] Add CI opt-in documentation without enabling repository-wide strict gates.

## Definition of Done

- A reviewer can tell whether a test is linked to a scenario, whether it is
  meaningful, and whether it has been reviewed.
- Any review decision that changes status or gate behavior is visible in
  source-controlled evidence.
- Governance gates are useful locally without breaking all existing workflows.
- Strict mode gives maintainers a credible future CI gate.

## Verification Commands

```bash
./bin/udd test-scan --json
./bin/udd gate test-governance
./bin/udd gate test-governance --strict
./bin/udd status
npm test -- --run
```

## Reviewer Blocking Criteria

- Blocks if ignored local review cache changes status or gate outcomes.
- Blocks if authoritative review decisions are not source-controlled.
- Blocks if stub detection silently blesses tests without evidence.
- Blocks if strict and non-strict gate behavior are ambiguous.
- Blocks if lifecycle labels mask actual failing tests.
