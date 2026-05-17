# Goal: Traceable Rebuild Slice

## Agent Entry

- Goal file: `goals/002-traceable-rebuild-slice.md`
- Command: `/goal goals/002-traceable-rebuild-slice.md`
- PR target: one focused PR proving a complete derivation chain

## Objective

Create one small, complete vertical slice that proves UDD can describe behavior
well enough to rebuild and independently verify an implementation from the spec.
The slice must cover the full chain from stakeholder intent through independent
test and implementation responsibility.

## Context

- The current canonical derivation model is documented as:
  Persona -> Journey -> Use Case -> Scenario -> E2E Test -> Component ->
  Requirement.
- Component and requirement layers are documented but not yet represented as
  concrete source directories in the current repo.
- The slice should be small, boring, and verifiable. Prefer a UDD CLI behavior
  that already exists over inventing product behavior.

## Scope

In scope:
- Add or refine one traceable slice using existing UDD behavior.
- Create concrete `specs/components/` and `specs/requirements/` artifacts if
  missing.
- Add or update one independent E2E test that verifies behavior from the user or
  stakeholder perspective.
- Add trace queries or docs needed to navigate the slice.

Out of scope:
- Full migration of all existing use cases to component and requirement layers.
- Broad test-suite cleanup.
- New product behavior not required by the slice.

## Required Inputs

- Source docs:
  - `docs/architecture/canonical-derivation-model.md`
  - `docs/architecture/udd-concept-model.md`
  - `docs/architecture/journey-narrative-model.md`
  - `specs/traceability-contract.yml`
  - `specs/journey-map.schema.yml`
  - `docs/process/requirement-attachment-policy.md`
- Candidate behavior:
  - `product/journeys/capture-ideas.md`
  - `specs/use-cases/capture_ideas.yml`
  - `specs/features/udd/cli/inbox/add_item_via_cli.feature`
  - `tests/e2e/udd/cli/inbox/add_item_via_cli.e2e.test.ts`
- History/context to inspect:
  - `git log -- docs/architecture/canonical-derivation-model.md specs/traceability-contract.yml`
  - `.memsearch/sessions/` entries mentioning derivation, traceability, or
    rebuild-from-spec

## Tasks

1. Review the derivation docs and git history to confirm the latest intended
   direction.
2. Identify and document any conflicting derivation descriptions.
3. Choose one existing user-visible behavior for the slice.
4. Ensure persona, journey, use case, scenario, E2E test, component, and
   requirement artifacts exist and link to each other.
5. Make the test independent from implementation internals. It should validate
   observable CLI behavior, files, outputs, or state from a stakeholder
   perspective.
6. Add a short navigation note showing how to traverse the slice forward and
   backward.
7. Update validation or status behavior only if required to make the slice
   discoverable.

## Review Subtask

Review the docs and project tree before final verification. Specifically check:
- Whether `AGENTS.md`, architecture docs, process docs, and specs describe the
  derivation chain consistently.
- Whether any older SysML or traceability docs imply a conflicting chain.
- Whether the new component and requirement artifacts duplicate scenario text.
- Whether the slice gives enough information to rebuild the behavior without
  reading implementation code first.

Record conflicts and cleanup opportunities in the PR summary.

## Explicit Checks

The goal is complete only when these checks are true:
- [ ] One slice traverses Persona -> Journey -> Use Case -> Scenario -> E2E Test
      -> Component -> Requirement.
- [ ] Every hop has a source file and stable identifier.
- [ ] The E2E test verifies user-visible behavior independently of
      implementation internals.
- [ ] Component and requirement artifacts do not copy Gherkin scenario text.
- [ ] A human can navigate the slice from any artifact to the others.

## Measurables

- Complete derivation slices in repo: at least 1.
- Missing hops in selected slice: 0.
- Direct journey-to-scenario shortcuts in selected slice: 0.
- Scenario text duplicated in component/requirement docs: 0.

## Verification Commands

```bash
udd status
udd lint
npm test -- tests/e2e/udd/cli/inbox/add_item_via_cli.e2e.test.ts
```

If the chosen slice is not inbox capture, update the test command to the exact
slice test file.

## PR Notes

The PR body must include:
- The selected slice.
- Forward and reverse trace path.
- Derivation conflicts found.
- Verification output summary.
- Deferred full-migration work.
