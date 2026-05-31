# Goal 010: Shared Agent Execution Control Plane

## Agent Entry

Build an adapter-neutral control plane for agent integrations so Codex,
OpenCode, and future agents can consume the same UDD facts without coupling goal
commands to one agent runtime.

## Timebox and Team Shape

- Target duration: 2 engineering weeks.
- Suggested team: 4-6 engineers across shared contracts, OpenCode tooling,
  Codex compatibility, docs, and tests.
- Primary users: engineers and agents running UDD-guided implementation loops.

## Objective

Provide shared agent-facing commands, JSON contracts, and installable integration
tooling that support planning, execution, pause/resume, review handoff, and
evidence collection without reintroducing Codex goal-command coupling.

## Scope

- Shared integration contracts under `integrations/shared`.
- OpenCode commands and plugins that are either installable tooling or explicitly
  documented dogfooding state.
- Codex guidance that stays aligned with merged PR #46 hook behavior.
- Agent evidence packages for review and handoff.

## Non-Goals

- One agent runtime becoming canonical.
- Root-local hooks without an installable or dogfooding justification.
- Autonomous mutation without human review gates.
- Broad package-manager or tooling cleanup.

## Measurables

- Shared commands produce stable JSON for status, next work, issues, and review
  evidence.
- OpenCode integration can be installed or its root-local state is explicitly
  justified as dogfooding.
- Codex documentation references UDD facts without coupling `/goal` behavior to
  source-controlled commands.
- At least 3 agent workflows are tested: status routing, implementation loop,
  and review handoff.
- Integration docs identify what is adapter-neutral versus adapter-specific.

## Tasks

- [ ] Update use cases, feature scenarios, and failing E2E tests for shared
      agent commands before implementing adapter changes.
- [ ] Define shared agent command contracts and JSON schemas.
- [ ] Implement or update shared status and next-work adapters.
- [ ] Implement issue/list diagnostics for agent routing.
- [ ] Add an evidence package format for PR/review handoff.
- [ ] Audit root-local OpenCode files and classify each as installable,
      dogfooding, or removable.
- [ ] Convert unjustified root-local hooks into installable tooling.
- [ ] Keep Codex hook guidance aligned with PR #46 behavior.
- [ ] Remove or avoid Codex goal-command coupling in shared contracts.
- [ ] Add OpenCode plugin tests for status and next-work commands.
- [ ] Add integration fixtures for clean, stale, and drifted projects.
- [ ] Document adapter-neutral versus OpenCode-specific responsibilities.
- [ ] Add failure-mode guidance for agents when UDD status is noisy.

## Definition of Done

- Agent integrations consume shared UDD facts through stable contracts.
- OpenCode behavior is usable without smuggling local-only state into the repo.
- Codex remains compatible with PR #46 and does not gain source-controlled
  goal-command coupling.

## Verification Commands

```bash
./bin/udd opencode status --json
./bin/udd opencode next --json
./bin/udd opencode issues --json
./bin/udd opencode evidence --json
./bin/udd lint
npm test -- --run
npm run typecheck --if-present
```

## Reviewer Blocking Criteria

- Blocks if Codex goal-command coupling is reintroduced.
- Blocks if root-local hooks are added without dogfooding or installability
  rationale.
- Blocks if adapter-specific behavior leaks into shared contracts.
- Blocks if generated local state is committed.
