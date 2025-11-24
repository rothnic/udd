# User Driven Development (UDD) Tool

A CLI tool for managing feature development through a spec-first, test-driven workflow. Specs are the source of truth—features are only done when their E2E tests pass.

## Quick Start

```bash
# Check project health
udd status

# Run tests
npm test

# See what to do next (use in Copilot Chat)
# @iterate
```

## The UDD Workflow

```
Vision → Use Case → Feature → Scenario → Test → Code
```

1. Define **what** users need (Use Cases with Outcomes)
2. Specify **how** it works (Gherkin Scenarios)  
3. Verify with **tests** (E2E tests)
4. Implement **code** (only after failing test exists)

## Project Structure

```
specs/
├── VISION.md              # Goals, phases, roadmap
├── use-cases/*.yml        # User outcomes to achieve
├── features/<area>/<feature>/
│   ├── _feature.yml       # Feature metadata
│   └── *.feature          # Gherkin scenarios
└── requirements/*.yml     # Technical requirements

tests/e2e/<area>/<feature>/*.e2e.test.ts  # Tests matching scenarios
src/                                       # Implementation code
```

## CLI Commands

```bash
# Scaffolding
udd new use-case <id>
udd new feature <area> <name>
udd new scenario <area> <feature> <slug>

# Validation & Status
udd lint      # Validate spec structure
udd status    # Show health and progress
udd test      # Run all tests
```

## Copilot Integration

This project includes custom prompts and an agent for Copilot:

| Resource | Purpose |
|----------|---------|
| `@iterate` | Autonomous project maintenance (start here!) |
| `@roadmap` | Phase-based progress view |
| `@scaffold` | Create new specs |
| `@udd` | Full workflow guidance |

See [CONTRIBUTING.md](CONTRIBUTING.md) for the full workflow documentation.

## Phased Development

Work is organized into phases. Tag scenarios with `@phase:N` to defer:

```gherkin
@phase:2
Feature: Future Work
  Scenario: Will implement in phase 2
```

Deferred work automatically becomes active when the phase advances.

## Documentation

- [CONTRIBUTING.md](CONTRIBUTING.md) - Development workflow
- [.github/LEARNINGS.md](.github/LEARNINGS.md) - Patterns and insights
- [specs/VISION.md](specs/VISION.md) - Project vision and roadmap
