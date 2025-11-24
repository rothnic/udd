---
applyTo: '**'
---
# UDD Project - Copilot Instructions

This is a User Driven Development (UDD) project. Follow these principles:

## Core Rules

1. **Spec is Truth**: All behavior must be defined in Gherkin scenarios first
2. **Test Before Code**: Have a failing test before writing implementation
3. **Small Commits**: Commit frequently in logical chunks (spec → feat → test → chore)
4. **Phase Accountability**: Use `@phase:N` tags to defer work, not `@wip`

## Quick Commands

```bash
udd status    # Check project health
udd lint      # Validate specs
npm test      # Run all tests
```

## File Conventions

- Scenarios: `specs/features/<area>/<feature>/*.feature`
- Tests: `tests/e2e/<area>/<feature>/*.e2e.test.ts` (NOT `.spec.ts`)
- Use Cases: `specs/use-cases/*.yml`

## Prompts Available

- `@iterate` - Start here for autonomous maintenance
- `@roadmap` - Phase-based progress view
- `@scaffold` - Create new specs
- `@implement` - TDD workflow

## Key Files

- `specs/VISION.md` - Current phase and roadmap
- `.github/LEARNINGS.md` - Patterns and insights
- `CONTRIBUTING.md` - Full workflow documentation
