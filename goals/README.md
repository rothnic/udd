# Goals

This directory contains source-controlled goals for agent-executed project work.
Goals are not tied to a specific agent vendor. A goal should be complete enough
that a human or agent can start from the file path, execute the work, verify the
checks, and prepare focused PRs.

## How To Use

1. Start with `000-strategic-execution-master-goal.md` for program execution.
2. Pick the first open implementation goal in numeric order unless a roadmap
   owner selects a specific strategic goal.
3. Give the agent the goal path.
4. Execute only the work described by that goal.
5. Run the explicit checks and record any deferred work by issue or goal path.

## Master Program Goal

- `000-strategic-execution-master-goal.md`: ordered execution program for goals
  007-012, including user-facing success criteria, independent review gates,
  commit checkpoints, and final end-to-end PR requirements.

## Current Strategic Portfolio

Goals 007-012 are the current two-week, team-sized execution portfolio. Each is
intended to be far-reaching enough for multiple engineers, with explicit
measurables, 10-15 subtasks, verification commands, and reviewer blocking
criteria.

- `007-product-source-of-truth-authoring-workbench.md`: make spec-first
  authoring concrete and discoverable across objectives, use cases, scenarios,
  and tests.
- `008-traceability-graph-and-impact-analysis-engine.md`: turn source files into
  a deterministic graph for status, lint, impact analysis, and agent routing.
- `009-scenario-lifecycle-and-test-governance.md`: classify scenario and test
  lifecycle state so governance gates can become credible and opt-in strict.
- `010-shared-agent-execution-control-plane.md`: provide adapter-neutral agent
  contracts while keeping Codex behavior aligned with PR #46 and OpenCode
  installability explicit.
- `011-recovery-doctor-and-remediation-suite.md`: expand recovery from
  diagnostics into safe dry-run and apply-mode remediation.
- `012-rebuild-proof-and-reference-implementation.md`: prove UDD preserves
  observable behavior across a controlled rebuild.

## Historical Salvage Goals

- `005-pr45-side-branch-stack-audit.md`: audit the broad stack preserved after
  superseded PR #45 and split valid work into mergeable slices.
- `006-source-of-truth-foundation.md`: execute the first salvage increment from
  issue #49 by landing the product/source-of-truth foundation.

## Supporting Reviews

- `docs/project/reviews/2026-05-31-goal-roadmap-review/report.md`: independent
  review that recommends the current strategic portfolio.
