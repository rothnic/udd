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
Vision → [Research] → Use Case → Feature → [Tech Spec] → Scenario → Test → Code
```

1. **Vision** (`specs/VISION.md`) - High-level goals and phases
2. **Research** (`specs/research/<id>/`) - Resolve uncertainty (when needed)
3. **Use Case** (`specs/use-cases/*.yml`) - User outcomes to achieve
4. **Feature** (`specs/features/<area>/<feature>/_feature.yml`) - Grouped functionality
5. **Tech Spec** (`specs/features/<area>/<feature>/_tech-spec.md`) - Implementation details (when needed)
6. **Scenario** (`specs/features/<area>/<feature>/*.feature`) - Gherkin specifications
7. **Test** (`tests/e2e/<area>/<feature>/*.e2e.test.ts`) - E2E verification
8. **Unit Tests** (`tests/unit/**/*.test.ts`) - Component verification (traced from tech spec)
9. **Code** (`src/**`) - Implementation

### Key Principle: Spec is Truth

> If the code doesn't match the spec, **fix the code**, not the spec.

All behavior must be defined in Gherkin scenarios before implementation.

## Branching Strategy

```
main                              # Stable, all tests pass
  └── phase/<n>                   # Active development phase
        ├── feat/<area>/<feature> # One branch per feature
        └── research/<id>         # Research investigations
```

### Branch Workflow

1. **Start feature**: `git checkout -b feat/<area>/<feature> phase/<n>`
2. **Complete feature**: PR to `phase/<n>`, squash merge
3. **Complete phase**: PR to `main` when phase objectives met

### Research Branches

Research branches only merge documentation (learnings), not prototype code:
- `git checkout -b research/<id> phase/<n>`
- Investigate, document findings in `specs/research/<id>/README.md`
- Prototype code stays LOCAL (never committed)
- Merge README.md to phase branch when decided

## Research Workflow

Use research when facing uncertainty:

| Uncertainty | Example |
|-------------|---------|
| **Value** | "Is this feature worth building?" |
| **Technical** | "What's the best approach?" |
| **Feasibility** | "Can we do this within constraints?" |

### Research Process

```bash
udd new research <id>              # Scaffold research
git checkout -b research/<id>      # Create branch
# ... investigate, update README.md ...
udd research decide <id>           # Record decision
git checkout phase/<n>
git merge research/<id>            # Merge learnings only
```

### Linking Research to Features

```yaml
# _feature.yml
id: llm-validation
requires_research: true            # Blocks scenarios until decided
research: llm-validation-approach  # Links to specs/research/<id>/
```

See [specs/research/README.md](specs/research/README.md) for full documentation.

## Tech Specs

Tech specs document **how** to implement complex features and trace to unit tests.

### When to Use

- Feature has non-trivial architecture
- Multiple implementation options exist
- Unit test coverage requirements are specific

### Structure

```
specs/features/<area>/<feature>/
  _feature.yml      # What & why
  _tech-spec.md     # How (implementation details)
  *.feature         # Behavior (Gherkin)
```

### Unit Test Tracing

Tech specs include a test coverage table:

```markdown
| Component | Test File | Test Cases |
|-----------|-----------|------------|
| `parseConfig()` | `tests/unit/config.test.ts` | `parses valid`, `rejects invalid` |
```

This ensures every implementation detail has corresponding tests **before** coding.

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
