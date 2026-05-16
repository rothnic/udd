# Goal: Agent Integration Utilities

## Agent Entry

- Goal file: `goals/003-agent-integration-utilities.md`
- Command: `/goal goals/003-agent-integration-utilities.md`
- PR target: one focused PR for integration architecture and first reusable
  utility extraction

## Objective

Create a reusable agent-integration structure so Codex, OpenCode, and future
agents can share UDD project-state, goal execution, status, and guardrail
utilities without duplicating integration-specific logic.

## Context

- The repo currently has substantial OpenCode-specific assets under `.opencode/`
  and specs under `specs/features/opencode/`.
- OpenCode is no longer the only target integration.
- Codex integration needs to be designed without hard-coding this project to one
  agent runtime.
- Goal execution should work by pointing an agent to a goal file and invoking a
  slash command such as `/goal goals/<file>.md`.

## Scope

In scope:
- Design a generic integration layout for shared utilities plus per-agent
  adapters.
- Define the goal-command contract used by integrations.
- Move or wrap at least one duplicated integration utility into a shared place
  if the move is low risk.
- Add Codex integration planning docs or adapter stubs only when they clarify
  the shared contract.

Out of scope:
- Full Codex plugin implementation.
- Removing OpenCode support.
- Large rewrites of orchestration behavior before shared contracts are defined.

## Required Inputs

- Source docs and code:
  - `.opencode/`
  - `src/commands/opencode.ts`
  - `src/commands/orchestrate.ts`
  - `src/lib/status.ts`
  - `src/lib/query.ts`
  - `goals/TEMPLATE.md`
  - `docs/process/udd-agent-operations.md`
- Context to inspect:
  - `.memsearch/sessions/` entries mentioning OpenCode commands, UDD agent
    workflows, or slash commands
  - `memory/context/*.md`

## Tasks

1. Inventory existing OpenCode-specific utilities, commands, hooks, and specs.
2. Identify logic that should be shared across agent integrations.
3. Propose and create a source layout such as:
   - `integrations/shared/`
   - `integrations/opencode/`
   - `integrations/codex/`
4. Define a generic `/goal <goal-file>` contract:
   - read goal file
   - check current repo state
   - execute only that goal
   - run explicit checks
   - produce PR-ready summary
5. Add Codex-oriented integration notes that reference the shared contract rather
   than forking OpenCode behavior.
6. Update docs/specs that overstate OpenCode as the primary future direction.
7. Keep OpenCode references only where they describe the OpenCode adapter or
   historical context.

## Review Subtask

Review the docs and project tree before final verification. Specifically check:
- Whether OpenCode-specific docs duplicate generic agent guidance.
- Whether Codex planning introduces a second competing workflow.
- Whether shared utility names are integration-neutral.
- Whether source layout keeps root clean and avoids one-off status files.

Record cleanup opportunities and migration steps in the PR summary.

## Explicit Checks

The goal is complete only when these checks are true:
- [ ] A generic shared integration contract exists in source.
- [ ] OpenCode is represented as one adapter, not the overall architecture.
- [ ] Codex has a documented path to use the same goal/status/check utilities.
- [ ] `/goal goals/<file>.md` behavior is specified independently of a vendor.
- [ ] At least one duplicated utility or doc responsibility is moved, wrapped,
      or explicitly scheduled for follow-up.

## Measurables

- Shared integration contract docs: at least 1.
- Per-agent adapter directories or documented adapter targets: at least 2
  (`opencode` and `codex`).
- New OpenCode-only architecture claims outside adapter scope: 0.
- Goal command contract fields: objective, checks, measurables, verification,
  PR summary requirements.

## Verification Commands

```bash
udd status
udd doctor
npm run check
```

If implementation changes are made, add the narrowest relevant tests before the
broad checks.

## PR Notes

The PR body must include:
- Shared integration layout.
- Codex integration path.
- OpenCode migration decisions.
- Goal command contract.
- Verification output summary.
