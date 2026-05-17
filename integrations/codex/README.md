# Codex Adapter

Codex should use the same UDD goal, status, and verification contracts as other
agents. This directory documents the adapter path without introducing a second
workflow.

## Goal Execution

Codex entrypoint:

```bash
/goal goals/<file>.md
```

The command resolves to the shared contract in
`integrations/shared/goal-command-contract.md`:

- Read exactly one goal file.
- Check repo state with `udd status`, `udd doctor`, and `git status`.
- Execute only the referenced goal.
- Run explicit checks and classify failures.
- Push one focused PR with the required evidence.
- Wait for PR comments and address comments relevant to the goal.
- Run an independent review before completion.

## Shared Utility Path

Codex adapter work should consume shared UDD state and guardrails instead of
copying OpenCode prompts:

- Project state: `src/lib/agent-integration.ts`, `src/lib/status.ts`,
  `src/lib/query.ts`.
- Goal contract: `integrations/shared/goal-command-contract.md`.
- Goal template: `goals/TEMPLATE.md`.
- Operations playbook: `docs/process/udd-agent-operations.md`.

## Adapter Scope

In scope for a future Codex adapter:

- A concise Codex prompt or skill that points to the shared contract.
- A wrapper that prepares the prompt-to-artifact checklist from a goal file.
- PR comment review instructions that reuse the shared completion audit.

Out of scope for this slice:

- Full Codex plugin implementation.
- Forking the OpenCode command set.
- Runtime-specific status formats that duplicate shared payloads.
