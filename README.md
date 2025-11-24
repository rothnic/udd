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
Vision → [Research] → Use Case → Feature → [Tech Spec] → Scenario → Test → Code
```

1. Define **what** users need (Use Cases with Outcomes)
2. **Research** uncertainty when needed (Analysis of Alternatives)
3. Specify **how** it works (Gherkin Scenarios)
4. Document **implementation** details (Tech Specs with unit test tracing)
5. Verify with **tests** (E2E tests + unit tests)
6. Implement **code** (only after failing test exists)

## Project Structure

```
specs/
├── VISION.md              # Goals, phases, roadmap
├── use-cases/*.yml        # User outcomes to achieve
├── research/<id>/         # Research investigations
│   └── README.md          # Single source of truth per research
├── features/<area>/<feature>/
│   ├── _feature.yml       # Feature metadata
│   ├── _tech-spec.md      # Implementation details (optional)
│   └── *.feature          # Gherkin scenarios
└── requirements/*.yml     # Technical requirements

tests/
├── e2e/<area>/<feature>/*.e2e.test.ts  # E2E tests (match scenarios)
└── unit/**/*.test.ts                    # Unit tests (traced from tech specs)

src/                       # Implementation code
templates/                 # Scaffolding templates
```

## CLI Commands

```bash
# Scaffolding
udd new use-case <id>
udd new feature <area> <name>
udd new scenario <area> <feature> <slug>
udd new research <id>              # Create research investigation
udd new tech-spec <area> <feature> # Create tech spec (planned)

# Research (planned)
udd research list                  # Show active research
udd research decide <id>           # Record decision

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
