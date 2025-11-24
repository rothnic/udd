# User Driven Development (UDD) Tool

This tool helps manage the lifecycle of features in a User Driven Development process. It ensures that specs are the source of truth and that features are only considered done when their E2E tests pass.

## Project Structure

- `specs/`: Contains the source of truth for the project.
  - `VISION.md`: High-level vision and goals.
  - `use-cases/`: YAML files defining use cases.
  - `features/`: Feature definitions and Gherkin scenarios.
  - `requirements/`: Technical requirements.
- `tests/`: Contains tests.
  - `e2e/`: End-to-end tests mapping to scenarios.
- `src/`: Source code for the UDD CLI.
- `bin/`: CLI entry point.

## Usage

### Lint Specs

Validate that the specs follow the defined structure and schemas.

```bash
npx ts-node bin/udd.ts lint
```

### Check Status

Check the status of the project based on specs and tests.

```bash
npx ts-node bin/udd.ts status
```

## Development

### Run Tests

```bash
npm test
```
(Note: `npm test` is currently not configured in package.json, use `npx vitest run`)

### Add a new feature

1. Create a feature directory in `specs/features/<area>/<feature>`.
2. Add `_feature.yml`.
3. Add `.feature` files for scenarios.
4. Add corresponding E2E tests in `tests/e2e/<area>/<feature>`.
