# Goal 015 Test Governance Upgrade Review

Date: 2026-06-03
Branch: `codex/test-governance-upgrade`
Goal: `goals/015-test-governance-upgrade.md`

## User-Perspective Findings

### Test Governance Owner

Promise reviewed: "Show me which tests I can trust, which need review, and
which issues should block a merge."

Current upgrade coverage:

- `udd test-scan --json` now reports linked, unlinked, orphaned, stubbed,
  reviewed, stale, missing, and strict-mode gate-blocking counts.
- Test entries include `proof_state`, `gate_blocking`, and
  `source_references`.
- Feature files without linked tests appear in `missing_proof` so missing proof
  is visible without pretending it is a strict gate failure.
- Source-controlled `specs/test-reviews.yml` remains authoritative for reviewed
  and stale proof. Ignored `.udd/test-reviews.yml` does not control gate
  outcomes.

Command evidence from this branch:

```json
{
  "total": 53,
  "linked": 41,
  "unlinked": 12,
  "orphaned": 0,
  "stubbed": 10,
  "reviewed": 0,
  "stale": 0,
  "missing": 6,
  "gate_blocking": 22
}
```

### Maintainer / Reviewer

`udd status --json` now includes `test_governance.summary` alongside the health
summary, so a reviewer can distinguish project health from governance adoption
debt.

Evidence excerpt:

```json
{
  "health": {
    "status": "healthy",
    "healthy": true,
    "summary": {
      "critical": 0,
      "warning": 0,
      "info": 49,
      "total": 49
    },
    "advisory_count": 49,
    "blocking_count": 0
  },
  "test_governance": {
    "total": 53,
    "linked": 41,
    "unlinked": 12,
    "orphaned": 0,
    "stubbed": 10,
    "reviewed": 0,
    "stale": 0,
    "missing": 6,
    "gate_blocking": 22
  }
}
```

### Agent Operator

`udd opencode evidence --json --goal goals/015-test-governance-upgrade.md`
includes the same governance summary as status. This lets an agent hand off the
governance state without relying on chat history.

Evidence excerpt:

```json
{
  "goal": {
    "path": "goals/015-test-governance-upgrade.md",
    "status": "in_progress"
  },
  "issues": {
    "critical": 0,
    "warning": 0,
    "info": 49,
    "total": 49
  },
  "test_governance": {
    "total": 53,
    "linked": 41,
    "unlinked": 12,
    "orphaned": 0,
    "stubbed": 10,
    "reviewed": 0,
    "stale": 0,
    "missing": 6,
    "gate_blocking": 22
  },
  "blockingFindings": 22,
  "nextAction": "Stub assertions: tests/e2e/opencode/orchestration/configurable_iteration.e2e.test.ts",
  "next": "udd/strategic-program/strategic_program_commands"
}
```

### Strict / Non-Strict Adoption

Non-strict gate mode is adoption-friendly: it reports findings without failing.
Strict mode is CI-ready for configured blocking findings.

Current branch strict-mode evidence:

```json
{
  "exitCode": 1,
  "passed": false,
  "summary": {
    "total": 53,
    "linked": 41,
    "unlinked": 12,
    "orphaned": 0,
    "stubbed": 10,
    "reviewed": 0,
    "stale": 0,
    "missing": 6,
    "gate_blocking": 22
  },
  "blockingFindings": 22
}
```

The new `quality-gate` E2E fixture also proves strict mode passes when the
fixture contains reviewed, linked, non-stub proof with no blocking findings.

## Independent Review Response

Review agent `Hilbert` found three blockers before PR publication:

- Stub detection matched assertion text inside test fixture strings. The scanner
  now uses the TypeScript AST to detect executable literal-to-same-literal
  assertions, and `tests/lib/test-governance.test.ts` covers fixture-string
  false positives.
- `udd test review` could mark an unlinked test clean. Reviews now require an
  existing linked feature, and strict gates treat unlinked tests as blocking
  findings.
- Agent evidence summarized governance debt without actionable blocker paths.
  Evidence now includes `test_governance.blocking_findings` and
  `test_governance.next_action`.

### Future-Scope Boundaries

This goal did not implement historical flake analytics, historical pass-rate
tracking, CI-provider wiring, or impact-driven dirty marking. Those remain
future scope and are referenced to Goal 017 where relevant. The current upgrade
does prove already-marked stale reviewed tests are strict-mode blockers.

## Source-Controlled Coverage

Promoted current scenarios:

- `specs/features/udd/test-governance/test-scan.feature`
- `specs/features/udd/test-governance/test-status.feature`
- `specs/features/udd/test-governance/test-review.feature`
- `specs/features/udd/test-governance/quality-gate.feature`
- `specs/features/udd/test-governance/health-metrics.feature`
- `specs/features/udd/test-governance/regression-detection.feature`

Matching E2E proof:

- `tests/e2e/udd/test-governance/test-scan.e2e.test.ts`
- `tests/e2e/udd/test-governance/test-status.e2e.test.ts`
- `tests/e2e/udd/test-governance/test-review.e2e.test.ts`
- `tests/e2e/udd/test-governance/quality-gate.e2e.test.ts`
- `tests/e2e/udd/test-governance/health-metrics.e2e.test.ts`
- `tests/e2e/udd/test-governance/regression-detection.e2e.test.ts`

## Verification

Commands run:

```bash
./bin/udd lint
npx tsc --noEmit
npm test -- --run tests/e2e/udd/test-governance
npm test -- --run tests/e2e/udd/test-governance tests/lib/test-governance.test.ts
npm test -- --run tests/e2e/udd/strategic-program/strategic_program_commands.e2e.test.ts tests/lib/agent-integration.test.ts
./bin/udd status --json
./bin/udd test-scan --json
./bin/udd gate test-governance --json
./bin/udd gate test-governance --strict --json
./bin/udd opencode evidence --json --goal goals/015-test-governance-upgrade.md
```

Observed results:

- `udd lint`: pass.
- TypeScript: pass.
- Focused governance E2E: 7 files passed, 35 tests passed.
- Focused governance plus library regressions after review fixes: 8 files
  passed, 37 tests passed.
- Non-strict gate reports findings without failing.
- Strict gate exits 1 on current repo stubbed and unlinked-test findings.
- Strict gate passes in the reviewed, linked, non-stub fixture.

## Reviewer Blocking Criteria Check

- Canonical scenarios and E2E proof exist for promoted governance behavior.
- Known governance gaps are either implemented or explicitly retained as future
  scope.
- Ignored local cache cannot make strict gates pass or fail.
- Strict and non-strict behavior are covered separately.
- Status and agent evidence include governance summaries a reviewer can act on.
