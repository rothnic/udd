# Journey: Validate Phase Consistency

**Actor**: Developer, Team Lead  
**Goal**: Detect drift between roadmap (VISION.md) and executable specs (@phase tags)

## Context

UDD uses VISION.md to define the current development phase and roadmap, while feature files use @phase:N tags to indicate which phase they belong to. These can drift:

- VISION.md says `current_phase: 3` (OpenCode Integration)
- Feature files have @phase:4 tags (Agent Intelligence phase)
- No automated validation catches this mismatch

This leads to confusion about what work is in scope and can cause teams to work on future-phase features prematurely.

## Steps

1. Parse VISION.md to extract current_phase and phase definitions → `specs/features/udd/compliance/phase-consistency-validation.feature`
2. Scan all feature files for @phase:N tags → `tests/e2e/udd/compliance/phase_consistency_validation.e2e.test.ts`
3. Compare phase tags against current_phase
4. Report mismatches and suggest corrections
5. Validate phase numbering is sequential (no gaps)

## Success Criteria

- Detect when feature @phase tags exceed VISION.md current_phase
- Warn when roadmap says Phase 3 but features are tagged Phase 4
- Suggest which features should be in current phase based on journey links
- Validate phase numbers are sequential without gaps
- Validation runs as part of `udd validate --strict`

## Related

- `specs/VISION.md` - Phase definitions and current phase
- `specs/features/opencode/*` - Features with @phase:4 tags
- `docs/sysml-informed-discovery.md` - Traceability principles

