# OpenCode Adapter

OpenCode is one UDD agent adapter. Its runtime-native files remain under
`.opencode/`, while reusable workflow semantics live in `integrations/shared/`
and shared source helpers.

## Adapter Surface

- `.opencode/command/udd/*.md` - OpenCode slash-command prompts.
- `.opencode/agent/*.md` - OpenCode agent profiles.
- `.opencode/hooks/pre-task.sh` - OpenCode guardrail hook.
- `.opencode/plugin/udd-enforcement.ts` - OpenCode-specific enforcement plugin.
- `src/commands/opencode.ts` - CLI adapter exposing OpenCode-oriented status,
  next-work, and issue commands.
- `specs/features/opencode/` - OpenCode adapter behavior scenarios.

## Shared Dependencies

The OpenCode adapter should call shared UDD utilities for project state and
goal execution semantics:

- `src/lib/agent-integration.ts` for agent payloads and reusable status shapes.
- `integrations/shared/goal-command-contract.md` for `/goal <goal-file>`
  behavior.
- `udd status`, `udd doctor`, and `npm run check` for verification gates.

OpenCode-specific prompts can mention OpenCode, but they should not describe
OpenCode as the overall UDD architecture.

## Migration Decisions

- Keep `.opencode/` as the adapter home for OpenCode runtime files.
- Keep `udd opencode ...` commands as adapter conveniences.
- Move reusable payload shaping and goal semantics into shared source/docs
  before adding Codex or future runtime behavior.
- Schedule a follow-up migration to slim `.opencode/command/udd/iterate.md`
  and `.opencode/command/udd/status.md` so they invoke the shared contract
  instead of duplicating the generic iteration protocol.
- Leave deeper orchestration rewrites for a later goal after the shared
  contract is stable.
