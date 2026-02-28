# Research BDD traceability and test-review templates (@librarian subagent)

**ID**: ses_36d6b49f9ffcAX4UAhW34fyf9H
**Project ID**: ad761ea6174e58ed763fc75290c3f403ed51079d
**Created**: 2/24/2026, 8:15:45 PM
**Stats**: 1 files changed, +58 -0

---

## USER (8:15:45 PM)

Date: 2026-02-25

Decision: Proceed to Phase 2

Summary
-------
Based on Phase 1 artifacts and verification runs, we will proceed to Phase 2 with targeted work to address identified gaps. The core closed-loop traceability for the capture_task -> mobile_widget use case is confirmed and tests passed; risks and remaining work are listed below and form the entry criteria for Phase 2.

Evidence from Phase 1
---------------------
- TaskFlow Validation Report: docs/project/TASKFLOW-VALIDATION-REPORT.md
  - Phase 1 executed over two weeks and produced four-layer artifacts for the capture_task use case (journeys, specs, tests, verification artifacts). (report lines 6-15, 41-48)
  - Tests and sync/status workflows exercised; `npm run check` reported no lint issues during validation. (report lines 15, 47)

- Framework updates and guidance: docs/project/TASKFLOW-FRAMEWORK-UPDATES.md
  - Recommends metadata (change-intent, last-reviewed-by) and an automated re-verification concept to map changed specs to affected tests via .udd/manifest.yml (file references lines 10-12, 17-19, 55-61).
  - Contains pragmatic next steps for small scripts and CI additions to support focused re-runs and YAML validation. (lines 62-67)

- Product verification evidence: product/VALIDATION.md
  - Layer 1 and Layer 4 verification entries marked VERIFIED, with explicit mappings to implementation and unit tests (src/services/task_service.ts, tests/unit/services/task_service.test.ts). (lines 13-26, 15-23)
  - Full-chain traceability for capture_task -> mobile_widget documented and recorded as CLOSED LOOP on 2026-02-24; E2E and unit tests passed on that date. (lines 47-66)

- Test review summary: tests/e2e/tasks/quick_capture/review-summary.md
  - Targeted tests (mobile_widget, voice_input) reviewed and passing as of 2026-02-24; prior stale failure was resolved by adding the missing step implementation. (lines 14-18, 24-26)

Risks and Open Gaps
-------------------
- Automated re-verification missing: Phase 1 documented the need for a runner that, on spec change, re-runs affected tests and produces suggested patches. This is not yet implemented (see TASKFLOW-VALIDATION-REPORT.md lines 28-36 and FRAMEWORK-UPDATES.md lines 11-12, 62-67).
- Stale-detection heuristics produce noise: heuristics need clearer rules and optional metadata to reduce false positives (TASKFLOW-VALIDATION-REPORT.md lines 21-31, FRAMEWORK-UPDATES.md lines 10-12, 47-49).
- Reporting and CI YAML validation: consolidated reporting (`udd status --report`) and lightweight YAML checks for review artifacts are recommended but not present. This affects observability when faster iteration is needed (FRAMEWORK-UPDATES.md lines 12, 21-23, 62-67).
- Scope limited to one use case: Phase 1 validated only capture_task; Phase 2 must expand to at least two additional use cases to increase confidence (validation report lines 23-24, recommendation line 39).

Entry Criteria for Phase 2
--------------------------
Phase 2 may start once the following are in place or explicitly accepted as deferred to Phase 2 backlog items:

1) Confirmation of proceed (this decision record).
2) A prioritized backlog that includes:
   - implement focused re-run helper (script or small tool) that reads .udd/manifest.yml to identify and run affected tests (FRAMEWORK-UPDATES.md lines 62-66).
   - add metadata to feature templates and at least one sample feature (mobile_widget) with `change-intent` and `last-reviewed-by`. (FRAMEWORK-UPDATES.md lines 27-31, 64)
   - CI job to run a lightweight YAML validation for review artifacts. (FRAMEWORK-UPDATES.md lines 21-23, 51-52)
3) Sanity checks executed locally: run `npm run check` (no lint errors) and confirm targeted tests run (evidence below). The project check ran successfully on 2026-02-25 with biome output: "Checked 64 files... No fixes applied."

Immediate Next Actions (Phase 2 first sprint)
---------------------------------------------
1) Implement focused re-run helper prototype (scripts/focused-rerun.js or similar). Deliverable: small script + README with usage and example `npm test` invocation. Target: merge as an opt-in tool. Reference: docs/project/TASKFLOW-FRAMEWORK-UPDATES.md lines 62-66.
2) Update feature template and add metadata to the sample feature (specs/features/tasks/quick_capture/mobile_widget.feature) to include `# change-intent:` and `# last-reviewed-by:` fields. Target: one sample updated, template updated. Reference: FRAMEWORK-UPDATES.md lines 27-31, 64.
3) Add CI step for YAML validation: small Node script or use an existing linter to validate required fields in review YAMLs. Deliverable: CI job or optional local script. Reference: FRAMEWORK-UPDATES.md lines 21-23, 51-52.
4) Expand validation scope: select two additional use cases to validate in Phase 2. Suggested candidates: voice_input (already has tests) and a second unrelated use case to stress cross-cutting concerns. Reference: TASKFLOW-VALIDATION-REPORT.md line 39.
5) Run focused test reruns after each change and record results in artifacts (tests/e2e/.../review-issues.md and .udd/results.json) to maintain closed-loop evidence.

Explicit outcome
----------------
Proceed to Phase 2, conditional on the prioritized backlog and the quick sanity checks noted in Entry Criteria. The repository demonstrates closed-loop traceability for the validated use case and passing tests; Phase 2 will address automation, heuristics, and reporting gaps to scale confidence beyond one use case.

Signature
---------
Decision recorded by: Sisyphus-Junior automation


