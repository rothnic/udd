# Goal 008 Completion Evidence

Date: 2026-06-04

Goal file: `goals/008-traceability-graph-and-impact-analysis-engine.md`

Implementation PR: [#67](https://github.com/rothnic/udd/pull/67)

Strategic report:
`docs/project/reviews/2026-05-31-strategic-program/report.md`

## Decision

Goal 008 is complete. PR #67 merged the traceability graph and impact analysis
baseline through `src/lib/trace-graph.ts`, `src/commands/trace.ts`,
`src/commands/impact.ts`, and strategic-program feature/E2E proof. The
2026-06-04 completion PR adds the remaining checklist proof: stale-scenario
graph diagnostics, status/lint graph summaries, and a focused fixture suite for
representative valid and invalid repo states.

This evidence closes only Goal 008. Goal 017 later improves regression
recommendations on top of this foundation.

## Current Command Evidence

```bash
git status --short --branch
```

Result:

```text
## codex/goal-008-completion-evidence
 M goals/008-traceability-graph-and-impact-analysis-engine.md
 M src/commands/lint.ts
 M src/commands/status.ts
 M src/lib/trace-graph.ts
?? docs/project/reviews/2026-06-04/goal-008-completion-evidence.md
?? tests/lib/trace-graph.test.ts
```

```bash
./bin/udd trace --json > /tmp/trace-a.json
./bin/udd trace --json > /tmp/trace-b.json
cmp -s /tmp/trace-a.json /tmp/trace-b.json
jq '{nodes:(.nodes|length), edges:(.edges|length), diagnostics:(.diagnostics|length), firstNode:.nodes[0]}' /tmp/trace-a.json
```

Result:

```json
{
  "nodes": 209,
  "edges": 227,
  "diagnostics": 27,
  "firstNode": {
    "id": "capability:agent-workflow",
    "type": "capability",
    "label": "Agent Workflow",
    "source": {
      "path": "specs/roadmap.yml"
    }
  }
}
```

```bash
./bin/udd status --json | jq '{trace:.trace, health:.health.status}'
```

Result:

```json
{
  "trace": {
    "nodes": 210,
    "edges": 228,
    "diagnostics": 27,
    "diagnostics_by_type": {
      "missing_test": 6,
      "duplicate_scenario": 8,
      "orphan_test": 13
    }
  },
  "health": "healthy"
}
```

```bash
./bin/udd lint
```

Result:

```text
All specs are valid
Trace graph: 210 node(s), 228 edge(s), 27 diagnostic(s)
```

```bash
./bin/udd impact specs/use-cases/run_tests.yml --json | jq '{input:.input, affected:.affected, recommended_commands:.recommended_commands, diagnostics:(.diagnostics|length)}'
```

Result summary:

```json
{
  "input": "specs/use-cases/run_tests.yml",
  "affected": {
    "objectives": ["objective:udd_tool"],
    "capabilities": ["capability:core-workflow"],
    "use_cases": ["use_case:run_tests"],
    "outcomes": ["outcome:run_tests#outcome-1", "outcome:run_tests#outcome-2"],
    "scenarios": ["scenario:udd/cli/run_tests", "scenario:udd/cli/check_status"],
    "tests": [
      "test:tests/e2e/udd/cli/run_tests.e2e.test.ts",
      "test:tests/e2e/udd/cli/check_status.e2e.test.ts"
    ]
  },
  "recommended_commands": [
    "npm test -- --run tests/e2e/udd/cli/check_status.e2e.test.ts tests/e2e/udd/cli/run_tests.e2e.test.ts"
  ],
  "diagnostics": 0
}
```

```bash
npm test -- --run tests/e2e/udd/strategic-program/strategic_program_commands.e2e.test.ts
```

Result:

```text
Test Files  1 passed (1)
Tests  6 passed (6)

Included scenario:
returns deterministic trace and impact JSON
```

## PR #67 Evidence

PR #67 records:

- Goal 008 outcome: deterministic `udd trace --json` plus scoped
  `udd impact <path>` over the canonical graph.
- Changed files include `src/lib/trace-graph.ts`, `src/commands/trace.ts`,
  `src/commands/impact.ts`, `specs/features/udd/strategic-program/strategic_program_commands.feature`,
  and `tests/e2e/udd/strategic-program/strategic_program_commands.e2e.test.ts`.
- Final verification included `./bin/udd trace --json`,
  `./bin/udd impact specs/use-cases/run_tests.yml --json`, `./bin/udd status`,
  `./bin/udd lint`, and `npm test -- --run`.
- Observed results in the PR body include byte-for-byte trace determinism and
  impact scope returning only `use_case:run_tests` with two affected scenarios.
- Independent review blockers for nondeterministic trace output and over-broad
  impact traversal were fixed before merge.

## 2026-06-04 Completion PR Evidence

This PR adds:

- `stale_scenario` graph diagnostics in `src/lib/trace-graph.ts`, using the
  existing generated-results timestamp behavior: missing `.udd/results.json`, or
  scenario/test files newer than results, produce informational stale
  diagnostics for linked current scenarios.
- Trace graph summary fields in `udd status --json`:
  `trace.nodes`, `trace.edges`, `trace.diagnostics`, and
  `trace.diagnostics_by_type`.
- A human-readable trace graph summary in `udd status`.
- A trace graph summary line in `udd lint` after structural validation passes.
  This consumes the graph without turning informational graph drift into a lint
  failure.
- `tests/lib/trace-graph.test.ts`, covering 11 cases: valid linked proof,
  deterministic serialization, missing scenario, missing test, orphan scenario,
  orphan test, duplicate scenario, future-phase classification, stale without
  generated results, stale after source changes, and impact for use-case,
  feature, test, roadmap, and unknown paths.

Validation run on this branch:

```bash
npm test -- --run tests/lib/trace-graph.test.ts
node_modules/.bin/tsc --noEmit
npm test -- --run tests/lib/trace-graph.test.ts tests/e2e/udd/cli/lint_valid_specs.e2e.test.ts tests/e2e/udd/cli/lint_invalid_specs.e2e.test.ts tests/e2e/udd/cli/check_status.e2e.test.ts tests/e2e/udd/strategic-program/strategic_program_commands.e2e.test.ts
./bin/udd status --json | jq '{trace:.trace, health:.health.status}'
./bin/udd lint
```

Results:

- Trace graph unit tests: 1 file passed, 11 tests passed.
- TypeScript: passed.
- Affected unit/CLI/strategic tests: 5 files passed, 28 tests passed.
- Status JSON includes trace graph summary and reports healthy.
- Lint passes and prints the trace graph summary.

## Acceptance Mapping

| Goal 008 task/check | Evidence |
| --- | --- |
| Spec-first trace/impact proof | PR #67 added strategic-program feature/E2E coverage for trace and impact. |
| Graph node and edge types | `src/lib/trace-graph.ts` defines objective, phase, capability, use case, outcome, scenario, test, and goal node types plus typed edges. |
| Source references | Trace nodes, edges, and diagnostics carry `source.path` and optional line fields. |
| Deterministic graph serialization | Repeated `udd trace --json` outputs matched byte-for-byte; graph timestamps use a stable default. |
| Orphan/missing/future diagnostics | `src/lib/trace-graph.ts` defines orphan, missing, duplicate, and future-phase diagnostic types; current trace returns 27 diagnostics with source paths. |
| Stale classification | This PR adds `stale_scenario` graph diagnostics using the existing generated-results timestamp behavior and proves missing-results plus newer-source stale cases in unit tests. |
| Impact for feature/use-case/roadmap/test paths | `analyzeImpact` supports source artifact impact and current evidence demonstrates use-case impact with affected scenarios/tests and a targeted command. |
| Status/lint shared model where practical | This PR adds trace graph summaries to status JSON, human status output, and lint success output without rewriting unrelated status/lint validation behavior. |
| Fixtures and reviewer examples | `tests/lib/trace-graph.test.ts` covers 11 representative valid/invalid graph states, and the `run_tests.yml` impact evidence provides a reviewer example for a current use case. |

## Residual Work

Goal 008 does not close later regression-upgrade work. Use Goal 017 evidence for
richer recommendation confidence, missing-proof diagnostics, and reviewer
workflow upgrades.
