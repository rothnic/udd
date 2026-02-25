# Test Review Governance

## Overview

This document defines the governance model for test reviews in the UDD Phase 2 traceability system. It establishes the review lifecycle, gate criteria, and rejection handling to ensure test quality and traceability integrity.

## Review Lifecycle

### State Machine

```
proposed → reviewed → [approved | rejected] → revised → reviewed → verified
```

**States:**

- **proposed**: Test is authored and ready for review. Initial state.
- **reviewed**: Reviewer has examined the test. Decision pending.
- **approved**: Reviewer accepts the test. Test moves to verified state.
- **rejected**: Reviewer identifies issues. Test returns to author for revision.
- **revised**: Author has addressed rejection feedback. Returns to review.
- **verified**: Final state. Test is authoritative and traceable.

### State Transitions

| From | To | Trigger | Responsible |
|------|-----|---------|-------------|
| proposed | reviewed | Reviewer starts review | Reviewer |
| reviewed | approved | Meets all gate criteria | Reviewer |
| reviewed | rejected | Fails any gate criterion | Reviewer |
| rejected | revised | Author addresses feedback | Author |
| revised | reviewed | Resubmitted for review | Author |
| approved | verified | Final sign-off | System/Lead |

## Review Gate Checklist

### Required Checks

- [ ] **Traceability**: Test references valid scenario path
- [ ] **Coverage**: Test covers the requirement/use case it claims to
- [ ] **Isolation**: Test is independent (no hard dependencies on other tests)
- [ ] **Determinism**: Test produces consistent results
- [ ] **Evidence**: Test produces reviewable artifacts (logs, screenshots)
- [ ] **Naming**: Test follows naming conventions (kebab-case, descriptive)
- [ ] **Metadata**: Required metadata fields populated

### Quality Checks

- [ ] **Readability**: Test steps are clear and maintainable
- [ ] **Speed**: Test completes within reasonable time bounds
- [ ] **Cleanup**: Test cleans up resources (no pollution)
- [ ] **Documentation**: Test has adequate inline documentation

## Rejection Criteria

Tests SHALL be rejected for:

1. **Missing traceability**: No valid scenario reference
2. **Flakiness**: Non-deterministic behavior
3. **Side effects**: Modifies global state without cleanup
4. **False coverage**: Claims to test requirement but doesn't
5. **Performance**: Exceeds time budget without justification
6. **Security**: Contains hardcoded credentials or unsafe operations

Tests MAY be rejected for:

1. **Style violations**: Naming or formatting issues
2. **Documentation gaps**: Insufficient explanation
3. **Redundancy**: Duplicates existing test coverage
4. **Complexity**: Unnecessarily complicated test structure

## Rejection Workflow

### Step 1: Document Rejection

When rejecting a test, the reviewer MUST record:

- Rejection reason (select from criteria above)
- Specific issues found
- Required changes for approval
- Reference to relevant documentation

Format:
```yaml
review:
  id: review-001
  test: tests/e2e/feature/test-name.e2e.test.ts
  status: rejected
  reason: missing_traceability
  issues:
    - "No scenario_path in test metadata"
    - "Cannot trace to requirement REQ-123"
  required_changes:
    - "Add scenario_path: specs/features/.../scenario.feature"
    - "Link to requirement in test metadata"
  reviewer: reviewer-name
  date: 2024-01-15
```

### Step 2: Notify Author

Rejection triggers notification to test author via:
- PR comment (for PR-based workflows)
- CI failure annotation
- Dashboard notification

### Step 3: Author Revision

Author addresses rejection by:
1. Fixing identified issues
2. Updating test metadata
3. Re-running tests locally
4. Resubmitting for review

### Step 4: Re-review

Revised tests undergo full review again. Previous rejection does not prejudice review.

## Exception Handling

### Emergency Bypass

In exceptional circumstances (critical bug fix, production incident), tests may bypass review with:
- Explicit override flag
- Post-hoc review within 24 hours
- Incident documentation

### Disputed Rejections

If author disagrees with rejection:
1. Escalate to tech lead
2. Provide justification for dispute
3. Lead makes binding decision
4. Document decision rationale

## Automation Integration

### Pre-review Checks

Automated gates run before human review:

```bash
# Lint and format
npm run check

# Traceability validation
udd validate --strict

# Test execution
npm test -- --run

# Coverage threshold
npm run test:coverage -- --threshold=80
```

Failures block human review until resolved.

### Review Assignment

Tests are auto-assigned to reviewers based on:
- Component ownership (CODEOWNERS)
- Recent activity in area
- Workload balancing
- Expertise matching

## Metrics and Monitoring

### Review Metrics

Track:
- Time in review (target: < 24 hours)
- Rejection rate (target: < 20%)
- Revisions per test (target: < 2)
- Reviewer workload distribution

### Quality Indicators

Monitor:
- Post-approval test failures
- Regression escape rate
- Flaky test rate
- Coverage trend

## References

- docs/architecture/udd-concept-model.md
- docs/process/change-propagation-workflow.md
- specs/traceability-contract.yml
