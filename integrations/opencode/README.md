# OpenCode Adapter

OpenCode is UDD's dogfooded agent adapter. The root `.opencode/` directory is
intentional project state for this repository: it contains OpenCode command,
agent, and plugin files used while developing UDD itself.

## Runtime Surface

- `.opencode/command/udd/*.md` - OpenCode slash-command prompts.
- `.opencode/agent/*.md` - OpenCode agent profiles for UDD work.
- `.opencode/plugin/udd-enforcement.ts` - OpenCode-specific local workflow
  warnings.
- `udd opencode status` - deep project status for OpenCode sessions.
- `udd opencode next` - next-work recommendation backed by shared UDD status.
- `udd opencode issues` - diagnostic issue list backed by shared UDD doctor
  logic.

## Shared Dependencies

OpenCode adapter commands use `src/lib/agent-integration.ts` for payload shape,
scenario totals, diagnostic issue mapping, and next-work recommendations. This
keeps OpenCode-specific UX separate from shared UDD source-of-truth behavior.

## Scope Boundaries

- Root `.opencode/` files are committed because this repository dogfoods
  OpenCode directly.
- Generated OpenCode dependencies and package-manager state are not part of the
  source contract.
- Codex behavior is not defined here; Codex hook installation remains the
  installable external-project tooling from PR #46.
