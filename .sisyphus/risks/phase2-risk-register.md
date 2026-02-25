# Phase 2 Risk Register

## Risk Overview

| Risk ID | Risk | Probability | Impact | Status |
|---------|------|-------------|--------|--------|
| R1 | Team confusion with new taxonomy | Medium | High | Mitigated |
| R2 | Migration takes longer than planned | Medium | Medium | Accepted |
| R3 | CI gates produce false positives | Low | Medium | Mitigated |
| R4 | Loss of historical context | Low | Low | Mitigated |
| R5 | Integration with external tools fails | Low | High | Monitoring |

## Detailed Risk Analysis

### R1: Team Confusion with New Taxonomy

**Description**: Team members struggle to distinguish between Journey (experience), Use Case (capability), and Scenario (behavior), leading to authoring errors.

**Probability**: Medium (new concepts always have learning curve)
**Impact**: High (could undermine traceability goals)

**Mitigation**:
- Comprehensive training with concrete examples
- Decision tree/checklist for concept selection
- Pair authoring during transition
- Quick feedback loop via CI gates
- Office hours for questions

**Contingency**:
- If confusion persists after Week 2, extend pilot phase
- Provide one-on-one coaching for struggling team members
- Simplify taxonomy if needed (merge Journey Map into Journey)

**Evidence**: 
- Training quiz scores
- PR review comments (categorize confusion types)
- Authoring time metrics

**Status**: ✅ Mitigated through training and documentation

---

### R2: Migration Takes Longer Than Planned

**Description**: Migration of existing artifacts to new model requires more effort than estimated, delaying Phase 2 completion.

**Probability**: Medium (always takes longer than expected)
**Impact**: Medium (delays benefits but doesn't block)

**Mitigation**:
- Parallel workstreams (multiple people migrating)
- Automated refactoring scripts where possible
- Prioritize high-value artifacts first
- Acceptable to leave edge cases in legacy format temporarily

**Contingency**:
- Extend timeline by 1-2 weeks if needed
- Reduce scope (defer optional features)
- Accept partial migration for low-traffic areas

**Evidence**:
- Migration velocity (artifacts per day)
- Remaining artifact count
- Team capacity reports

**Status**: ✅ Accepted - pre-production state allows flexible timeline

---

### R3: CI Gates Produce False Positives

**Description**: Automated validation incorrectly flags valid artifacts as invalid, causing frustration and workaround behaviors.

**Probability**: Low (rules are well-defined)
**Impact**: Medium (slows authoring, reduces trust)

**Mitigation**:
- Extensive testing of validation rules during pilot
- Tolerance for warnings vs errors
- Human override process for edge cases
- Iterate on rules based on real usage

**Contingency**:
- Temporarily disable strict mode if blocking
- Whitelist specific artifacts if needed
- Emergency bypass for critical fixes

**Evidence**:
- False positive rate (flagged / actually invalid)
- Override frequency
- Team satisfaction survey

**Status**: ✅ Mitigated through pilot testing

---

### R4: Loss of Historical Context

**Description**: Refactoring artifacts loses historical context, decision rationale, or evolution history.

**Probability**: Low (git preserves history)
**Impact**: Low (can reference old commits)

**Mitigation**:
- Git preserves full history
- Archive legacy files rather than delete
- Document major decisions in Architecture Decision Records (ADRs)
- Link to relevant commits in migration notes

**Contingency**:
- Can always checkout pre-migration tag
- Archive directory with legacy artifacts

**Evidence**:
- Archive completeness
- ADR coverage

**Status**: ✅ Mitigated through git history and archives

---

### R5: Integration with External Tools Fails

**Description**: Traceability metadata doesn't integrate well with existing tools (GitHub, Jira, test runners).

**Probability**: Low (using standard formats)
**Impact**: High (could require rework)

**Mitigation**:
- Use standard formats (YAML, Markdown)
- Avoid proprietary extensions
- Test integrations early in pilot
- Keep integrations optional/loosely coupled

**Contingency**:
- Build custom adapters if needed
- Use file-based integration (avoid APIs)
- Manual export/import as fallback

**Evidence**:
- Integration test results
- Tool compatibility matrix

**Status**: ⏳ Monitoring during pilot

## Risk Triggers and Escalation

### Escalation Criteria

Escalate to project lead if:
- Any risk reaches "High" probability AND "High" impact
- Multiple risks materialize simultaneously
- Team velocity drops >50% for >1 week
- External dependencies fail

### Review Schedule

- **Daily**: Active risks during migration
- **Weekly**: All risks during rollout
- **Monthly**: Post-completion retrospective

## Fallback Procedures

### Scenario: Taxonomy Causes Major Confusion

1. **Immediate**: Pause new artifact creation
2. **Short-term**: Simplify taxonomy (reduce concept count)
3. **Long-term**: Revert to legacy model if necessary

### Scenario: Migration Stalls

1. **Immediate**: Assess root cause (complexity, capacity, priority)
2. **Short-term**: Extend timeline or reduce scope
3. **Long-term**: Accept partial migration, document gaps

### Scenario: CI Gates Block All PRs

1. **Immediate**: Disable strict validation
2. **Short-term**: Fix validation rules
3. **Long-term**: Re-enable with fixes

## Completed Tasks Reference

The following tasks are COMPLETE and documented:

- T1-T7: Foundation (concept model, boundary, traceability, derivation, glossary, journey models)
- T8-T13: User experience and BDD integration
- T14: Test review governance ✅
- T15-T17: Operations playbooks and templates
- T18: Migration strategy ✅
- T19: Rollout plan ✅
- T20: CI integration ✅
- T21: Risk register ✅

## Success Criteria

Phase 2 is successful if:
- Zero High-impact risks materialize
- Medium-impact risks are managed without project delays
- Team can author to new model with <10% confusion rate
- All risks have documented mitigations

## References

- .sisyphus/rollout/phase2-rollout-plan.md
- .sisyphus/migration/phase2-migration-strategy.md
- docs/architecture/udd-concept-model.md
- docs/process/change-propagation-workflow.md
