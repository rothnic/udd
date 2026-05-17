# UDD Agent Operations Playbook

Purpose
-------
This playbook documents the agent operations workflow for UDD (User Driven Development). It defines the shared agent workflow, handoff protocol, and traceability update procedures so Codex, OpenCode, and future adapters behave consistently.

Shared integration contracts live under `integrations/shared/`. Adapter-specific
details live under `integrations/opencode/`, `integrations/codex/`, or the
runtime-native adapter directory.

Goal command contract
---------------------
Use `/goal goals/<file>.md` for goal-file execution. This command is
vendor-independent and resolves to the shared contract in
`integrations/shared/goal-command-contract.md`.

Every adapter must:

- Read the referenced goal file.
- Check current repo state before editing.
- Execute only that goal.
- Run the explicit checks named by the goal.
- Produce a PR-ready summary with objective, files changed, checks, cleanup
  findings, and deferred work.
- Wait for configured PR review comments and address comments relevant to the
  goal before completion.

Agent workflow (canonical)
--------------------------
1. Check status
   - Run `udd status` to determine journey → scenario → test coverage, and detect drift.
   - Inspect failing/pending scenarios and verify scope.

2. Suggest
   - Propose a minimal change plan: one journey/file/behavior at a time.
   - Create or update a journey file under `product/journeys/` when intent changes.
   - Record the proposed spec → feature mapping (e.g. `product/journeys/foo.md` → `specs/foo/create.feature`).

3. Confirm
   - Ask a human (or automated gate) to confirm the proposed plan before making repository changes.
   - For small edits, confirmation may be implicit via a designated review label or approval flow.

4. Apply
   - Run `udd sync` to generate or update feature files from journeys.
   - Implement code or tests to satisfy the scenarios. Follow repository conventions: small commits, one logical change per PR, and avoid modifying unrelated files.
   - If creating code, write failing tests first when possible.

5. Verify
   - Run tests: `npm test` (or repository-specific command). Ensure all BDD scenarios and unit tests pass.
   - Update traceability manifest: `specs/.udd/manifest.yml` (or follow project traceability steps) to reflect new mappings.
   - Run `udd status` again to confirm passing state and no orphaned journeys.

Handoff protocol
----------------
When pausing work or passing to another agent/person, include the following in the handoff note (in PR, issue, or handoff doc):

- Context: one-line summary of the user journey, actor, and goal.
- Files changed: list of new/updated files with purpose.
- Pending tasks: explicit next steps (one atomic task per todo).
- Verification steps: commands to run (`udd status`, `npm test`) and expected outcomes.
- Traceability: updated manifest entries or guidance to perform update.
- Blockers: any environment, secret, or missing evidence files.

Handoff example (template)
--------------------------
- Context: Add CSV export for reports (actor: analyst — goal: download CSV)
- Changed:
  - product/journeys/export_data.md (journey)
  - specs/export/export_csv.feature (scenarios)
  - tests/export/export_csv.e2e.test.ts (test harness)
- Next step: Implement API endpoint to stream CSV (one task)
- Verify: `udd status` shows scenario passing after tests; run `npm test`.

Traceability update steps
-------------------------
1. Update manifest
   - Open `specs/.udd/manifest.yml` (or the project's traceability file) and add an entry mapping journey → feature → test.

2. Cross-check
   - Ensure every journey listed in `product/journeys/` maps to a feature file in `specs/`.
   - Use `udd status` to surface mismatches.

3. Commit message guideline
   - Use intent-focused messages: `journey: export_data — add CSV export scenario` or `spec: export/create.feature — add failure mode`.

Verification checklist
----------------------
- [ ] `udd status` clean for the changed journey
- [ ] Feature files added/updated under `specs/`
- [ ] Tests added/updated under `tests/` and passing locally
- [ ] Traceability manifest updated
- [ ] Handoff note present in PR or issue when handing off

Guidelines and constraints
--------------------------
- Goal-file rule: when invoked through `/goal`, agents execute the referenced
  goal file end to end and do not add unrelated cleanup.
- Never implement behavior not specified by a journey, feature, or accepted goal
  file.
- Keep changes minimal and reversible: small commits, one focused PR, no force
  pushes to protected branches.
- Keep reusable workflow rules in `integrations/shared/`; adapter docs should
  point there instead of duplicating the canonical process.

Evidence and audit
------------------
- When evidence files or external artifacts are referenced, include their exact paths in the handoff note. Do not proceed if required evidence is missing unless explicitly authorized.

Appendix: Quick commands
------------------------
- udd status — show journey → scenario → test coverage
- udd sync — convert journeys to feature files
- npm test — run test suite
- npm run check — run repository checks (lint, typecheck, test subset)
- /goal goals/<file>.md — execute one goal through the shared agent contract

Change history
--------------
- T16: Initial agent operations playbook (created for Task 16: Agent flow and handoff)
- 2026-05-17: Added vendor-independent `/goal` contract and adapter/shared
  integration routing.
