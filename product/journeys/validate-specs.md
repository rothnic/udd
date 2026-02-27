# Journey: Validate Specs

**Actor**: Developer, Agent  
**Goal**: Ensure specs follow the defined structure and schemas

## Context

Specs need to be valid to ensure traceability and proper test generation.
This journey provides validation tools.

## Steps

1. Developer writes or updates specs → `specs/features/udd/cli/lint_valid_specs.feature`
2. Runs `udd lint` to validate structure → `specs/features/udd/cli/lint_invalid_specs.feature`
3. Gets feedback on any issues
4. Fixes issues until validation passes

## Success Criteria

- Valid specs pass linting without errors
- Invalid specs report clear, actionable errors
- Validation is fast (< 1 second)

## Use Cases

- `specs/use-cases/validate_specs.yml` - Original use case (legacy)
