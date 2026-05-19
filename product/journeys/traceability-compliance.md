# Journey: Ensure UDD Traceability Compliance

**Actor:** Developer
**Actor IDs:** developer
**Goal:** Verify that product intent, roadmap use cases, scenarios, tests, and
implementation requirements stay connected as UDD evolves.

## Context

UDD should dogfood its own traceability model. This journey is future product
intent for issue #51; this foundation PR records the intent and makes the
current roadmap explicit without importing the validation CLI or test-governance
implementation.

The roadmap is the current classification source:

- Active or delivered journeys are represented by `specs/roadmap.yml`
  `phases[].use_cases[]` entries.
- Deferred use cases that already belong to a capability are represented by
  `phases[].use_cases[]` entries with `status: future` and a `follow_up` issue.
- Deferred journeys that do not yet belong to an executable capability slice are
  represented by `specs/roadmap.yml` `backlog_journeys[]` entries with a
  `follow_up` issue.
- Scenario ids belong in `scenarios` or `future_scenarios`.
- Feature paths belong in `scenario_paths` or `future_scenario_paths`.

## Steps

1. Read `specs/roadmap.yml` to identify current and deferred product journeys.
2. Validate that every active or delivered use case links to scenario ids and
   scenario paths.
3. Validate that every deferred use case or backlog journey has an exact
   `follow_up` issue.
4. Validate requirement and component artifacts against
   `specs/traceability-contract.yml`.
5. Report gaps as actionable source-of-truth drift instead of silently creating
   generated state.

## Success Criteria

- Every current product journey is represented by a roadmap use case or a
  `backlog_journeys` entry.
- Every current roadmap use case has canonical scenario ids, with feature paths
  stored separately when path lookup is needed.
- Every deferred use case and backlog journey references the issue that owns
  its executable slice.
- Strict traceability validation is implemented and passing in the #51 slice.

## Related

- `specs/roadmap.yml` - Current journey/use-case classification
- `specs/traceability-contract.yml` - Traceability artifact contract
- #51 - Phase and traceability CLI foundation
