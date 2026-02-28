# Create framework updates documentation for Phase 1 (@Sisyphus-Junior subagent)

**ID**: ses_36e406cccffeY3WQC16o0cC3U7
**Project ID**: ad761ea6174e58ed763fc75290c3f403ed51079d
**Created**: 2/24/2026, 4:22:57 PM
**Stats**: 1 files changed, +68 -0

---

## USER (4:22:57 PM)

TaskFlow Framework updates after Phase 1 validation
=================================================

Purpose
-------
This note summarizes practical framework updates resulting from TaskFlow validation Phase 1 (capture_task). It ties recommendations to repo artifacts and gives concise how-to guidance for verification, templates, and troubleshooting.

1) Concept updates
------------------
- Explicit change-intent metadata for features and scenarios: add optional header fields to feature files such as `# change-intent: minor|major|doc` and `# last-reviewed-by: <name>` so the stale-detection logic can skip clearly intentional edits. See: specs/features/tasks/quick_capture/mobile_widget.feature (header uses `@phase:4`).
- Automated re-verification concept: when a spec file changes, identify affected tests (via .udd/manifest.yml traceability) and re-run those tests automatically, producing a small suggested patch for failing step implementations. Evidence: docs/project/TASKFLOW-VALIDATION-REPORT.md (Recommendations) and tests/e2e/tasks/quick_capture/review-issues.md (suggested automation).
- Compact reporting output: introduce `udd status --report` to emit scenario->test coverage and last-run statuses. Evidence: validation report lines 36-39 and product/VALIDATION.md traceability examples.

2) Verification procedure updates
---------------------------------
- Targeted re-run on spec changes: workflow
  1. Run `udd sync` to generate/update scenarios
  2. Run a focused test rerun on affected tests only (derive list from .udd/manifest.yml). Example affected test path: tests/e2e/tasks/quick_capture/mobile_widget.e2e.test.ts (see tests/e2e/tasks/quick_capture/review-issues.md).
  3. If tests fail due to missing step definitions, update step code or test assertions, then re-run the focused tests. The Phase 1 evidence shows re-running targeted tests restored passing status (review-issues.md lines 35-37).

- Add lightweight YAML validation in CI: run a simple YAML linter or schema check on review YAMLs and use-cases to surface syntactic issues when language servers are absent. Reference: review-issues.md environment notes.

- Layer verification checklist: include entries in product/VALIDATION.md for commands to run (`npm run check`, targeted npm test commands). Product evidence shows `npm run check` and unit/e2e tests executed as part of verification (product/VALIDATION.md lines 38-41).

3) Template usage guidance
-------------------------
- Feature header fields: recommend adding small metadata block at top of templates/feature-template.feature with keys:
  - change-intent: minor|major|doc
  - last-reviewed-by: <initials>
  - trace-id: <manifest path or UUID>

- When to use each command (recap):
  - `udd new scenario` for quick single-scenario work (creates flat spec + test stub)
  - `udd new feature` for SysML-rich templates (use when you need context and multiple scenarios)
  - `udd discover feature` for interview-driven features
  Evidence: README usage and templates section (README.md Feature Templates).

- Template note: include a small "verification hints" comment block in feature templates indicating the expected test paths and suggested focused test commands. Example: for quick_capture feature, add comment: `# expected-test: tests/e2e/tasks/quick_capture/<feature>.e2e.test.ts` so tools can recommend which tests to run after edits.

4) Troubleshooting guide
------------------------
- Symptom: Stale/failing test after a scenario edit
  - Check: Did the scenario gain a new step or change step text? See git diff for specs/features/<domain>.
  - Evidence: tests/e2e/tasks/quick_capture/review-issues.md reports `And task is synced to server` was added and caused a stale test.
  - Fix: Implement the missing step in the test harness or adjust the test assertion. Re-run focused test: `npm test -- tests/e2e/tasks/quick_capture/mobile_widget.e2e.test.ts`.

- Symptom: False positive stale detection
  - Check: Does the feature file include explicit `change-intent` metadata indicating editorial change? If yes, mark as reviewed and update manifest with `udd sync`.
  - If tooling cannot decide, add `# change-intent: doc` to skip re-verification and reduce churn.

- Symptom: Review YAMLs not validated in CI (yaml-language-server missing)
  - Fix: Add a minimal YAML schema check step in the CI job (simple node script or `yaml` npm package) to validate required fields for review YAMLs. This is lightweight and avoids language-server dependency.

Repository artifact references
---------------------------
- Validation report: docs/project/TASKFLOW-VALIDATION-REPORT.md
- Layer verification and evidence: product/VALIDATION.md
- Stale test review log: tests/e2e/tasks/quick_capture/review-issues.md
- Example feature and test: specs/features/tasks/quick_capture/mobile_widget.feature and tests/e2e/tasks/quick_capture/mobile_widget.e2e.test.ts
- Traceability manifest hint: specs/.udd/manifest.yml (generated by udd sync) — use this to map spec -> test for focused re-runs.

Next steps (practical)
----------------------
1. Adopt small metadata block in feature templates and update a sample feature (mobile_widget) to include `change-intent` and `last-reviewed-by`.
2. Implement a focused re-run helper that reads .udd/manifest.yml and runs `npm test` for the mapped tests. Start with a small script in tools/ or scripts/ and keep it optional.
3. Add a CI step for YAML validation and a `udd status --report` prototype that emits compact coverage.

End


