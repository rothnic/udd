# UDD Architecture

UDD is a spec-first CLI and workflow for keeping user intent, behavior
contracts, and verification aligned. The current repository state is a
compatibility-mode architecture: user-facing scenarios remain the behavior
contract, while journey and SysML-informed material provide discovery context
when they improve the scenario.

This document is the stable overview. Detailed guidance lives in scoped docs:

- `docs/architecture/canonical-derivation-model.md`
- `docs/architecture/concept-mappings.md`
- `docs/process/recovery-workflow.md`
- `docs/testing/troubleshooting-stubs.md`

## Current Source-Of-Truth Layers

| Layer | Current artifact | Purpose |
| --- | --- | --- |
| Stable product purpose | `specs/VISION.md` | Long-term goals, success metrics, and state boundaries |
| Planning objective | `specs/roadmap.yml`, `goals/*.md`, GitHub issues | Current phase, capability increments, and scoped work |
| Optional discovery context | `product/journeys/*.md`, `docs/sysml-informed-discovery.md` | User context, alternatives considered, and workflow narrative |
| Required behavior contract | `specs/use-cases/*.yml` and `specs/features/**/*.feature` | Use-case outcomes and scenario files that describe observable behavior |
| Executable proof | `tests/e2e/**/*.test.ts` | Tests that prove the scenario behavior is true now |
| CLI state inspection | `udd status`, `udd lint`, `udd phase`, `udd doctor`, `udd health-check` | Readable and machine-readable views of traceability and drift |

The canonical behavior chain for current work is:

```text
Objective -> Use Case -> Scenario -> E2E Test
```

Journey files are useful discovery artifacts, and this repository dogfoods them,
but they should not become a duplicate requirement layer. If a journey changes
behavior, update the use case or scenario before implementation.

## Current CLI Behavior

The current `master` branch includes these architecture-relevant commands:

- `udd status`: summarizes use-case, scenario, test, roadmap, and git state.
- `udd lint`: validates spec structure and relationships.
- `udd phase current/list/set/check`: reads and validates phase state from
  `specs/roadmap.yml`.
- `udd doctor`: reports initialized, partial, and drifted project states. It
  supports `--json` and `--strict`; it does not apply fixes.
- `udd health-check`: returns health status for automation. It supports `--json`.
- `udd sync`: updates journey-driven scenario state when journey files drive the
  change.

## Current Versus Future Architecture

| Topic | Current behavior | Future architecture |
| --- | --- | --- |
| Phase source of truth | `specs/roadmap.yml` drives `udd phase` commands. | Richer phase-aware planning can build on the same roadmap file. |
| Traceability contract | Use cases link outcomes to scenario paths; tests prove the scenarios. | Components, requirements, and test-review artifacts can extend the graph when implementation ownership needs stronger validation. |
| Recovery | `udd doctor` and `udd health-check` diagnose drift without mutating files. | Automated or checkpoint-based recovery belongs in a later implementation slice. |
| Test governance | Meaningful assertions are expected by review and local search. | Automated stub detection and enforcement are planned under the test-governance follow-up. |
| Agent integrations | Shared behavior should route through UDD status, phase, and traceability commands. | Adapter-specific tooling should remain installable integration code, not root-local state. |

## Change Workflow

1. Start with `udd status`.
2. Identify the objective in `specs/roadmap.yml`, a goal file, or the GitHub
   issue.
3. Update the use case or scenario before implementation.
4. Run `udd sync` only when journey files are the driver for scenario changes.
5. Implement until the E2E proof passes.
6. Run the relevant checks: `udd lint`, targeted tests, `udd phase check`, and
   diagnostics when the change can affect drift.

This keeps the repository aligned with the rule that behavior is specified
before it is implemented.
