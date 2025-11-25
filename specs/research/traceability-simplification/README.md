# Research: Traceability Simplification

## Metadata

| Field | Value |
|-------|-------|
| Status | `active` |
| Created | 2025-11-25 |
| Timebox | 3 days |
| Decision | _TBD_ |
| Related Features | udd/cli |

## Question

Should UDD maintain bidirectional linking between use cases and features, or simplify to one-way?

## Context

Current model has two linking mechanisms:
1. Use cases reference scenarios via `outcomes[].scenarios[]`
2. Features have `use_cases: []` field (backlink)

In practice:
- Many features have empty `use_cases: []`
- Links are manually maintained
- Neither direction is validated

## Current State

### Artifacts and links

```
Vision.use_cases[] → Use Case files
Use Case.outcomes[].scenarios[] → Scenario files
Feature.use_cases[] → Use Case files (backlink, often empty)
```

### Problems identified

1. **Orphaned scenarios** - Scenarios not referenced by any use case
2. **Empty backlinks** - Features don't list their use cases
3. **Overlapping purpose** - Both use cases and features "group scenarios"
4. **Manual maintenance** - No automation or validation

## Alternatives

### Option A: Enforce bidirectional linking

Require both directions and validate in `udd lint`.

**Changes:**
- `udd lint` fails if feature has empty `use_cases`
- `udd lint` fails if use case references non-existent scenario
- Scaffolding commands auto-link both directions

**Pros:**
- Complete traceability
- Audit-friendly

**Cons:**
- More maintenance burden
- Scaffolding complexity

### Option B: Simplify to one-way (Recommended)

Remove `use_cases` from features. Use cases are the only linking point.

**Changes:**
- Remove `use_cases` field from `_feature.yml` schema
- Features become organizational containers only
- Use cases are the traceability layer

**New model:**
```
Vision → Use Cases → Scenarios → Tests
              ↑
         Features (organizational only, no links)
```

**Pros:**
- Simpler model
- Less to maintain
- Clear single source of truth

**Cons:**
- Lose feature-to-use-case visibility
- May complicate "which use case does this feature serve?"

### Option C: Invert the relationship

Features reference use cases, use cases don't reference scenarios directly.

**Cons:**
- Major refactor
- Breaks existing files

## Evaluation Criteria

| Criterion | Weight | Option A | Option B | Option C |
|-----------|--------|----------|----------|----------|
| Simplicity | 3 | Low | High | Low |
| Traceability | 2 | High | Medium | Medium |
| Maintenance | 3 | High effort | Low effort | High effort |
| Migration cost | 2 | Medium | Low | High |

## Findings

### 2025-11-25: Current usage audit

Features with empty `use_cases: []`:
- `udd/agent/_feature.yml`
- `udd/dev-experience/_feature.yml`
- `udd/cli/inbox/_feature.yml`
- `udd/cli/wip_support/_feature.yml`
- `udd/agent/wip_support/_feature.yml`

Features with populated `use_cases`:
- `udd/cli/_feature.yml` → validate_specs, scaffold_specs, run_tests
- `opencode/orchestration/_feature.yml` → orchestrated_iteration
- `opencode/tools/_feature.yml` → orchestrated_iteration

**Conclusion:** Backlinks are inconsistently maintained.

## Decision

_TBD - Pending review_

## Proposed Changes

If Option B is selected:

1. Remove `use_cases` from `FeatureSpecSchema`
2. Update scaffolding to not generate the field
3. Update existing `_feature.yml` files to remove field
4. Update `udd status` to not report feature-use case links

## Follow-up

- [ ] Review and decide
- [ ] If approved, update schema and existing files
