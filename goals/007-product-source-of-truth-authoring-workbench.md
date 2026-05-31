# Goal 007: Product Source-of-Truth Authoring Workbench

## Agent Entry

Build the first team-sized authoring increment for UDD's durable product record.
The goal is not to add another artifact layer. The goal is to make the existing
canonical chain easy to create, review, and keep coherent:

```text
Objective -> Use Case -> Scenario -> E2E Test
```

## Timebox and Team Shape

- Target duration: 2 engineering weeks.
- Suggested team: 3-5 engineers across CLI, docs, schema, tests, and examples.
- Primary users: product managers, engineers, and coding agents authoring
  behavior before implementation.

## Objective

Create a source-of-truth authoring workflow that lets a contributor start from a
product objective, create or update use cases and scenarios, and see the exact
test obligations before writing implementation code.

## Scope

- Stable authoring commands for objectives, use cases, scenarios, and test
  stubs.
- Documentation that explains when journeys/SysML notes are optional context.
- Schema validation for new and edited source-of-truth artifacts.
- A worked red-green example that starts with a behavior change.

## Non-Goals

- Full visual UI.
- Broad migration of every existing use case.
- Agent orchestration or OpenCode-specific behavior.
- Generated local state committed to the repository.

## Measurables

- `udd new use-case` or equivalent flow creates a valid use case linked to a
  roadmap objective.
- `udd new scenario` creates one focused feature file and identifies the
  expected E2E test path.
- `udd lint` catches missing objective, use-case, scenario, and test links.
- At least 3 documented authoring paths cover new feature, changed behavior,
  and deferred future-phase work.
- At least 90% of existing use cases have explicit objective or capability
  linkage, or are listed in a migration exception file.

## Tasks

- [ ] Define the authoring contract for objective, use case, scenario, and test
      artifacts.
- [ ] Add or update schemas for source-of-truth artifact validation.
- [ ] Implement use-case scaffolding with required outcome and scenario fields.
- [ ] Implement scenario scaffolding that writes one scenario per file.
- [ ] Generate deterministic expected test paths without creating fake passing
      tests.
- [ ] Add CLI help text that points to the canonical traceability chain.
- [ ] Document journey/SysML notes as optional discovery context.
- [ ] Add a red-green worked example for a behavior change.
- [ ] Add validation for missing or ambiguous objective links.
- [ ] Add validation for missing or duplicate scenario identifiers.
- [ ] Add tests for scaffolding, validation, and help output.
- [ ] Update `udd status` messaging if authoring gaps need clearer labels.
- [ ] Add migration notes for existing artifacts that cannot be fixed in this
      goal.

## Definition of Done

- A contributor can create a new behavior contract from CLI prompts or arguments
  without hand-authoring every YAML and feature-file path.
- The generated artifacts pass lint once the expected test obligation is
  satisfied or explicitly deferred by phase.
- Documentation gives one unambiguous authoring route and does not require
  reading dated review artifacts.

## Verification Commands

```bash
./bin/udd status
./bin/udd lint
npm test -- --run
```

## Reviewer Blocking Criteria

- Blocks if new authoring behavior bypasses the canonical traceability chain.
- Blocks if generated test files are committed as fake passing behavior.
- Blocks if journey files become a mandatory duplicate requirement layer without
  an explicit product decision.
- Blocks if the implementation commits generated local state.

