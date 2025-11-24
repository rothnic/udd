---
id: "udd_tool"
name: "User Driven Development Tool"
version: "0.0.1"
current_phase: 1
phases:
  1: "Core CLI & Validation"
  2: "Research & Tech Specs"
  3: "OpenCode Integration"
  4: "Agent Intelligence"
  5: "Advanced Workflows"
goals:
  - "Make user-facing scenarios the single source of truth"
  - "Keep everything simple, discoverable, and deterministic"
  - "Enforce guardrails against spec/test tampering"
  - "Enable autonomous iteration via OpenCode integration"
use_cases:
  - "validate_specs"
  - "check_status"
  - "orchestrated_iteration"
---

# Vision

The UDD tool provides a CLI to manage the lifecycle of features in a User Driven Development process. It ensures that specs are the source of truth and that features are only considered done when their E2E tests pass.

## Branching Strategy

```
main                              # Stable, all tests pass
  └── phase/<n>                   # Active development phase
        ├── feat/<area>/<feature> # One branch per feature
        └── research/<id>         # Research investigations
```

### Branch Rules

| Branch | Purpose | Merges To |
|--------|---------|-----------|
| `main` | Stable baseline | - |
| `phase/<n>` | Phase development | `main` when phase complete |
| `feat/<area>/<feature>` | Feature implementation | `phase/<n>` |
| `research/<id>` | Investigation (docs only) | `phase/<n>` |

### Workflow

1. **Start phase**: `git checkout -b phase/1 main`
2. **Start feature**: `git checkout -b feat/cli/status phase/1`
3. **Complete feature**: PR to `phase/1`, squash merge
4. **Complete phase**: PR to `main`, merge when objectives met

### Research Branches

- Only commit `specs/research/<id>/README.md`
- Prototype code stays local (never committed)
- Merge learnings document, delete branch

## Phase Objectives

### Phase 1: Core CLI & Validation ✅
- Basic scaffolding commands
- Spec validation (lint)
- Status reporting

### Phase 2: Research & Tech Specs
- Research workflow and commands
- Tech spec scaffolding
- Unit test tracing

### Phase 3: OpenCode Integration
- Custom tools for structured status (`udd-status`, `udd-next`)
- Orchestrator plugin for autonomous iteration
- JSON output mode for machine consumption
- Configurable iteration limits and pause conditions

### Phase 4: Agent Intelligence
- Copilot integration improvements
- Autonomous maintenance
- Smart suggestions

### Phase 5: Advanced Workflows
- Spec change tracking
- Migration tools
- Team collaboration features

## References

*   [Custom Agent File Structure](https://code.visualstudio.com/docs/copilot/customization/custom-agents#_custom-agent-file-structure)
*   [Prompt Files](https://code.visualstudio.com/docs/copilot/customization/prompt-files)

