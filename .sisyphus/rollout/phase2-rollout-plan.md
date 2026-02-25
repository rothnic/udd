# Phase 2 Rollout Plan

## Overview

Incremental rollout of UDD Phase 2 traceability model over 4 weeks.

## Week-by-Week Schedule

### Week 1: Foundation and Pilot

**Focus**: Core team adoption and feedback

**Activities**:
- Day 1-2: Team training on new concepts
- Day 3-5: Pilot with 1-2 journeys

**Pilot Scope**:
- `product/journeys/daily_planning.md` (refactor to new model)
- `specs/use-cases/capture_task.yml` (add boundary markers)
- Related scenarios and tests

**Success Metrics**:
- Team can explain Persona vs Journey vs Use Case
- Pilot artifacts pass `udd validate --strict`
- Zero critical bugs in pilot

**Go/No-Go Gate**:
- [ ] Team feedback collected and positive
- [ ] Pilot artifacts validated
- [ ] Documentation gaps identified and addressed

### Week 2: Capability Expansion

**Focus**: Expand to all capabilities

**Activities**:
- Refactor all remaining journeys
- Update all use cases with boundary markers
- Migrate all scenarios to capability-oriented organization

**Batch Approach**:
1. CLI capabilities (highest confidence)
2. Core domain capabilities
3. Edge case capabilities

**Validation per Batch**:
```bash
npm run check
udd validate --strict
npm test -- tests/e2e/<capability>/
```

**Success Metrics**:
- 80% of capabilities migrated
- All migrated artifacts pass validation
- Test coverage maintained or improved

### Week 3: Full Migration

**Focus**: Complete migration and tooling

**Activities**:
- Complete remaining 20% migration
- Generate all journey manifests
- Activate CI gates

**CI Gate Activation**:
```yaml
# .github/workflows/ci.yml updates
- name: Traceability Validation
  run: |
    udd lint
    udd validate --strict
```

**Success Metrics**:
- 100% migration complete
- All PRs pass traceability checks
- Zero manual traceability exceptions

### Week 4: Hardening and Scale

**Focus**: Stabilization and process refinement

**Activities**:
- Monitor CI gate effectiveness
- Tune validation rules
- Document lessons learned
- Train extended team

**Metrics Review**:
- Traceability coverage: target 100%
- False positive rate: target < 5%
- Authoring time: baseline vs new

## Pilot Team Selection

### Criteria

1. **Availability**: Can dedicate time to migration
2. **Expertise**: Deep knowledge of current UDD model
3. **Influence**: Respected by broader team
4. **Feedback**: Willing to provide candid feedback

### Recommended Pilot Team

- 1 Tech Lead (decision authority)
- 2 Senior Engineers (implementation)
- 1 PM/Designer (concept validation)

## Success Metrics

### Adoption Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Artifacts migrated | 100% | `udd status` |
| Validation pass rate | 100% | CI logs |
| Team trained | 100% | Attendance + quiz |
| Documentation clarity | >4/5 | Post-training survey |

### Quality Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Traceability coverage | 100% | `udd validate` |
| Orphaned scenarios | 0 | Automated scan |
| Test flakiness | <2% | CI history |
| Build time | <10min | CI duration |

### Velocity Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Authoring time | Baseline | Time tracking |
| Review cycles | <2 | PR data |
| Onboarding time | <2 days | New hire survey |

## Go/No-Go Gates

### Gate 1: Pilot Complete (End Week 1)

**Criteria**:
- [ ] Pilot artifacts pass all validation
- [ ] Pilot team gives positive feedback
- [ ] Critical bugs resolved
- [ ] Documentation sufficient for next phase

**Decision**: Proceed to Week 2, or extend pilot

### Gate 2: 80% Migration (End Week 2)

**Criteria**:
- [ ] 80% of artifacts migrated
- [ ] No blocking issues
- [ ] Test coverage maintained
- [ ] Team adoption rate >80%

**Decision**: Proceed to Week 3, or address gaps

### Gate 3: Full Migration (End Week 3)

**Criteria**:
- [ ] 100% migration complete
- [ ] CI gates active and passing
- [ ] All documentation updated
- [ ] Rollback plan tested

**Decision**: Proceed to Week 4, or fix critical issues

### Gate 4: Production Ready (End Week 4)

**Criteria**:
- [ ] All quality metrics met
- [ ] Extended team trained
- [ ] Support process documented
- [ ] Lessons learned captured

**Decision**: Declare Phase 2 complete, or extend hardening

## Risk Mitigation

### Risk: Team Resistance

**Mitigation**:
- Early involvement in design
- Clear value proposition
- Adequate training
- Quick wins in pilot

### Risk: Migration Takes Longer

**Mitigation**:
- Parallel workstreams
- Automated refactoring tools
- Acceptable scope reduction
- Extended timeline option

### Risk: Validation False Positives

**Mitigation**:
- Tune rules during pilot
- Escape hatch for edge cases
- Human override process
- Iterative refinement

## Communication Plan

### Week 1

- **Monday**: Kickoff meeting (all hands)
- **Wednesday**: Pilot team sync
- **Friday**: Week 1 retrospective

### Week 2-3

- **Daily**: Standup updates
- **Weekly**: Progress demo
- **Ad-hoc**: Office hours

### Week 4

- **Monday**: Final training
- **Wednesday**: Completion demo
- **Friday**: Celebration + retro

## References

- .sisyphus/migration/phase2-migration-strategy.md
- docs/architecture/udd-concept-model.md
- docs/process/udd-user-playbook.md
