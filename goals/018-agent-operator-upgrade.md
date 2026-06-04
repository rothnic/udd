# Goal 018: Agent Operator Upgrade

## Agent Entry

Make UDD useful as an agent control surface. Agents should receive shared facts,
choose meaningful next work, explain proof status, and pause when user review is
needed.

## Timebox and Team Shape

- Target duration: 2 engineering weeks.
- Suggested team: 3-5 engineers across shared contracts, agent adapters, CLI,
  tests, and docs.
- Primary users: maintainers operating Codex, OpenCode, and future agents over a
  UDD project.

## Objective

Upgrade agent next-work, issue, status, evidence, and pause/continue decisions
so adapter-neutral agents can work from shared UDD facts without relying on chat
history or generated local proof.

## User-Facing Promise

> "Let an agent choose useful UDD work, explain why it chose it, and hand me
> evidence I can review."

## Scope

- Adapter-neutral JSON contracts for status, next work, issues, verification
  recommendations, evidence, and pause reasons.
- Next-work ranking that prioritizes user-visible upgrade work over generated
  local state unless generated state blocks the requested action.
- Evidence packages that include proof status, blockers, changed-file impact,
  and manual-review gates.
- Codex/OpenCode guidance aligned with shared contracts and no reintroduced
  goal-command coupling.

## Non-Goals

- Building a full autonomous scheduler.
- Adding vendor-specific behavior that cannot be represented in shared
  contracts.
- Treating generated local state as proof.
- Automatically resolving human review gates.

## Measurables

- `udd opencode evidence --json` explains goal status, next work, blockers,
  verification, changed-file impact, and review notes from shared UDD facts.
- Agent-facing next-work recommendations include reason, user impact, blocking
  status, suggested files, and verification commands.
- Generated-state cleanup is ranked below user-visible upgrade work unless it
  blocks command correctness.
- Pause reasons are explicit for unsafe repair, missing specs, unresolved
  review gates, and unverified test claims.
- Docs show how Codex, OpenCode, and future adapters should consume the same
  contract.

## Tasks

- [x] Update use cases and scenarios for agent operator behavior before
      implementation.
- [x] Define or amend shared evidence and next-work contracts.
- [x] Add E2E tests for clean, stale, drifted, and review-blocked projects.
- [x] Add next-work ranking tests that avoid generated-state over-prioritization.
- [x] Integrate impact-derived verification recommendations into evidence.
- [x] Add pause/continue decision fields for unsafe recovery and missing proof.
- [x] Update Codex/OpenCode docs without coupling behavior to either tool.
- [x] Add examples of reviewable agent handoff evidence.
- [x] Record an independent user-perspective review.

## Completion Evidence

Completed on 2026-06-04 with evidence in
`docs/project/reviews/2026-06-04/goal-018-completion-evidence.md`.

## Definition of Done

- An agent operator can ask for next work and receive an explanation that a
  human reviewer can inspect without chat history.
- Agent evidence points to source-controlled specs, scenarios, tests, reviews,
  and verification commands.
- The contract is adapter-neutral and does not make generated local state
  authoritative.

## Verification Commands

```bash
./bin/udd opencode evidence --json --goal goals/018-agent-operator-upgrade.md
./bin/udd status --json
./bin/udd doctor --json
./bin/udd impact specs/use-cases/run_tests.yml --json
./bin/udd lint
npm test -- --run tests/e2e/opencode tests/e2e/udd/strategic-program
```

## Reviewer Blocking Criteria

- Blocks if evidence relies on chat history or generated local proof.
- Blocks if next-work recommendations cannot explain user impact.
- Blocks if Codex or OpenCode receives behavior that is not represented in the
  shared contract.
- Blocks if agents continue through unsafe recovery or unresolved human-review
  gates without an explicit pause reason.
