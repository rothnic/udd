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
