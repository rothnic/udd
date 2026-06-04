# OpenCode Root-Local Audit

The root `.opencode/` directory is committed dogfooding state for UDD itself.
It is not the shared agent contract. Shared behavior lives in
`src/lib/agent-integration.ts`, `docs/agent-operator-contract.md`, and
`integrations/shared/evidence-contract.md`.

## Classification

| Path | Classification | Rationale |
| --- | --- | --- |
| `.opencode/agent/*.md` | Dogfooding | Local OpenCode agent profiles used while developing this repository. |
| `.opencode/command/udd/*.md` | Dogfooding | Slash-command prompts for this repository's OpenCode sessions. They may call shared UDD commands but do not define shared JSON contracts. |
| `.opencode/opencode.jsonc` | Dogfooding | Root OpenCode configuration for UDD development. |
| `.opencode/plugin/udd-enforcement.ts` | Dogfooding | OpenCode-specific workflow warnings used by this repository while dogfooding UDD. Keep shared enforcement behavior in the UDD CLI/library surface. |
| `.opencode/plugin/udd-enforcement.yml` | Dogfooding | Plugin configuration for the root OpenCode dogfooding layer. |
| `.opencode/node_modules/**` | Removable generated state | Local dependencies are not source-controlled contract state. |
| `.opencode/package.json` | Removable generated state | Local package-manager state is not part of the shared contract. |
| `.opencode/bun.lock` | Removable generated state | Local package-manager state is not part of the shared contract. |

## Review Rule

New root-local OpenCode files must be classified here before they are committed.
If a file defines behavior that Codex, OpenCode, and future adapters should all
share, move that behavior to the shared UDD CLI/library surface instead of
placing it under `.opencode/`.

There are no unjustified root-local hooks in the current audit. Files classified
as dogfooding are intentionally root-local for this repository; files classified
as removable generated state must stay untracked.
