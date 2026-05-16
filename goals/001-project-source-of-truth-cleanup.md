# Goal: Project Source Of Truth Cleanup

## Agent Entry

- Goal file: `goals/001-project-source-of-truth-cleanup.md`
- Command: `/goal goals/001-project-source-of-truth-cleanup.md`
- PR target: one focused PR for source-of-truth cleanup and current-phase gates

## Objective

Make the repo's source-of-truth model coherent and enforceable. Vision must be
the stable project-purpose and backlog-foundation document, roadmap must own
current progress state derived from that vision, and current-phase stub tests
must fail the appropriate project health gates.

## Context

- `specs/VISION.md` is stable future vision and must not store active phase or
  mutable progress state. It should remain the foundation for deriving new
  backlog when no backlog is available.
- `specs/roadmap.yml` owns current phase, phase assignments, and capability
  timing derived from the vision.
- Current project docs may still blur VISION's stable purpose role with mutable
  phase state.
- `udd test status --dirty` reports dirty tests and stub assertions, but
  `udd doctor` is clean unless stub checking is requested.
- Current-phase stub tests should have been caught by default in the relevant
  gate. Future-phase stubs may be allowed only with explicit phase deferral.

## Scope

In scope:
- Align VISION, roadmap, status, query, validation, and test docs so VISION
  remains the stable purpose/backlog foundation and phase state has one owner.
- Make current-phase stub assertions fail an explicit default gate used by
  status/doctor/CI flows.
- Remove or relocate one-off status files and accidental source files.
- Fix tool boundaries so checks do not traverse external workspaces or generated
  local state.

Out of scope:
- Replacing every existing stub assertion with real test logic.
- Redesigning the derivation model.
- Building Codex/OpenCode integration utilities beyond documenting cleanup
  findings for Goal 003.

## Required Inputs

- Source docs:
  - `specs/VISION.md`
  - `specs/roadmap.yml`
  - `docs/architecture/phase3-final-state-vision.md`
  - `docs/testing/troubleshooting-stubs.md`
  - `product/journeys/validate-phase-consistency.md`
  - `specs/features/udd/compliance/phase-consistency-validation.feature`
- Commands to inspect:
  - `udd status`
  - `udd doctor --check-stubs`
  - `udd health-check --json`
  - `udd test status --dirty`
  - `npm run check`
- History/context to inspect:
  - `git log -- specs/VISION.md specs/roadmap.yml src/lib/phase.ts`
  - `.memsearch/sessions/` entries mentioning current phase, stubs, and
    OpenCode phase deferral

## Tasks

1. Replace only claims that `specs/VISION.md` owns mutable `current_phase`;
   preserve and strengthen claims that VISION owns stable project purpose and
   backlog derivation.
2. Update shared phase-loading code so current phase is read from
   `specs/roadmap.yml`, with VISION parsing only as a legacy fixture fallback.
3. Update tests or fixtures that create VISION as mutable phase state so they use
   roadmap state instead.
4. Make stub assertion detection fail by default for current and prior phases in
   the gate that agents and CI are expected to run.
5. Keep future-phase stub handling explicit: allowed only when tagged for a
   future phase, linked to a future-phase scenario, or documented with a TODO and
   issue link.
6. Audit root and hidden source directories for accidental files such as
   one-off command output, generated local state, stale status docs, external
   symlinks, or duplicate planning artifacts.
7. Remove, ignore, or convert accidental artifacts only when the correct source
   of truth is clear. Otherwise record a follow-up in the PR.

## Review Subtask

Review the docs and project tree before final verification. Specifically check:
- Whether derivation, roadmap, phase, and vision docs conflict.
- Whether one-off status documents such as assessment reports or draft PR notes
  should remain in source.
- Whether root files such as accidental command-output files belong in source.
- Whether `.opencode`, `.memsearch`, `.sisyphus`, `memory`, `verbose`, `dot`,
  `spec`, or external symlinks should be source, generated state, or examples.

Record cleanup decisions and deferred cleanup items in the PR summary.

## Explicit Checks

The goal is complete only when these checks are true:
- [ ] `specs/VISION.md` contains no current phase or active progress state.
- [ ] `specs/VISION.md` clearly defines project purpose and how new backlog is
      founded when no backlog exists.
- [ ] `specs/roadmap.yml` is the only current-phase source for project code.
- [ ] Current-phase stub assertions cause the chosen health/gate command to
      fail.
- [ ] Future-phase stubs are either ignored by phase filtering or documented as
      deferred with a traceable reason.
- [ ] `npm run check` does not traverse external workspaces through symlinks.
- [ ] Cleanup findings are listed in the PR summary.

## Measurables

- External workspace diagnostics from `npm run check`: 0.
- Current-phase stub tests allowed by the default gate: 0.
- References to VISION as mutable phase-state source: 0 outside legacy fallback
  code or migration notes.
- References to VISION as stable purpose/backlog foundation: preserved or
  strengthened where relevant.

## Verification Commands

```bash
udd status
udd doctor --check-stubs --strict
udd health-check --json
udd test status --dirty
npm run check
```

If `npm test` hangs, isolate the smallest failing/hanging test file and report
the cause instead of leaving the process running.

## PR Notes

The PR body must include:
- Source-of-truth changes.
- Stub-gate behavior before and after.
- Root/hidden-directory cleanup findings.
- Verification output summary.
- Deferred cleanup with exact follow-up goal paths.
