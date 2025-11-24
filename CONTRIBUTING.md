# Contributing to UDD

This document describes the development workflow and conventions for the UDD project.

## Quick Start

```bash
# Check project health
udd status

# Run tests (required if status shows "stale")
npm test

# Start iterating
# Use @iterate prompt in Copilot Chat for autonomous maintenance
```

## Development Workflow

### The UDD Cycle

```
Vision → Use Case → Feature → Scenario → Test → Code
```

1. **Vision** (`specs/VISION.md`) - High-level goals and phases
2. **Use Case** (`specs/use-cases/*.yml`) - User outcomes to achieve
3. **Feature** (`specs/features/<area>/<feature>/_feature.yml`) - Grouped functionality
4. **Scenario** (`specs/features/<area>/<feature>/*.feature`) - Gherkin specifications
5. **Test** (`tests/e2e/<area>/<feature>/*.e2e.test.ts`) - Executable verification
6. **Code** (`src/**`) - Implementation

### Key Principle: Spec is Truth

> If the code doesn't match the spec, **fix the code**, not the spec.

All behavior must be defined in Gherkin scenarios before implementation.

## Copilot Prompts

The project includes custom prompts for common workflows. Use them in Copilot Chat:

| Prompt | Purpose |
|--------|---------|
| `@iterate` | **Start here.** Autonomous project maintenance and iteration |
| `@roadmap` | View progress by phase, plan next steps |
| `@plan` | Analyze status and recommend next action |
| `@scaffold` | Create new use cases, features, or scenarios |
| `@implement` | TDD implementation workflow |
| `@resolve-udd-issues` | Fix structural problems in specs |

### Custom Agent

Use `@udd` for guided UDD workflow assistance.

## CLI Commands

```bash
# Scaffolding
udd new use-case <id>           # Create a use case
udd new feature <area> <name>   # Create a feature
udd new scenario <area> <feature> <slug>  # Create a scenario
udd new requirement <key>       # Create a technical requirement

# Validation
udd lint                        # Validate spec structure
udd status                      # Show project health and progress

# Testing
udd test                        # Run all tests
npm test                        # Same as above
```

## Phased Development

Work is organized into phases defined in `specs/VISION.md`:

```yaml
current_phase: 1
phases:
  1: "Core CLI & Validation"
  2: "Agent Intelligence"
  3: "Advanced Workflows"
```

### Deferring Work

Tag scenarios with `@phase:N` to defer to a future phase:

```gherkin
@phase:2
Feature: Future Feature
  Scenario: Deferred until phase 2
    Given ...
```

Deferred work:
- Does NOT block current phase completion
- Automatically becomes active when `current_phase` advances
- Prevents indefinite deferral (unlike `@wip`)

## Commit Conventions

Use these prefixes for commit messages:

| Prefix | Use For |
|--------|---------|
| `spec:` | Changes to specs (use cases, features, scenarios) |
| `feat:` | New implementation code |
| `fix:` | Bug fixes |
| `test:` | Test additions or fixes |
| `chore:` | Config, tooling, dependencies |
| `docs:` | Documentation only |

### Commit Order

When making related changes, commit in this order:
1. `spec:` - Spec changes first (source of truth)
2. `feat:` / `fix:` - Implementation
3. `test:` - Tests
4. `chore:` - Config/tooling

## File Conventions

### Test Files
- Use `.e2e.test.ts` extension (NOT `.spec.ts`)
- One test file per `.feature` file
- Mirror the `specs/features/` structure in `tests/e2e/`

### Feature Files
- `_feature.yml` - Feature metadata (required)
- `*.feature` - Gherkin scenarios

## Troubleshooting

### "Stale" status
Run `npm test` to refresh results.

### Duplicate `.spec.ts` files
Delete them: `find tests -name "*.spec.ts" -delete`

### Pre-commit hook failures
If tests pass independently but fail in hooks, use `--no-verify` (sparingly).

## More Information

- [LEARNINGS.md](.github/LEARNINGS.md) - Captured insights and patterns
- [specs/VISION.md](specs/VISION.md) - Project vision and roadmap
