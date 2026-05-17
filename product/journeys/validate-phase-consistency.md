# Journey: Validate Phase Consistency

**Actor**: Developer, Team Lead  
**Goal**: Keep vision-derived roadmap state aligned with executable specs (@phase tags)

## Context

UDD uses `specs/VISION.md` as the stable statement of project purpose and
`specs/roadmap.yml` as the derived, mutable planning state. Feature files use
@phase:N tags to indicate which phase they belong to. These can drift:

- VISION says agent integrations should be reusable across tools
- `specs/roadmap.yml` says `current_phase: opencode-integration` (legacy Phase 3 id, now named Agent Integration)
- Feature files have @phase:4 tags (Agent Intelligence phase)
- No automated validation catches this mismatch

This leads to confusion about what work is in scope, whether backlog items still
serve the vision, and whether teams are prematurely implementing future-phase
features.

## Steps

1. Read `specs/VISION.md` for stable project goals → `specs/features/udd/compliance/phase-consistency-validation.feature`
2. Parse `specs/roadmap.yml` to extract current phase and phase definitions
3. Scan all feature files for @phase:N tags → `tests/e2e/udd/compliance/phase_consistency_validation.e2e.test.ts`
4. Compare phase tags against current_phase
5. Report mismatches and suggest corrections
6. Validate phase numbering is sequential (no gaps)

## Success Criteria

- Detect when feature @phase tags exceed roadmap current phase
- Keep roadmap/current-phase decisions grounded in the stable vision
- Warn when roadmap says Phase 3 but features are tagged Phase 4
- Suggest which features should be in current phase based on journey links
- Validate phase numbers are sequential without gaps
- Validation runs as part of `udd validate --strict`

## Related

- `specs/VISION.md` - Stable project vision and backlog foundation
- `specs/roadmap.yml` - Derived phase definitions and current phase
- `specs/features/opencode/*` - Features with @phase:4 tags
- `docs/sysml-informed-discovery.md` - Traceability principles
