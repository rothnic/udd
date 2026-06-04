# User-Gap Upgrade Command Evidence

Date: 2026-06-03
Branch: `codex/user-gap-program-summary`
Master goal:
[goals/013-user-gap-upgrade-master-goal.md](../../../../goals/013-user-gap-upgrade-master-goal.md)

## Commands

### Git History

```bash
git log --oneline -6
```

Observed:

```text
9f53142 Implement agent operator handoff upgrade (#73)
21fd410 Implement change impact regression upgrade (#72)
0973eff Goal 016: upgrade recovery repair workflow (#71)
119f1ea Goal 015: upgrade test governance proof gates (#70)
d4aaed5 feat: classify advisory health drift separately (#69)
d4c4f6a docs: define user-gap upgrade goal pipeline (#68)
```

### Status

```bash
./bin/udd status --json
```

Observed summary:

```json
{
  "branch": "master",
  "clean": true,
  "health": "healthy",
  "blocking": 0,
  "advisory": 48,
  "scenarios": {
    "passing": 0,
    "stale": 42,
    "missing": 0,
    "failing": 0
  }
}
```

### Lint

```bash
./bin/udd lint
```

Observed:

```text
All specs are valid
```

### Doctor

```bash
./bin/udd doctor --json
```

Observed summary:

```json
{
  "status": "healthy",
  "healthy": true,
  "summary": {
    "critical": 0,
    "warning": 0,
    "info": 48,
    "total": 48
  }
}
```

### Trace

```bash
./bin/udd trace --json
```

Observed summary:

```json
{
  "nodes": 209,
  "edges": 227,
  "diagnostics": 27
}
```

### Agent Evidence

```bash
./bin/udd opencode evidence --json --goal goals/013-user-gap-upgrade-master-goal.md
```

Observed summary:

```json
{
  "goal": {
    "path": "goals/013-user-gap-upgrade-master-goal.md",
    "status": "in_progress"
  },
  "health": {
    "status": "healthy",
    "healthy": true,
    "summary": {
      "critical": 0,
      "warning": 0,
      "info": 48,
      "total": 48
    }
  },
  "next": {
    "recommended": "udd/strategic-program/strategic_program_commands",
    "reason": "Current-phase scenario result is stale.",
    "user_impact": "A current behavior changed or lacks fresh proof; rerun the targeted test before handoff.",
    "blocks_work": false,
    "verification_commands": [
      "npm test -- --run tests/e2e/udd/strategic-program/strategic_program_commands.e2e.test.ts"
    ]
  },
  "test_governance_summary": {
    "total": 59,
    "linked": 46,
    "unlinked": 13,
    "orphaned": 0,
    "stubbed": 10,
    "reviewed": 0,
    "stale": 0,
    "missing": 6,
    "gate_blocking": 23
  },
  "handoff": {
    "health": "healthy",
    "test_governance_gate": "blocked",
    "verification_claims": "explicit-evidence-required"
  },
  "pause_count": 23
}
```

### Full Test Suite

```bash
npm test -- --run
```

Observed:

```text
Test Files  58 passed (58)
Tests       428 passed (428)
Duration    225.31s
```

## Evidence Interpretation

- Program health is no longer critically blocked by generated manifest state.
- Remaining 48 health issues are advisory.
- Remaining test-governance blockers are visible in agent evidence and require
  explicit review/proof work; they are not treated as completed proof.
- The full test suite passed after the five child goal PRs merged.
