# Journey: Ensure UDD Traceability Compliance

**Actor:** Developer
**Actor IDs:** developer
**Goal:** Verify that product intent, roadmap use cases, scenarios, tests, and
implementation requirements stay connected as UDD evolves.

## Context

UDD should dogfood its own traceability model. This journey is implemented in
the issue #51 phase/traceability foundation by resolving concise journey and
use-case references into canonical scenario file paths, while leaving broader
requirement/component validation for later slices.

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

1. Author a journey step with a concise use-case reference → `specs/features/udd/compliance/traceability_validation.feature`
2. Resolve that use-case reference through `specs/use-cases/*.yml` to canonical scenario file paths → `specs/features/udd/compliance/traceability_validation.feature`
3. Store the resolved scenario file paths in the sync manifest → `specs/features/udd/compliance/traceability_validation.feature`
4. Leave broader requirement/component validation for a later traceability slice.

## Success Criteria

- Use-case ids resolve to canonical scenario feature files.
- Direct feature file references remain supported for existing journeys.
- `udd sync` stores resolved scenario feature paths in `specs/.udd/manifest.yml`.
- Broader requirement/component validation remains outside the #51 slice.

## Related

- `specs/roadmap.yml` - Current journey/use-case classification
- `specs/traceability-contract.yml` - Traceability artifact contract
- #51 - Phase and traceability CLI foundation
