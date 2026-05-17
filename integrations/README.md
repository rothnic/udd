# Agent Integrations

UDD integrations are split into shared contracts and adapter-specific wiring.
The shared layer defines how agents read project state, execute goal files, run
checks, and prepare PR-ready evidence. Adapter directories explain how each
agent runtime invokes that same contract.

## Layout

- `shared/` - vendor-neutral goal execution, project-state, status, and
  guardrail contracts.
- `opencode/` - OpenCode adapter notes for existing `.opencode/` commands,
  hooks, and `udd opencode` CLI helpers.
- `codex/` - Codex adapter notes for `/goal goals/<file>.md` execution and PR
  review loops.

Adapter code and prompt files can live in runtime-native locations, but they
should point back to this directory when defining reusable behavior.
