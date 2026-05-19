# Journey: Enforce Quality Gates

**Actor:** Team/Lead
**Goal:** Block commits with dirty tests

## Context

Teams struggle to maintain test quality over time. Tests accumulate with vague names, outdated assertions, and unclear ownership. Without enforcement, dirty tests slip through code review and degrade confidence in the test suite.

Problems compound when:

- Tests run green but do not actually verify behavior
- Warnings accumulate until they become noise that everyone ignores
- Engineers learn to work around quality checks instead of fixing root causes
- CI passes while the test suite quietly rots

Quality gates prevent this by catching problems at commit time, before they infect the codebase.

## Steps

1. Install hooks → `specs/features/udd/test-governance/hooks-installation.feature`
   Set up pre-commit and pre-push hooks that validate test quality before allowing commits

2. Pre-commit validation → `specs/features/udd/test-governance/pre-commit-validation.feature`
   Run quick quality checks locally that block commits with dirty tests, warnings, or unlinked tests

3. CI integration → `specs/features/udd/test-governance/ci-validation.feature`
   Enforce quality gates in CI to catch anything that bypassed local hooks

## Success Criteria

- Dirty commits are blocked with clear error messages explaining what failed and why
- Enforcement levels are configurable (strict, warn-only, disabled per check)
- Local hooks catch 90%+ of quality issues before CI
- CI gates never pass when quality checks fail
- Error messages include specific remediation steps
