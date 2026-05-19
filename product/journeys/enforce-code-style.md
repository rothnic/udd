# Journey: Enforce Code Style

**Actor:** Developer, Agent
**Goal:** Ensure code styles are automatically applied and enforced

## Context

Consistent code style reduces cognitive load and makes code easier to review.
This journey automates style enforcement.

## Steps

1. Developer writes code
2. Pre-commit hooks run automatically → `specs/features/udd/dev-experience/commit_hooks.feature`
3. Imports are sorted, code is formatted → `specs/features/udd/dev-experience/code_formatting.feature`
4. Commit fails if style checks fail (can be overridden) → `specs/features/udd/dev-experience/code_formatting.feature`

## Success Criteria

- Imports are sorted automatically
- Code formatting is consistent
- Commits fail if style checks fail (unless overridden)

## Use Cases

- `specs/use-cases/enforce_code_style.yml` - Original use case (legacy)
