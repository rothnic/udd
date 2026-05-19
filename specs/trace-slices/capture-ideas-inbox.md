# Trace Slice: Capture Ideas Inbox

## Purpose

This slice proves one complete derivation path for existing UDD behavior without
inventing new product behavior.

## Selected Slice

- Persona: `developer` in `product/actors.md`
- Journey: `capture-ideas` in `product/journeys/capture-ideas.md`
- Use case: `capture_ideas` in `specs/use-cases/capture_ideas.yml`
- Scenario: `udd/cli/inbox/add_item_via_cli` in `specs/features/udd/cli/inbox/add_item_via_cli.feature`
- E2E test: `tests/e2e/udd/cli/inbox/add_item_via_cli.e2e.test.ts`
- Component: `cli-inbox-command` in `specs/components/cli-inbox-command.yml`
- Requirement: `persist_inbox_item` in `specs/requirements/persist_inbox_item.yml`

## Forward Path

`developer` -> `capture-ideas` -> `capture_ideas` ->
`udd/cli/inbox/add_item_via_cli` ->
`tests/e2e/udd/cli/inbox/add_item_via_cli.e2e.test.ts` ->
`cli-inbox-command` -> `persist_inbox_item`

## Reverse Path

`persist_inbox_item` -> `cli-inbox-command` ->
`tests/e2e/udd/cli/inbox/add_item_via_cli.e2e.test.ts` ->
`udd/cli/inbox/add_item_via_cli` -> `capture_ideas` ->
`capture-ideas` -> `developer`

## Rebuild Notes

To rebuild this behavior from the spec, start from the scenario and requirement:

- The scenario defines the user-visible command behavior and expected inbox state.
- The E2E test proves the command in an isolated project workspace and verifies
  observable command output plus the resulting inbox file state.
- The component identifies the command boundary and source file responsible for
  delivery.
- The requirement records persistence and confirmation obligations without
  duplicating the scenario's Gherkin text.

## Conflicts Found

- `product/journeys/capture-ideas.md` previously linked directly to the scenario
  file from the journey step. This bypassed the use-case layer, so this slice now
  routes the journey through `capture_ideas`.
- `specs/traceability-contract.yml` described requirements but did not define
  components as first-class trace artifacts. The contract now includes the
  component artifact and scenario-test-component-requirement queries needed by
  the canonical chain.
- Architecture documentation for the full derivation model is deferred to #50.
  This slice is the current repo-native example for component and requirement
  hops.
