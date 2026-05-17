# Agent Integrations

UDD integrations are split into shared contracts and adapter-specific wiring.
The shared layer defines how agents read project state, run checks, and prepare
PR-ready evidence. Adapter directories explain how each agent runtime invokes
those shared UDD contracts.

## Layout

- `shared/` - vendor-neutral project-state, status, verification, and guardrail
  contracts.
- `opencode/` - OpenCode adapter notes for existing `.opencode/` commands,
  hooks, and `udd opencode` CLI helpers.
- `codex/` - Codex hook and tooling notes for UDD-driven development sessions.

Adapter code and prompt files can live in runtime-native locations, but they
should point back to this directory when defining reusable behavior.
