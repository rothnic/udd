# Goal 017 Change Impact and Regression Upgrade Review

Date: 2026-06-03
Branch: `codex/change-impact-regression-upgrade`
Goal: `goals/017-change-impact-and-regression-upgrade.md`

## User-Perspective Findings

### Maintainer / Reviewer

Promise reviewed: "Tell me what this change affects and which tests I need to
run before I trust it."

Current upgrade coverage:

- `udd impact <path> --json` includes affected objectives, capabilities, use
  cases, outcomes, scenarios, tests, goals, diagnostics, regression markers,
  recommendations, and `recommended_commands`.
- Changed feature files resolve to their linked E2E tests.
- Changed use-case files resolve to all linked scenarios and tests.
- Changed test files trace back to the behavior contract they prove.
- Changed goal files resolve to goal context and project-health verification.
- Untraceable implementation and documentation files are labeled explicitly and
  receive fallback validation instead of silently returning empty evidence.

Feature-file evidence:

```json
{
  "resolved": ["scenario:udd/recovery/plan_repair"],
  "tests": ["tests/e2e/udd/recovery/plan_repair.e2e.test.ts"],
  "commands": [
    "npm test -- --run tests/e2e/udd/recovery/plan_repair.e2e.test.ts"
  ]
}
```

Use-case evidence:

```json
{
  "useCases": ["use_case:recover_from_drift"],
  "scenarios": 4,
  "tests": 4,
  "commands": [
    "npm test -- --run tests/e2e/udd/recovery/apply_safe_repairs.e2e.test.ts tests/e2e/udd/recovery/diagnose_project_health.e2e.test.ts tests/e2e/udd/recovery/plan_repair.e2e.test.ts tests/e2e/udd/recovery/refuse_behavior_rewrites.e2e.test.ts"
  ]
}
```

Changed-test evidence:

```json
{
  "tests": ["tests/e2e/udd/recovery/plan_repair.e2e.test.ts"],
  "scenarios": ["specs/features/udd/recovery/plan_repair.feature"],
  "commands": [
    "npm test -- --run tests/e2e/udd/recovery/plan_repair.e2e.test.ts"
  ]
}
```

Goal-file evidence:

```json
{
  "resolved": ["goal:017-change-impact-and-regression-upgrade"],
  "goals": ["goals/017-change-impact-and-regression-upgrade.md"],
  "commands": ["./bin/udd status --json", "./bin/udd lint"]
}
```

Missing-proof evidence:

```json
{
  "scenario": "specs/features/udd/cli/codex_hooks.feature",
  "marker": "missing_proof",
  "commands": ["npm test -- --run tests/e2e/udd/cli/codex_hooks.e2e.test.ts"]
}
```

### Agent Operator

`udd opencode evidence --json --goal goals/017-change-impact-and-regression-upgrade.md`
now includes `changed_file_impacts` for dirty working tree paths. The command
also fixes git porcelain parsing so changed paths are emitted without status
prefixes such as `M ` and rename/copy records use the destination path.

Evidence excerpt:

```json
{
  "changedFiles": [
    "specs/roadmap.yml",
    "specs/use-cases/prevent_regression.yml",
    "src/commands/opencode.ts",
    "src/lib/agent-integration.ts",
    "src/lib/trace-graph.ts"
  ],
  "impacts": "one impact object per changed file"
}
```

### Scope Boundary

Impact recommendations are traceability-based. They intentionally do not infer
runtime coverage for arbitrary implementation source files such as
`src/lib/trace-graph.ts`. Those files now appear in `changed_file_impacts` with
an `untraceable` regression marker and `./bin/udd lint` fallback validation.

## Independent Review Follow-Up

Independent review by Dirac found four blocking gaps before PR packaging:

- `udd impact goals/017-change-impact-and-regression-upgrade.md --json`
  returned no useful goal context or commands.
- Changed implementation and documentation files could produce empty
  `changed_file_impacts`, which made untraceable files look clean.
- Missing-proof recommendations pointed back at `udd impact` instead of the
  expected missing E2E test path.
- Git porcelain rename/copy records could be parsed as `old -> new` instead of
  the destination path.

All four findings were addressed and covered by focused tests.

Gemini review then found three follow-up improvements:

- Build the trace graph once for adapter evidence instead of once per changed
  file.
- Parse ` -> ` as rename/copy syntax only when git porcelain status contains
  `R` or `C`.
- Include goal health commands whenever a goal is affected.

These were addressed and reverified before merge.

## Verification

Commands run:

```bash
./bin/udd lint
npx tsc --noEmit
npm test -- --run tests/e2e/udd/test-governance/feature-change-detection.e2e.test.ts tests/e2e/udd/strategic-program/strategic_program_commands.e2e.test.ts
npm test -- --run tests/lib/agent-integration.test.ts tests/e2e/udd/test-governance/feature-change-detection.e2e.test.ts
npm test -- --run tests/e2e/udd/test-governance/feature-change-detection.e2e.test.ts tests/lib/agent-integration.test.ts tests/lib/opencode.test.ts
./bin/udd impact specs/features/udd/recovery/plan_repair.feature --json
./bin/udd impact specs/use-cases/recover_from_drift.yml --json
./bin/udd impact tests/e2e/udd/recovery/plan_repair.e2e.test.ts --json
./bin/udd impact goals/017-change-impact-and-regression-upgrade.md --json
./bin/udd impact src/lib/trace-graph.ts --json
./bin/udd impact specs/features/udd/cli/codex_hooks.feature --json
./bin/udd opencode evidence --json --goal goals/017-change-impact-and-regression-upgrade.md
```

Observed results:

- `udd lint`: pass.
- TypeScript: pass.
- Focused impact and strategic tests: 2 files passed, 13 tests passed.
- Agent evidence regression plus impact E2E: 2 files passed, 9 tests passed.
- Review-finding regression tests: 3 files passed, 16 tests passed.
- Impact output returns targeted verification commands for feature, use-case,
  test, goal, untraceable, and missing-proof inputs.

## Reviewer Blocking Criteria Check

- Impact output recommends concrete verification commands.
- Changed tests trace back to behavior contracts.
- Missing proof diagnostics recommend the expected missing E2E test path.
- Agent evidence includes changed-file impact objects and targeted commands when
  the changed path is traceable.
- Agent evidence labels untraceable changed files and provides fallback
  validation instead of emitting silent empty impact.
