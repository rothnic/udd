# Phase 2 Migration Strategy

## Executive Summary

This document outlines the migration strategy from the current UDD repository state to the Phase 2 SysML-informed traceability model. **No backwards compatibility is required** as the system is not yet in production.

## Migration Philosophy

Given we are pre-production, we take a **clean-slate approach**:
- No dual-mode operation needed
- No deprecation period required
- Full cutover in single migration
- Legacy artifacts archived, not maintained

## Migration Phases

### Phase 1: Inventory and Mapping (Week 1)

**Goal**: Catalog all existing artifacts and map to new taxonomy.

**Activities**:
1. **Legacy Inventory**
   ```bash
   # Find all journey files
   find product/journeys -name "*.md" -type f
   
   # Find all use case files
   find specs/use-cases -name "*.yml" -type f
   
   # Find all feature files
   find specs/features -name "*.feature" -type f
   
   # Find all e2e tests
   find tests/e2e -name "*.e2e.test.ts" -type f
   ```

2. **Concept Mapping**
   | Legacy Concept | Phase 2 Concept | Action |
   |----------------|-----------------|--------|
   | Journey (mixed) | Journey (experience only) | Refactor to narrative format |
   | Journey (steps) | Journey Map | Extract to .map.yml |
   | Use Case | Use Case (capability) | Keep, add boundary markers |
   | Feature | Scenario | Rename/reorganize |
   | Test | E2E Test | Keep, add metadata |

3. **Gap Analysis**
   - Identify missing use-case links
   - Find orphaned scenarios
   - Detect duplicate coverage

**Deliverables**:
- `.sisyphus/migration/legacy-inventory.yml` - Complete artifact list
- `.sisyphus/migration/concept-mapping.yml` - Mapping decisions
- `.sisyphus/migration/gap-report.md` - Issues to address

### Phase 2: Structural Refactoring (Week 2)

**Goal**: Restructure repository to new layout.

**Directory Changes**:

```
Before:
product/journeys/
  daily_planning.md          -> Refactor

specs/features/
  udd/
    cli/
      setup.feature          -> Keep (capability-oriented)

After:
product/journeys/
  daily_planning.md          -> Experience narrative only
  daily_planning.map.yml     -> NEW: Step-to-use-case mapping
  daily_planning.manifest.yml -> NEW: Link registry

specs/use-cases/
  capture_task.yml           -> Add boundary markers

specs/features/
  udd/
    cli/
      setup.feature          -> Unchanged
```

**File Transformations**:

1. **Journey Refactoring**
   ```yaml
   # OLD: product/journeys/daily_planning.md
   # Journey with embedded capability details
   
   # NEW: product/journeys/daily_planning.md
   # Pure experience narrative
   
   # NEW: product/journeys/daily_planning.map.yml
   journey_map:
     steps:
       - id: capture-ideas
         use_case_ref: capture-task
         trigger: user_opens_app
   ```

2. **Use Case Updates**
   ```yaml
   # Add to existing use-case files
   boundary:
     subject: udd-core
     scope: internal
   ```

**Validation**:
```bash
# After each batch
npm run check
udd validate --strict
npm test -- --run
```

### Phase 3: Metadata Enrichment (Week 3)

**Goal**: Add Phase 2 required metadata.

**Required Fields per Artifact Type**:

| Artifact | Required Fields |
|----------|----------------|
| Journey | id, title, actor, stages[] |
| Journey Map | id, version, steps[].use_case_ref |
| Use Case | id, boundary.subject, actors[] |
| Scenario | id, feature path, tags[] |
| E2E Test | id, scenario_path, tags[] |
| Component | id, implements_use_cases[] |
| Requirement | id, type, attaches_to[] |

**Bulk Update Process**:

1. Generate metadata templates
2. Human review and population
3. Automated validation
4. Batch commit

**Example: Adding Scenario Metadata**

```gherkin
# OLD
Feature: CLI Setup
  Scenario: User runs setup command

# NEW
@phase:2 @capability:cli @journey:onboarding
Feature: CLI Setup
  # udd-journey: new-user-onboarding
  # udd-use-case: cli-setup
  Scenario: User runs setup command
```

### Phase 4: Traceability Linking (Week 4)

**Goal**: Establish forward and reverse trace links.

**Link Types**:

1. **Explicit Links** (in artifact files)
   - Journey Map → Use Case (use_case_ref)
   - Use Case → Scenario (outcomes[].scenarios)
   - Scenario → E2E Test (test metadata)
   - E2E Test → Requirement (requirement ids)

2. **Generated Links** (in .manifest.yml files)
   - Computed from explicit links
   - Reverse lookup tables
   - Impact graph

**Manifest Generation**:

```bash
# Auto-generate manifests
udd sync --generate-manifests

# Validate all links resolve
udd validate --strict
```

### Phase 5: Verification and Cutover (Week 5)

**Goal**: Final validation and activation.

**Verification Checklist**:

- [ ] All legacy artifacts mapped or archived
- [ ] New taxonomy artifacts pass validation
- [ ] All trace links resolve
- [ ] Tests pass
- [ ] Documentation updated
- [ ] Team trained on new model

**Cutover Steps**:

1. **Freeze Legacy**
   ```bash
   git tag pre-phase2-migration
   ```

2. **Apply Migration**
   ```bash
   git checkout -b phase2-migration
   # Apply all changes
   git merge phase2-migration
   ```

3. **Archive Legacy**
   ```bash
   mkdir -p .sisyphus/archive/pre-phase2
   mv product/journeys/*.md.bak .sisyphus/archive/pre-phase2/
   ```

4. **Activate Gates**
   - Enable CI checks
   - Enable udd validate --strict
   - Block PRs on traceability failures

## Rollback Plan

If critical issues arise:

1. **Immediate** (< 1 hour): Revert to pre-phase2 tag
2. **Short-term** (< 1 day): Fix forward in migration branch
3. **Long-term**: Accept state, document deviations

## Success Criteria

- Zero orphaned scenarios
- 100% use-case → scenario linkage
- All tests pass with new metadata
- CI gates enforce new policy
- Team can author to new model without confusion

## References

- docs/architecture/udd-concept-model.md
- docs/architecture/canonical-derivation-model.md
- docs/process/change-propagation-workflow.md
