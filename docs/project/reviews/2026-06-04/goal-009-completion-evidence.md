# Goal 009 Completion Evidence

Date: 2026-06-04

Branch: `codex/goal-009-test-governance-completion`

Goal: `goals/009-scenario-lifecycle-and-test-governance.md`

## User Perspective

A maintainer or agent reviewing test proof can now answer three questions from
source-controlled state and explicit command output:

- Which tests are linked, unlinked, orphaned, stubbed, reviewed, stale, missing
  review, or strict-gate blocking?
- Which human review decisions affect gates, and are those decisions
  source-controlled rather than hidden in ignored local cache?
- Can governance be adopted locally first and enforced in CI only when strict
  mode is explicitly enabled?

## Software Engineering Perspective

The implementation keeps the governance surface explicit:

- `src/lib/test-governance.ts` classifies tests and computes strict-mode
  findings from feature links, stub assertions, and `specs/test-reviews.yml`.
- `src/commands/test.ts` exposes `scan`, `review`, `status`, `clear`, and `gate`
  subcommands.
- `src/commands/gate.ts` keeps top-level `udd gate test-governance` advisory by
  default and failing only with `--strict`.
- `docs/testing/troubleshooting-stubs.md` documents CI opt-in without enabling
  repository-wide strict gates.

## Scope Completed

- Added a canonical scenario and E2E proof for clearing source-controlled test
  review evidence.
- Added `udd test clear <path>` so review evidence can be recorded, listed, and
  cleared through CLI commands.
- Preserved source-controlled review authority in `specs/test-reviews.yml`; the
  ignored local cache remains non-authoritative.
- Verified current repository governance debt remains visible instead of being
  relabeled as success.
- Fixed the trace-graph unit-test fixture so generated `@feature` markers do not
  cause the unit test itself to be misclassified as orphaned proof.
- Added CI opt-in documentation for `udd gate test-governance --strict` without
  enabling strict mode by default.

## Current Command Evidence

### Test Scan

Command:

```bash
./bin/udd test-scan --json | jq '{summary:.summary, trace_graph: [.tests[] | select(.path=="tests/lib/trace-graph.test.ts")][0]}'
```

Observed summary:

```json
{
  "summary": {
    "total": 60,
    "linked": 46,
    "unlinked": 14,
    "orphaned": 0,
    "stubbed": 10,
    "reviewed": 0,
    "stale": 0,
    "missing": 6,
    "gate_blocking": 24
  },
  "trace_graph": {
    "path": "tests/lib/trace-graph.test.ts",
    "stubAssertions": [],
    "status": "unlinked",
    "proof_state": "unlinked",
    "gate_blocking": true
  }
}
```

### Gate Behavior

Commands:

```bash
./bin/udd gate test-governance --json
./bin/udd gate test-governance --strict --json
```

Observed behavior:

- Non-strict gate exited 0 while reporting `passed: false` and 24 blocking
  findings.
- Strict gate exited 1 on the same current findings.
- Human strict gate output lists both stubbed and unlinked blocker classes, so
  users do not need JSON output to see all current blocking findings.
- Fixture tests prove strict mode passes when the project has reviewed linked
  non-stub proof.

### Status And Lint

Commands:

```bash
./bin/udd status --json | jq '{health:.health.summary, trace:.trace.diagnostics_by_type, test_governance:.test_governance.summary}'
./bin/udd lint
```

Observed status summary:

```json
{
  "health": {
    "critical": 0,
    "warning": 0,
    "info": 48,
    "total": 48
  },
  "trace": {
    "missing_test": 6,
    "duplicate_scenario": 8,
    "orphan_test": 14
  },
  "test_governance": {
    "total": 60,
    "linked": 46,
    "unlinked": 14,
    "orphaned": 0,
    "stubbed": 10,
    "reviewed": 0,
    "stale": 0,
    "missing": 6,
    "gate_blocking": 24
  }
}
```

`udd lint` reported:

```text
All specs are valid
Trace graph: 210 node(s), 227 edge(s), 28 diagnostic(s)
```

### Focused Validation

Commands:

```bash
npx biome check src/lib/test-governance.ts src/commands/test.ts tests/e2e/udd/test-governance/test-review.e2e.test.ts tests/lib/trace-graph.test.ts
node_modules/.bin/tsc --noEmit
npm test -- --run tests/e2e/udd/test-governance/test-review.e2e.test.ts tests/e2e/udd/test-governance/local-gate-validation.e2e.test.ts tests/e2e/udd/test-governance/test-scan.e2e.test.ts tests/e2e/udd/test-governance/test-status.e2e.test.ts tests/e2e/udd/test-governance/quality-gate.e2e.test.ts tests/e2e/udd/test-governance/regression-detection.e2e.test.ts tests/lib/test-governance.test.ts tests/lib/trace-graph.test.ts
```

Observed results:

- Biome passed.
- TypeScript passed.
- Focused tests passed: 8 files, 49 tests.

## Checklist Mapping

| Goal 009 task | Evidence |
| --- | --- |
| Update use cases, scenarios, and E2E first | Governance use cases and feature files under `specs/use-cases/*test*` and `specs/features/udd/test-governance/*`; new clear-review scenario and E2E added before CLI completion. |
| Define lifecycle states | `TestScanEntry.proof_state` covers `linked`, `unlinked`, `stubbed`, `orphaned`, `reviewed`, `stale`, and `missing_review`; status already handles deferred scenario state. |
| Inventory scanning | `udd test-scan --json` reports 60 test entries with source references. |
| Detect unlinked/orphaned/stubbed tests | Current scan reports 14 unlinked, 0 orphaned, 10 stubbed, and 24 strict blockers. |
| Source-controlled review evidence | `udd test review` and `udd test clear` write `specs/test-reviews.yml`; ignored local cache does not affect gates. |
| Strict and non-strict gates | Non-strict exits 0 with findings; strict exits 1 on current findings, human output lists each blocker class, and strict passes in the clean fixture. |
| Status integration | `udd status --json` includes `test_governance.summary`. |
| Deferred treatment | Existing status and phase tests keep future-phase work separate from current blockers. |
| Agent reporting docs | `docs/testing/troubleshooting-stubs.md` documents current governance output, strict blockers, CI opt-in, and future scope. |

## Reviewer Blocking Criteria Check

- Ignored local cache cannot change status or gate outcomes: covered by
  `local-gate-validation.e2e.test.ts`.
- Authoritative review decisions are source-controlled: covered by
  `test-review.e2e.test.ts` and `specs/test-reviews.yml` writes.
- Stub detection does not silently bless tests: current scan and strict gate
  expose 10 stubbed tests.
- Strict and non-strict behavior are distinct: current command evidence and
  `quality-gate.e2e.test.ts`.
- Lifecycle labels do not mask failing tests: strict gate still reports current
  blocking debt instead of passing the repository.

## Residual Debt

The repository still has real governance debt: 14 unlinked tests, 10 stubbed
tests, 6 missing review/proof entries, and 24 strict-mode blockers. Goal 009
does not hide that debt; it makes it visible and enforceable when strict mode is
requested. Follow-on goals should reduce those findings with focused proof
improvements rather than weakening the gate.
