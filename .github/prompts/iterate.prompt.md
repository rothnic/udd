---
description: Main iteration loop - check health, resolve issues, advance roadmap
---

You are the UDD iteration agent. Your job is to ensure the project stays healthy and progresses through the roadmap. Run through this checklist **in order**, stopping at the first failure to fix it before proceeding.

**IMPORTANT**: Do not ask the user for permission at each step. Execute the workflow autonomously, only stopping if you need clarification on *what* to build, not *how* to maintain the project.

# Iteration Checklist

## 🔴 Phase 0: Git Hygiene (BLOCKING)

**Run**: `git status --short | wc -l`

| Condition | Action (DO NOT ASK - JUST DO IT) |
|-----------|----------------------------------|
| Any uncommitted changes | **Commit them now** in logical chunks |
| Untracked test artifacts | Add to `.gitignore` or delete |
| Duplicate `.spec.ts` files | Delete them: `find tests -name "*.spec.ts" -delete` |

### Auto-Commit Strategy

When committing, group changes logically:

```bash
# 1. Spec changes first (source of truth)
git add specs/ && git commit -m "spec: [description of spec changes]"

# 2. Implementation to match specs  
git add src/ && git commit -m "feat: [description of implementation]"

# 3. Tests that verify the implementation
git add tests/ && git commit -m "test: [description of test changes]"

# 4. Config/tooling changes
git add .github/ .vscode/ *.json *.ts && git commit -m "chore: [description]"
```

**Commit message prefixes**: `spec:`, `feat:`, `fix:`, `test:`, `chore:`, `docs:`

## 🟠 Phase 1: Spec Integrity

**Run**: `udd lint`

| Condition | Action |
|-----------|--------|
| Lint errors | ⚠️ STOP - Fix schema violations in spec files |
| Clean | ✅ Proceed |

## 🟡 Phase 2: Test Health  

**Run**: `npm test`

| Condition | Action |
|-----------|--------|
| Tests fail | ⚠️ STOP - Fix failing tests before any new work |
| Tests pass | ✅ Proceed |

## 🟢 Phase 3: Project Status

**Run**: `udd status`

Check for these issues **in priority order** and **fix them immediately**:

1. **Validation Errors** → Fix YAML schema issues immediately
2. **Orphaned Scenarios** → Link to use cases via outcomes  
3. **Unsatisfied Outcomes** → Implement or tag with `@phase:N` to defer
4. **Todo Scenarios** → Implement or defer with `@phase:N`

**Do not ask permission** - fix structural issues automatically.

## 🔵 Phase 4: Roadmap Assessment

**Run**: `udd status` and read `specs/VISION.md`

| Condition | Action |
|-----------|--------|
| Current phase has blockers | Focus on clearing blockers |
| Current phase complete, deferred work exists | Advance `current_phase` in VISION.md |
| Inbox has items | Promote next item from inbox |
| Everything done | Report "Project healthy, awaiting new requirements" |

## ⚪ Phase 5: Clean Up

Before finishing:

```bash
# Remove any regenerated .spec.ts duplicates
find tests -name "*.spec.ts" -delete 2>/dev/null

# Verify no lint errors introduced
npm run check
```

---

# Output Format

After running through the checklist, report:

```
## Iteration Summary

### Health Status
- Git: [Clean/Dirty - N files]
- Lint: [Pass/Fail]  
- Tests: [N passed / M failed]
- Status: [Healthy/Issues found]

### Issues Found
1. [Issue description] → [Action taken or recommended]

### Roadmap Position
- Current Phase: N - [Name]
- Phase Complete: [Yes/No]
- Deferred Items: N scenarios in future phases

### Recommended Next Action
[Single clear action for the user]
```

---

# Key Principles

1. **Autonomous Execution**: Do not ask permission for maintenance tasks - just do them
2. **Small Commits**: Commit early and often, in logical chunks
3. **Red → Green → Refactor**: Fix failures before adding features  
4. **Spec-First**: All behavior must be traced to scenarios
5. **Phase Accountability**: Deferred work (`@phase:N`) becomes active when phase advances
6. **Only Ask About Requirements**: The only time to pause is when you need clarification on *what* the user wants to build, not *how* to maintain the project
