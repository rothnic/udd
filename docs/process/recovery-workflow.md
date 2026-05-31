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
- `udd doctor --strict` exits non-zero when any issue is detected.
- `udd health-check --json` emits a concise health envelope for automation.

There is no current `udd doctor --fix`, checkpoint resume, or auto-remediation
command. Those remain future architecture until a focused implementation slice
adds and verifies them.

## Current Drift Signals

The current diagnostics focus on safe read-only signals, including:

- initialized, partially initialized, or missing UDD project structure,
- malformed or invalid `specs/.udd/manifest.yml`,
- stale journey hashes,
- journey references to missing scenario files,
- manifest references to missing journey or scenario files,
- orphan scenarios.

`udd lint` remains the structural spec validator. Recovery diagnostics should be
read alongside lint and status output rather than treated as a replacement.

## Recovery Process

1. Run `udd status` to understand the project-wide baseline.
2. Run `udd doctor --json` or `udd health-check --json` to identify drift.
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

When diagnostics fail because of known baseline drift, record the command output
and explain why the failure is pre-existing and outside the slice.

## Future Recovery Architecture

Future work may add:

- interactive fix flows,
- checkpoint files,
- auto-remediation for unambiguous stale metadata,
- move/rename helpers that update references.

Those behaviors must be introduced with use cases, scenarios, tests, and CLI
documentation in the same implementation slice.
