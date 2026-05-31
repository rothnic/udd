# Shared Agent Integration

Shared integration files describe UDD behavior that every agent adapter can
reuse. Runtime-specific files can live under `.opencode/`, `.codex/`, or future
adapter directories, but they should call the same UDD project-state and
diagnostic surfaces instead of redefining source-of-truth rules.

## Current Contract

- Project state: `src/lib/status.ts`
- Diagnostic issues: `src/lib/diagnostics.ts`
- Agent payload shaping: `src/lib/agent-integration.ts`
- Verification commands: `udd status`, `udd doctor`, `udd lint`, and focused
  `udd test` runs

This shared layer intentionally does not make Codex goal commands part of UDD's
adapter architecture. Codex hook installation remains the opt-in external
project tooling added by PR #46.

## Adapter Rules

Adapters may add runtime prompts, slash commands, plugins, or UI helpers. They
must not duplicate UDD source-of-truth policy. If an adapter needs a new status
field, recommendation field, or diagnostic category, add it to shared source
first and then expose it through the adapter.
