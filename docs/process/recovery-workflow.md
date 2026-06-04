# Recovery Workflow

This document describes the recovery process that is current on `master`.
Recovery is diagnostic-first: the CLI reports drift and health state, but it
does not apply automated fixes.

## Current Diagnostic Commands

```bash
PATH="$HOME/.bun/bin:$PATH" ./bin/udd doctor
PATH="$HOME/.bun/bin:$PATH" ./bin/udd doctor --json
PATH="$HOME/.bun/bin:$PATH" ./bin/udd doctor --strict
PATH="$HOME/.bun/bin:$PATH" ./bin/udd health-check --json
```

Current command behavior:

- `udd doctor` prints human-readable diagnostic details.
- `udd doctor --json` emits machine-readable diagnostic details.
- `udd doctor --strict` exits non-zero when blocking critical or warning issues
  are detected.
- `udd health-check --json` emits a concise health envelope for automation.

`udd repair --dry-run --json` plans safe generated-state or directory repairs
without writing files. Dry-run actions include a rank, source issue, and
`would_write` list so reviewers can predict apply-mode writes.

`udd repair --apply --json` exists for controlled fixture or temp-project repair
proof. It applies only safe reversible actions such as creating missing
directories or refreshing generated manifests, writes durable evidence under
`docs/project/reviews/repair/`, and refuses behavior-spec rewrites. Do not use
apply mode against a valuable checkout unless the intended writes have been
reviewed.

## Current Drift Signals

The current diagnostics focus on safe read-only signals, including:

- initialized, partially initialized, or missing UDD project structure,
- malformed or invalid `specs/.udd/manifest.yml`,
- stale journey hashes,
- journey references to missing scenario files,
- manifest references to missing journey or scenario files,
- orphan scenarios.

Generated-state and optional discovery-context signals are advisory when
source-controlled specs are otherwise valid:

- missing generated `specs/.udd/manifest.yml`,
- stale journey hashes,
- journey-only references to missing scenario files.

Those advisory findings are reported with `severity: "info"` in JSON output and
do not make `healthy` false. They still appear in summaries so agents and
reviewers can decide whether to refresh generated metadata or promote optional
journey steps into current behavior specs.

Blocking health issues remain critical or warning findings. Examples include
missing source directories, malformed manifests, manifest references to deleted
files, and orphaned canonical scenario files.

`udd lint` remains the structural spec validator. Recovery diagnostics should be
read alongside lint and status output rather than treated as a replacement.

## Recovery Process

1. Run `udd status` to understand the project-wide baseline.
2. Run `udd doctor --json` or `udd health-check --json` to identify blocking
   issues and advisory discovery drift.
3. Classify each issue as current-slice work, known baseline debt, or future
   follow-up.
4. Fix source artifacts directly:
   - update stale journey references only when the journey is the source,
   - update use cases when outcomes or scenario links changed,
   - update scenarios when behavior changed,
   - update tests when executable proof is missing or stale.
5. Run `udd sync` only when journey files intentionally drive scenario updates.
6. Re-run `udd lint`, targeted tests, `udd status`, and diagnostics relevant to
   the changed surface.

## Baseline Drift

This repository may intentionally contain future or partial journey references
while salvage work proceeds. A docs-only PR should not try to resolve that
baseline unless its objective explicitly includes it.

When diagnostics report advisory baseline drift, record the command output only
when it matters to the slice. Advisory journey metadata is not a reason to block
normal work by itself.

When diagnostics fail because of blocking baseline drift, record the command
output and explain why the failure is pre-existing and outside the slice.

## Future Recovery Architecture

Future work may add:

- interactive fix flows,
- checkpoint files,
- move/rename helpers that update references.

Those behaviors must be introduced with use cases, scenarios, tests, and CLI
documentation in the same implementation slice.
