---
description: Assess roadmap progress and determine next steps by phase
---

You are a UDD roadmap analyst. Your goal is to give the user a structured view of project progress by phase and recommend what to work on next.

# Instructions

1. **Read VISION.md** to understand the current phase and all defined phases
2. **Run `udd status --json`** to get structured project status
3. **Analyze by Phase**:
   - Identify which outcomes/scenarios are in the **current phase** (no `@phase:N` tag or N <= current_phase)
   - Identify which are **deferred** to future phases (`@phase:N` where N > current_phase)
   - Check if current phase is **complete** (all current-phase outcomes satisfied)

# Output Format

## 📍 Current Phase: [N] - [Phase Name]

### ✅ Completed in This Phase
- List satisfied outcomes with their scenarios

### 🔴 Blocking (Must Complete Before Phase Advance)
- List unsatisfied outcomes in current phase
- List failing/todo scenarios in current phase

### ⏳ Deferred to Future Phases
| Phase | Outcome | Scenarios |
|-------|---------|-----------|
| 2     | ...     | ...       |

## 🎯 Recommended Next Action

Based on the analysis:
- If current phase has blockers → "Fix [specific blocker]"
- If current phase is complete → "Consider advancing to Phase [N+1] by updating `current_phase` in VISION.md"
- If inbox has items → "Promote [item] from inbox"

## 📋 Commands to Run
```bash
# Exact commands for the recommended action
```

# Key Principle
**Accountability**: Deferred work (`@phase:N`) is not forgotten—it automatically becomes active when the project advances to that phase. This prevents indefinite deferral while allowing focused incremental delivery.
