# Codex Tooling

Codex should use the same UDD status, verification, and review contracts as
other agents. This directory documents Codex-side hooks and tooling for
UDD-driven development sessions.

## Session Hook

Install the Codex hook into an external UDD project:

```bash
udd hooks install-codex
```

New projects can opt in during initialization:

```bash
udd init --codex-hooks
```

Installed files:

- `.codex/hooks.json`
- `.codex/hooks/pre-task.sh`

The hook is advisory and does not block work. It surfaces the same baseline
health checks the rest of the repository uses:

- `udd health-check`
- `udd doctor`
- `git status --short`

## Shared Utility Path

Codex tooling should consume shared UDD state and guardrails instead of copying
OpenCode prompts:

- Project state: `src/lib/agent-integration.ts`, `src/lib/status.ts`,
  `src/lib/query.ts`.
- Shared integration notes: `integrations/shared/README.md`.
- Operations playbook: `docs/process/udd-agent-operations.md`.

## Tooling Scope

In scope for Codex tooling:

- Lightweight hooks that report UDD project health.
- Prompt or skill helpers that point back to UDD health, doctor, tests, and
  review gates.
- PR comment review instructions that reuse the shared completion audit.

Out of scope for this slice:

- Full Codex plugin implementation.
- Forking the OpenCode command set.
- Runtime-specific status formats that duplicate shared payloads.
