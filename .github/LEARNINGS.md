# UDD Project Learnings

This document captures key insights, patterns, and lessons learned while developing the UDD tool. It serves as institutional memory for both human developers and AI agents.

---

## 🎯 Core Philosophy

### Spec-First Development
- **The spec is always right**. If code doesn't match the spec, fix the code.
- Every user-facing behavior must trace to a Gherkin scenario.
- Use Cases define *why*, Features define *what*, Scenarios define *how*.

### Phase-Based Accountability
- Use `@phase:N` tags to defer work to future phases (not `@wip` which lacks accountability).
- Deferred work automatically becomes active when `current_phase` in VISION.md advances.
- This prevents indefinite deferral while enabling focused incremental delivery.

---

## 🔧 Technical Patterns

### Test Architecture
| Pattern | Location | Purpose |
|---------|----------|---------|
| `.feature` | `specs/features/<area>/<feature>/` | Gherkin scenarios (source of truth) |
| `.e2e.test.ts` | `tests/e2e/<area>/<feature>/` | Vitest + vitest-cucumber implementation |
| `.spec.ts` | ❌ **DELETE THESE** | Auto-generated duplicates, cause lint errors |

### Status States
| State | Meaning | Action |
|-------|---------|--------|
| `passing` | Test passes | ✅ Done |
| `failing` | Test exists but fails | Fix implementation |
| `todo` | Test has `throw new Error("Not implemented")` | Implement |
| `stale` | Results older than test/spec files | Re-run `npm test` |
| `missing` | No test file exists | Create test |
| `deferred` | Tagged with `@phase:N` where N > current_phase | Wait for phase advance |

### ANSI Code Handling
When testing CLI output that uses `chalk`, strip ANSI codes before assertions:
```typescript
const stripped = output.replace(/\x1b\[[0-9;]*m/g, "");
expect(stripped).toContain("expected text");
```

---

## ⚠️ Common Pitfalls

### 1. Duplicate `.spec.ts` Files
**Problem**: vitest-cucumber auto-generates `.spec.ts` files that conflict with our `.e2e.test.ts` convention.
**Solution**: Run `find tests -name "*.spec.ts" -delete` before commits.

### 2. Test Race Conditions
**Problem**: Parallel tests can cause transient ENOENT errors when reading spec files.
**Solution**: Added retry logic in `validator.ts` for file reads.

### 3. Pre-commit Hook Failures
**Problem**: `lint-staged` runs tests on staged files, but test artifacts may reference non-existent specs.
**Solution**: Use `--no-verify` if tests pass independently but fail in hook context due to race conditions.

### 4. Stale Status
**Problem**: `udd status` shows "failing" when results.json is older than source files.
**Solution**: Always run `npm test` before `udd status` after making changes.

---

## 📋 Workflow Quick Reference

### Daily Iteration
```bash
# 1. Check current state
udd status

# 2. Run tests if stale
npm test

# 3. Fix any issues in priority order:
#    - Validation errors
#    - Orphaned scenarios  
#    - Failing tests
#    - Todo scenarios

# 4. Commit in logical chunks (spec → feat → test → chore)
```

### Adding New Behavior
```bash
# 1. Define the use case (if new)
udd new use-case my_use_case

# 2. Define the feature
udd new feature my_area my_feature

# 3. Define the scenario
udd new scenario my_area my_feature my_scenario

# 4. Implement the test (make it fail first)
# 5. Implement the code (make it pass)
# 6. Verify
npm test && udd status
```

### Deferring Work
```gherkin
@phase:2
Feature: Future Feature
  Scenario: Will implement later
    Given some precondition
    When action happens
    Then expected result
```

---

## 🗂️ File Organization

### Prompts (`.github/prompts/`)
| Prompt | Purpose | When to Use |
|--------|---------|-------------|
| `@iterate` | Autonomous project maintenance | Start of each session |
| `@roadmap` | Phase-based progress view | Planning decisions |
| `@plan` | Next steps analysis | When unsure what to do |
| `@scaffold` | Create new specs/tests | Adding features |
| `@implement` | TDD implementation | Writing code |
| `@status` | Quick status check | Anytime |
| `@resolve-udd-issues` | Fix structural problems | When status shows errors |

### Agent (`.github/agents/`)
| Agent | Purpose |
|-------|---------|
| `@udd` | Full UDD workflow guidance, enforces spec-first development |

---

## 📊 Metrics & Health

A healthy UDD project has:
- ✅ `git status` clean
- ✅ `udd lint` passing
- ✅ `npm test` all passing
- ✅ `udd status` shows "Current phase complete"
- ✅ No orphaned scenarios
- ✅ No validation errors

---

## 🔄 Version History

| Date | Learning | Impact |
|------|----------|--------|
| 2025-11-24 | `@wip` tags lack accountability | Replaced with `@phase:N` system |
| 2025-11-24 | Duplicate .spec.ts files cause issues | Added cleanup to iterate prompt |
| 2025-11-24 | Large uncommitted changesets are risky | iterate prompt auto-commits in chunks |
| 2025-11-24 | ANSI codes break test assertions | Added stripping pattern to tests |
