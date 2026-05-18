# Goal Gap Assessment (2026-05-11)

## Project Goal (Documented)

UDD aims to be a spec-first workflow where:
- user journeys are requirements,
- BDD scenarios are executable tests,
- and status/traceability is visible from objective → journey → scenario → test.

This intent is documented in the root README and the project vision.

## What Was Recently Done

Recent commits indicate focused hardening work on edge cases and CLI diagnostics:

- `feat(cli): improve error handling and add --doctor mode`
- `test: add E2E tests for edge cases`
- `chore(specs): link edge-case scenarios via use case and add PR draft`

This aligns with existing commands and specs that now include:
- health/diagnostic checks in `udd status --doctor`,
- recovery and edge-case behavior coverage in CLI feature/e2e tests,
- expanded use-case/spec linkage for edge-case handling.

## Current Strengths

1. **Traceability foundations exist**
   - Manifest-based linking of journeys and scenarios is implemented.
   - Status command exposes missing, stale, orphaned, and failing conditions.

2. **Executable-spec workflow is represented in tests**
   - Rich `specs/features/**` and matching `tests/e2e/**` structure exists.
   - CLI flows (status/sync/lint/setup/validation) are tested.

3. **Requirement-quality guidance exists**
   - SysML-informed discovery docs and feature templates are present.

## Gaps to Reach “Usable for Managing Executable Specs Traced to Objectives and User Flows”

1. **Objective-level traceability is now enforced in lint (completed)**
   - The repo has vision/use-case artifacts, but there is no single enforced, machine-checked chain from objective → journey → feature/scenario → test result.
   - `udd status` reports journey/scenario/test health, but not objective attainment rollups.

2. **Model inconsistency across “old” and “new” spec structures**
   - The codebase uses both journey-driven paths (`product/journeys`, `specs/.udd/manifest.yml`) and use-case/feature hierarchies (`specs/use-cases`, `specs/features/**`).
   - Without strict normalization rules, users can struggle to know canonical source of truth in mixed projects.

3. **`udd` command discoverability/runtime setup friction**
   - In this environment, `udd status` was not runnable from PATH (`command not found`), indicating packaging/dev bootstrap friction.
   - A “usable manager” needs one obvious local-dev invocation path documented and validated in CI (e.g., `npx udd ...` or `npm run udd -- ...`).

4. **Sync-to-test generation promise vs current behavior clarity**
   - Docs describe `udd sync` proposing/generating scenarios and test stubs, but user expectations around exact generation behavior and paths can be ambiguous with multiple command families (`new scenario`, `new feature`, `discover feature`).

5. **Portfolio-level status outputs are not yet decision-ready**
   - Current status is strong for diagnostics, but leaders need summary views such as:
     - objective progress percentages,
     - untested critical flows,
     - stale journey impact ranking,
     - release readiness per objective.

## Recommended Next Steps (Prioritized)

1. **Define and enforce a canonical traceability graph (P0)**
   - Add a strict schema and validator for objective → journey → scenario → test mapping.
   - Extend `udd validate` (or add `udd trace`) to fail on broken links.

2. **Add objective-aware status rollups (P0)**
   - Extend `udd status --json` with objective nodes and computed progress.
   - Add human-readable rollups in `udd status` for “Objective Health”.

3. **Unify spec structure or codify dual-mode operation (P1)**
   - Decide whether `specs/use-cases` + `specs/features` becomes canonical, or remains compatibility mode.
   - Document migration and enforce one-mode linting unless explicitly configured.

4. **Tighten developer/runtime onboarding (P1)**
   - Ensure documented commands work out-of-the-box (`npx udd status` and/or `npm run udd -- status`).
   - Add CI checks that verify command availability and basic happy-path invocations.

5. **Clarify command intent and generation contracts (P1)**
   - Explicitly document, per command, what gets generated, where, and what remains manual.
   - Add examples mapping journey step formats to generated scenario/test outputs.

6. **Add management-facing reports (P2)**
   - Introduce machine-consumable dashboard JSON (objective coverage, risk hotspots).
   - Add optional markdown report generation for planning/review meetings.

## Suggested Execution Plan (2-3 Iterations)

- **Iteration 1:** Traceability schema + validator + status JSON extension for objective rollups.
- **Iteration 2:** Structure normalization decision + migration docs + lint enforcement.
- **Iteration 3:** Usability polish (command bootstrap, docs simplification, management report command).

## Success Criteria for “Usable Management”

- Every objective can be traced to journeys, scenarios, and test outcomes automatically.
- Broken trace links fail validation.
- `udd status` answers both developer and manager questions in one run.
- A new project can run the workflow from init → sync → test → status without command ambiguity.