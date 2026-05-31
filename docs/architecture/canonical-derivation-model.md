# Canonical Derivation Model

This document defines the current derivation chain for UDD work and separates
the enforced model from future traceability extensions.

## Current Chain

```text
Objective -> Use Case -> Scenario -> E2E Test
```

## Layer Definitions

### Objective

An objective is the reason for the work. In this repository it normally appears
as a GitHub issue, `goals/*.md`, or a capability increment in
`specs/roadmap.yml`.

Objectives answer:

- Why does this change matter?
- Which capability or phase owns it?
- What proof will show it is complete?

### Use Case

Use cases live in `specs/use-cases/*.yml`. They group user-visible outcomes and
link those outcomes to canonical scenario paths.

The current CLI compatibility layer reads use-case outcomes and
`scenario_paths` to build status and traceability views.

### Scenario

Scenarios live in `specs/features/**/*.feature`. They are the behavior contract.
They should describe observable behavior from the user or agent perspective, not
internal implementation steps.

Phase tags such as `@phase:3` are read by phase validation. Future-phase
scenarios are planning context until the roadmap makes that phase current.

### E2E Test

E2E tests live in `tests/e2e/**/*.test.ts`. They are the executable proof for a
scenario. A test should fail when the scenario behavior is not true.

## Optional Discovery Context

Journey files in `product/journeys/*.md` and SysML-informed notes help authors
ask better product questions. They are valuable context, but they should not
duplicate the required behavior contract. When a journey changes behavior, the
author must update the use case or scenario that carries the contract.

Current diagnostics can report stale journey mappings and missing scenario
references, because this repository dogfoods journey-driven discovery. That is a
drift signal, not a license to skip the use-case and scenario layer.

## Future Traceability Extensions

`specs/traceability-contract.yml` defines a broader graph that can support
personas, journeys, components, requirements, and test reviews. Those concepts
are useful when implementation ownership or impact analysis needs more detail.

They should be added only when the focused slice also includes the behavior,
validation, and tests that make the new artifact authoritative.

## Anti-Patterns

- Implementing code from a journey note without updating the use case or
  scenario.
- Adding requirements, components, or review artifacts without a validation path.
- Treating generated state under `specs/.udd/` as hand-authored product intent.
- Re-importing stale side-branch files that describe commands not present on
  current `master`.

## Verification Commands

Use these commands to inspect the current chain:

```bash
PATH="$HOME/.bun/bin:$PATH" ./bin/udd status
PATH="$HOME/.bun/bin:$PATH" ./bin/udd lint
PATH="$HOME/.bun/bin:$PATH" ./bin/udd phase check
PATH="$HOME/.bun/bin:$PATH" ./bin/udd doctor --json
```

`udd doctor --strict` and `udd health-check --json` intentionally return
non-zero when they find drift.
