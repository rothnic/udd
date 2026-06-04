# Goal 013: User-Gap Upgrade Master Goal

## Agent Entry

Use this master goal to execute the user-gap upgrade program created from the
2026-06-02 user-perspective review. Goals 007-012 remain strategic-program
context; this program focuses on the next upgrade path a user would actually
feel when adopting a new UDD version.

## Timebox and Team Shape

- Target duration: 10 engineering weeks total, split into five two-week goals.
- Suggested team: 3-5 engineers across CLI, specs, tests, integration, and
  documentation.
- Primary users: product authors, maintainers, test-governance owners, recovery
  users, and agent operators.

## Objective

Turn the current proof/reporting mismatch and missing user-facing coverage into
an ordered upgrade pipeline with measurable improvements in status trust, test
governance, recovery, impact analysis, and agent operation.

## User-Facing Promise

> "Give me the next upgrade program that closes the visible gaps users hit when
> adopting UDD from a fresh checkout."

## Scope

- Goals 014-018, executed in order unless a roadmap owner explicitly changes the
  sequence.
- Source-of-truth use-case, scenario, and E2E-test updates before behavior
  implementation in every goal.
- Independent user-perspective review after each goal.
- Program-level evidence that a fresh checkout is more trustworthy and more
  useful after each increment.

## Non-Goals

- Rewriting goals 007-012 except to amend direct contradictions discovered
  during implementation.
- Treating generated local state as source-controlled proof.
- Building a visual product UI.
- Making optional journey files a mandatory duplicate requirement layer.

## Measurables

- Five child goals each deliver one two-week, user-visible upgrade increment.
- Each child goal includes source-controlled review evidence from its target
  user perspective.
- The final program evidence shows status, doctor, repair, trace, impact, and
  agent evidence agree on proof state and blockers.
- Fresh-checkout evidence improves from the 2026-06-02 baseline of 1 critical
  health issue, 34 warnings, 38 stale scenarios, and blocked strategic evidence.

## Ordered Goals

1. `goals/014-status-trust-and-health-baseline.md`
2. `goals/015-test-governance-upgrade.md`
3. `goals/016-recovery-workflow-upgrade.md`
4. `goals/017-change-impact-and-regression-upgrade.md`
5. `goals/018-agent-operator-upgrade.md`

## Program Upgrade Criteria

- A fresh checkout no longer looks critically unhealthy because generated
  manifest state is absent.
- Status, doctor, repair, evidence, trace, and impact commands agree on what is
  current proof, optional discovery drift, and blocking product debt.
- Test governance has canonical scenario and E2E proof across inventory,
  lifecycle, gates, health, and regression prevention.
- Recovery can guide safe repair work without rewriting user-authored behavior
  specs.
- Agent evidence explains why work was chosen, what proof exists, what is
  blocked, and what should pause for human review.

## Tasks

- [x] Execute Goal 014 and record a dated user-perspective review.
- [x] Execute Goal 015 and record a dated user-perspective review.
- [x] Execute Goal 016 and record a dated user-perspective review.
- [x] Execute Goal 017 and record a dated user-perspective review.
- [x] Execute Goal 018 and record a dated user-perspective review.
- [x] Keep each goal on a focused branch or reviewable PR slice.
- [x] After each goal, update this master goal if the next goal needs a scoped
      amendment based on verified findings.
- [x] At program end, create a summary report linking every goal, review, and
      command-evidence artifact.

## Program Evidence

Completion evidence:
[goal-013-completion-evidence.md](../docs/project/reviews/2026-06-04/goal-013-completion-evidence.md)

Earlier planning summary:
[user-gap-upgrade-program-summary.md](../docs/project/reviews/2026-06-03/user-gap-upgrade-program-summary.md)

Merged PRs:

- Goal 014: PR #83, `4dd624a`
- Goal 015: PR #84, `1861061`
- Goal 016: PR #85, `edbd26a`
- Goal 017: PR #86, `5db8bdd`
- Goal 018: PR #87, `15b5aca`

## Definition of Done

- Goals 014-018 are completed, independently reviewed, and linked from a final
  program evidence report.
- Each goal produces user-visible behavior or command output that would justify
  a version upgrade for its target user perspective.
- The final fresh-checkout evidence shows no unresolved contradiction between
  strategic proof reports and default status/health/evidence surfaces.

## Verification Commands

```bash
./bin/udd status
./bin/udd lint
./bin/udd doctor --json
./bin/udd trace --json
./bin/udd opencode evidence --json --goal goals/013-user-gap-upgrade-master-goal.md
npm test -- --run
```

## Reviewer Blocking Criteria

- Blocks if any child goal lacks a dated independent review artifact.
- Blocks if any child goal skips spec/use-case/scenario updates before
  implementation.
- Blocks if generated local state is used as proof of program completion.
- Blocks if default user-facing commands still contradict source-controlled
  completion evidence at the end of the program.
