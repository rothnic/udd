# Create T16 udd-agent-operations.md (@Sisyphus-Junior subagent)

**ID**: ses_36a2af843ffeEPkTHJLWuA046j
**Project ID**: ad761ea6174e58ed763fc75290c3f403ed51079d
**Created**: 2/25/2026, 11:24:52 AM
**Stats**: 3 files changed, +359 -0

---

## USER (11:26:00 AM)

# Template Refactor Guide

Purpose
- Provide a clear path to align existing templates with the Phase 2 concept taxonomy (journeys, capabilities, scenarios, manifests).
- Record legacy field deprecations and provide a compliance checklist for authors and automated checks.

Scope
- This guide applies to template files under `templates/` and to any new journey or feature templates used by `udd` commands.
- Do not edit evidence files or change existing templates as part of this migration. Create updated templates separately and follow the checklist below.

Concept taxonomy mapping
- Journey (product/journeys/*.md)
  - Narrative: human-facing story, actor, goal, steps, success criteria.
  - Manifest: small traceable mapping to scenarios in `specs/` (example: steps referencing `specs/.../*.feature`).
  - Template alignment: journey templates must include Actor, Goal, Steps, Success, and explicit references to scenario paths.

- Capability (specs/features/<capability>/)
  - Narrative: capability README describing actor, constraints, and scope.
  - Manifest: `_feature.yml` that provides feature id and list of scenarios.
  - Template alignment: feature templates should focus on a single user goal and include the mandatory metadata block (id, capability, actor, goal, priority, created_by, created_at).

- Scenario (specs/**/*.feature)
  - Narrative: Gherkin scenarios (happy path, alternatives, errors, edge cases, performance). Use the SysML-informed feature template for guidance.
  - Manifest: scenario metadata block at top (YAML-style comment block) matching schema in docs/architecture/scenario-metadata-policy.md.
  - Template alignment: include preamble metadata, structured Background, and Scenario sections following existing `templates/feature-template.feature` prompts.

- Manifest (specs/.udd/manifest.yml)
  - Purpose: traceability between journeys and scenarios. Journeys will reference scenario ids; manifest stores hashes for staleness detection.

Journey template patterns (narrative + map + manifest)
- Narrative: A short human-readable page that answers Who, What, Why, Success. Keep example steps minimal but actionable.
- Map: For each step list the corresponding scenario path in code fences. Use arrows and `specs/...` references (example: "1. User signs up → `specs/auth/signup.feature`").
- Manifest snippet: Add a small code block example showing how the journey maps to manifest entries, for maintainers to update `specs/.udd/manifest.yml` when syncing.

Example journey template (pattern)

```
# Journey: {{JOURNEY_NAME}}

**Actor:** {{ACTOR}}
**Goal:** {{GOAL}}

## Steps

1. {{STEP_1}} → `specs/{{DOMAIN}}/{{ACTION}}.feature`

## Success

{{SUCCESS_CRITERIA}}

<!-- Manifest mapping (example) -->
```

Legacy field deprecations
- Deprecated: `feature`-centric `id` usages in product/journeys frontmatter. Use `id` only inside scenario metadata and `_feature.yml` manifests under `specs/features`.
- Deprecated: `phase` inline markers outside metadata block. Move `@phase:N` into the preamble metadata block as `phase: N` when possible or keep `@phase:N` as a temporary migration alias.
- Deprecated: `goal_detail`, `owner`, and `ticket` freeform fields inside journey files. Replace with standardized fields: `actor`, `goal`, `created_by`, `created_at`, and `related`.

Migration notes
- Do not modify existing templates or evidence files directly. Produce new templates and run `udd sync` in a branch to verify generated scenarios.
- When migrating legacy journeys or scenarios, follow these steps:
  1. Copy legacy content into new journey template, fill Actor and Goal fields.
  2. Replace deprecated fields with the standard metadata keys.
  3. Add explicit scenario path references for each step.
  4. Update `specs/.udd/manifest.yml` by running `udd sync` which will compute new hashes and detect staleness.

Checklist for template compliance
- File-level
  - [ ] Journey templates include: Actor, Goal, Steps, Success.
  - [ ] Feature templates include mandatory metadata block: id, capability, actor, goal, priority, created_by, created_at.
  - [ ] Scenario templates include YAML-style metadata preamble and `@phase:N` if phase > 1.

- Content-level
  - [ ] Goals are one-line, user-outcome focused.
  - [ ] Alternatives section documents rejected and chosen approaches with reasons.
  - [ ] Success criteria are measurable and testable.
  - [ ] Scenarios include happy path, at least one error case, and at least one edge case.

- Manifest & traceability
  - [ ] Each journey lists exact `specs/...` paths for its steps.
  - [ ] All scenario `id` values are unique across `specs/` and `product/journeys/` metadata blocks.
  - [ ] Capability tag in scenario metadata matches parent directory name.

- Deprecation checks
  - [ ] No use of deprecated fields (`goal_detail`, `owner`, `ticket`) in new templates.
  - [ ] `phase` is specified via `@phase:N` preamble or converted to `phase: N` in metadata.

Automated checks to add or run
- Repository CI should run `npm run check` which must include:
  - Metadata presence and schema validation for `specs/**/*.feature`.
  - `id` uniqueness check across `specs/` and `product/journeys/`.
  - Capability tag matches directory name.
  - No deprecated fields present in new templates (scan templates/ and product/journeys/ during validation).

Examples and references
- SysML-informed feature template: `templates/feature-template.feature`
- Journey template example: `templates/product/journeys/_template.md`
- Scenario metadata policy: `docs/architecture/scenario-metadata-policy.md`

Verification
- After creating or updating templates, run:

```
npm run check
```

If checks fail, fix template content until all items pass.

Appendix: Quick mapping table

| Concept | Location | Required fields |
| Journey | product/journeys/*.md | Actor, Goal, Steps, Success |
| Capability | specs/features/<cap>/ | _feature.yml, README, feature files |
| Scenario | specs/**/*.feature | metadata preamble (id, capability, actor, goal, priority, created_by, created_at) |


# UDD Agent Operations Playbook

Purpose
-------
This playbook documents the agent operations workflow for UDD (User Driven Development). It defines the agent workflow, handoff protocol, and traceability update procedures so agent work is consistent, auditable, and verifiable.

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
-----------------
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
- Single-task rule: agents should accept exactly one atomic task at a time (one file, one change, one verification). If multiple tasks are given, refuse and request a single-task instruction.
- Never implement behavior not specified by a journey or feature — ask for clarification.
- Keep changes minimal and reversible: small commits, no force pushes to protected branches.

Evidence and audit
------------------
- When evidence files or external artifacts are referenced, include their exact paths in the handoff note. Do not proceed if required evidence is missing unless explicitly authorized.

Appendix: Quick commands
------------------------
- udd status — show journey → scenario → test coverage
- udd sync — convert journeys to feature files
- npm test — run test suite
- npm run check — run repository checks (lint, typecheck, test subset)

Change history
--------------
- T16: Initial agent operations playbook (created for Task 16: Agent flow and handoff)


