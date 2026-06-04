# User-Gap Upgrade Review

Date: 2026-06-02

Remote head reviewed: `34773dbac1b63d489ce04abd322e5083c2b52325`

## Purpose

Review current remote `master` from user perspectives and identify upgrade-sized
gaps that should become the next goal pipeline. The review focuses on friction
that a user would notice, not only internal architecture gaps.

## Evidence Collection

The review evidence was collected from a fresh shallow clone of remote
`master`, followed by `npm ci`.

Commands run:

```bash
git clone --depth=1 --branch master https://github.com/rothnic/udd.git /tmp/udd-user-gap-review-remote
cd /tmp/udd-user-gap-review-remote
npm ci
git rev-parse HEAD
./bin/udd status --json > /tmp/udd-user-gap-evidence/status.json
./bin/udd lint > /tmp/udd-user-gap-evidence/lint.txt
./bin/udd trace --json > /tmp/udd-user-gap-evidence/trace.json
./bin/udd impact specs/use-cases/run_tests.yml --json > /tmp/udd-user-gap-evidence/impact-run-tests.json
./bin/udd doctor --json > /tmp/udd-user-gap-evidence/doctor.json
./bin/udd repair --dry-run --json > /tmp/udd-user-gap-evidence/repair-dry-run.json
./bin/udd opencode evidence --json --goal goals/000-strategic-execution-master-goal.md > /tmp/udd-user-gap-evidence/opencode-evidence.json
```

Every command above exited successfully. The raw command outputs were written
to `/tmp/udd-user-gap-evidence/` during this review run; the durable summary
below records the review-critical values so a future reviewer does not need
chat history to understand the baseline.

Observed evidence at `34773dbac1b63d489ce04abd322e5083c2b52325`:

- `udd lint`: passed with `All specs are valid`.
- `udd status --json`: 19 use cases, 14 active features, and 38 stale
  scenarios.
- `udd trace --json`: 159 nodes, 176 edges, and 20 diagnostics.
- `udd impact specs/use-cases/run_tests.yml --json`: resolved one use case,
  two scenarios, two linked E2E tests, and 11 edges.
- `udd doctor --json`: `drift-detected`, `healthy: false`, 1 critical issue,
  34 warnings, total 35 issues.
- `udd repair --dry-run --json`: proposed 1 safe manifest refresh and refused
  34 missing-scenario repairs as manual behavior-spec decisions.
- `udd opencode evidence --json --goal goals/000-strategic-execution-master-goal.md`:
  goal status `blocked`, next recommendation `specs/.udd/manifest.yml`, 1
  critical issue, 34 warnings, `npm test -- --run` marked `not_run`.

Review-critical JSON excerpts:

```json
{
  "head": "34773dbac1b63d489ce04abd322e5083c2b52325",
  "status": {
    "current_phase": 3,
    "active_features": 14,
    "use_case_count": 19,
    "scenario_totals": {
      "stale": 38
    }
  },
  "trace": {
    "nodes": 159,
    "edges": 176,
    "diagnostics": 20
  },
  "impact_run_tests": {
    "use_cases": ["use_case:run_tests"],
    "scenarios": ["scenario:udd/cli/run_tests", "scenario:udd/cli/check_status"],
    "tests": [
      "test:tests/e2e/udd/cli/run_tests.e2e.test.ts",
      "test:tests/e2e/udd/cli/check_status.e2e.test.ts"
    ],
    "edge_count": 11
  },
  "doctor": {
    "status": "drift-detected",
    "healthy": false,
    "summary": {
      "critical": 1,
      "warning": 34,
      "info": 0,
      "total": 35
    },
    "missing_manifest": "specs/.udd/manifest.yml"
  },
  "repair_dry_run": {
    "mode": "dry-run",
    "proposed": 1,
    "refused": 34,
    "proposed_kinds": ["refresh_manifest"]
  },
  "agent_evidence": {
    "goal_status": "blocked",
    "next_recommended": "specs/.udd/manifest.yml",
    "issues": {
      "critical": 1,
      "warning": 34,
      "info": 0,
      "total": 35
    },
    "verification": [
      {"command": "./bin/udd status", "status": "passed"},
      {"command": "./bin/udd lint", "status": "passed"},
      {"command": "npm test -- --run", "status": "not_run"}
    ]
  }
}
```

## Main Finding

The current strategic-program report says goals 007-012 have source-controlled
proof, but the default user-facing health surfaces still tell a fresh-checkout
user that the project is blocked by a missing manifest and broad drift.

That is the most important upgrade friction: UDD has proof artifacts, but the
first status and evidence surfaces do not make the proved state feel trustworthy
or ready to build on.

## User Perspectives

### Product Author

Prompt: "I have a feature idea; help me create the right use case, scenario,
and test obligation."

What works:

- Goal 007 and `docs/authoring-workbench.md` define the intended authoring
  path.
- The strategic command scenario confirms authoring should scaffold behavior
  contracts without fake passing tests.

Gaps:

- The default status output still presents all outcomes as unsatisfied unless
  prior test result state exists.
- Authoring success is not connected to a visible "next proof obligation" queue
  that ranks what a user should do after scaffolding.

Classification:

- `proof/reporting mismatch`: authoring proof exists, but status does not help
  a new user trust it.
- `missing feature coverage`: new/change/defer authoring paths need stronger
  current-project examples tied to next verification commands.

### Maintainer Or Reviewer

Prompt: "Tell me whether this project is healthy and what changed."

What works:

- `udd trace --json` and `udd impact` provide deterministic relationships.
- `udd lint` passes, so the source-controlled spec shape is valid.

Gaps:

- `udd doctor --json` reports `drift-detected` and `healthy: false` on a fresh
  clone.
- The missing `specs/.udd/manifest.yml` is critical even though generated local
  state is not supposed to be source-of-truth evidence.
- The status surface does not clearly separate current proof blockers from
  optional journey/discovery drift.

Classification:

- `blocking upgrade friction`: a clean checkout looks unhealthy before the user
  can evaluate the product.
- `proof/reporting mismatch`: lint and strategic proof pass, but health
  surfaces classify the project as blocked.

### Test Governance Owner

Prompt: "Show me which tests are proof, stale, missing, reviewed, or
CI-blocking."

What works:

- Goal 009 and `local-gate-validation` establish the intended governance model.
- `opencode evidence` refuses to infer full-suite success from generated local
  state.

Gaps:

- Test-governance journeys still reference missing scenario files across
  lifecycle, gates, health, and regression prevention.
- Status reports stale scenarios broadly but does not give a user a crisp
  governance upgrade path.
- Strict/non-strict gate adoption needs stronger proof across the five
  governance use cases.

Classification:

- `missing feature coverage`: current governance use cases have future or
  journey-driven gaps.
- `blocking upgrade friction`: teams cannot adopt UDD as a gate while the
  default health model is noisy.

### Recovery User

Prompt: "This repo is drifted; diagnose it and safely repair what can be
repaired."

What works:

- `udd doctor --json` identifies drift and separates issue severity.
- `udd repair --dry-run --json` proposes only a safe manifest refresh and
  refuses to rewrite behavior specs automatically.

Gaps:

- The only safe automatic action is generated-manifest refresh; the remaining
  34 issues become manual without a guided recovery backlog.
- The recovery journey has 14 missing scenario references, so the recovery
  product promise is broader than canonical implemented behavior.

Classification:

- `missing feature coverage`: recovery workflow steps need canonical scenarios
  and E2E proof.
- `backlog/discovery drift`: recovery journey detail is still ahead of the
  source-of-truth feature files.

### Agent Operator

Prompt: "Pick the next useful task, explain why, and produce reviewable
evidence."

What works:

- `udd opencode evidence --json` returns adapter-neutral status, issues,
  next recommendation, verification, changed files, and review notes.
- Evidence marks full test verification as `not_run` unless explicit command
  output exists.

Gaps:

- The next recommendation is the missing manifest, which is a generated-state
  issue rather than a meaningful product upgrade.
- The evidence package reports the strategic master goal as `blocked` even
  though the strategic-program review says no final-program blocker remains.
- Agents do not yet receive a durable goal pipeline that converts this mismatch
  into upgrade work.

Classification:

- `proof/reporting mismatch`: strategic review and agent evidence disagree.
- `blocking upgrade friction`: next-work selection can send agents to generated
  state maintenance before user-visible product improvements.

## Recommended Upgrade Pipeline

Create a new goal program that treats goals 007-012 as historical/current
strategic-program context and focuses goals 013-018 on user-visible upgrade
friction:

1. `goals/013-user-gap-upgrade-master-goal.md`
2. `goals/014-status-trust-and-health-baseline.md`
3. `goals/015-test-governance-upgrade.md`
4. `goals/016-recovery-workflow-upgrade.md`
5. `goals/017-change-impact-and-regression-upgrade.md`
6. `goals/018-agent-operator-upgrade.md`

Each goal should be a two-week upgrade increment with a visible user-facing
promise, measurable outcomes, spec-first tasks, explicit verification commands,
and independent user-perspective review gates.

## Reviewer Blocking Criteria For The New Pipeline

- Blocks if default status or doctor output still makes a clean, healthy
  checkout look blocked by generated local state.
- Blocks if optional journey drift is reported as equivalent to canonical
  source-of-truth failure.
- Blocks if governance goals do not add canonical scenarios and E2E proof for
  missing test-governance behavior.
- Blocks if recovery implementation rewrites user-authored behavior specs
  without explicit review.
- Blocks if agent next-work recommendations prioritize generated state over
  meaningful user-visible product improvements without explaining why.
