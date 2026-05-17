# Shared Agent Integration Contract

This directory owns integration-neutral UDD behavior. Codex, OpenCode, and
future adapters should reuse these contracts instead of forking separate
workflow rules.

## Shared Utilities

- Project state: `src/lib/status.ts`, `src/lib/query.ts`, and
  `src/lib/agent-integration.ts`.
- Drift and guardrails: `udd status`, `udd doctor`, and adapter-specific calls
  that surface the same data.
- Goal execution: `/goal <goal-file>` as defined in
  `goal-command-contract.md`.

## Adapter Rules

An adapter may add runtime-specific prompt files, slash commands, hooks, or UI
helpers. It should not redefine UDD source-of-truth rules. If an adapter needs a
new project-state field, goal-file field, or verification gate, add it to the
shared contract first and then expose it through the adapter.

## Migration Notes

The first shared extraction is `src/lib/agent-integration.ts`, which builds
vendor-neutral project snapshots, scenario totals, issue summaries, edit plans,
and the goal-command contract. The OpenCode CLI adapter now wraps those helpers
instead of owning the status JSON shape entirely.
