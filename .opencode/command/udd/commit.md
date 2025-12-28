---
description: Commit current changes with UDD-style message
agent: quick-code
---

# /udd/commit Command

Prepare and execute a commit following UDD conventions.

## Current State

### Git Status
!`git status`

### Changed Files
!`git diff --stat HEAD`

## Commit Guidelines

### Message Format
```
<type>(<scope>): <subject>

<body>
```

### Types
- `feat`: New feature (maps to scenario)
- `fix`: Bug fix
- `spec`: Specification changes
- `test`: Test additions/changes
- `refactor`: Code restructuring
- `docs`: Documentation
- `chore`: Maintenance

### Scope
Use the feature area (e.g., `cli`, `agent`, `lib`)

### Subject
- Imperative mood ("add" not "added")
- No period at end
- Max 50 characters

### Body
- Reference the scenario if applicable
- Explain WHY, not just WHAT

## Commit Check

Before committing, verify:
1. [ ] Tests pass (or failing test is intentional for TDD red phase)
2. [ ] Changes relate to current work item
3. [ ] No unrelated changes mixed in
4. [ ] Message describes the user value

## Suggested Commit

Based on the staged changes, suggest an appropriate commit message that follows the format above.
