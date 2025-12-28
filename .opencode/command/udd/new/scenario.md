---
description: Scaffold a new UDD scenario (Gherkin feature file)
agent: quick-code
---

# /udd/new/scenario Command

Create a new Gherkin scenario file for a feature.

## Arguments

- `$1` - The area (e.g., `cli`, `api`, `ui`)
- `$2` - The feature name (e.g., `export`)
- `$3` - The scenario slug (snake_case, e.g., `csv_format`)

## Execution

!`./bin/udd new scenario $1 $2 $3`

## Next Steps

After creating the scenario:

1. **Edit the feature file** at `specs/features/$1/$2/$3.feature`
2. **Write Gherkin steps**:
   - `Given` - setup/preconditions
   - `When` - action being tested
   - `Then` - expected outcome
3. **Create E2E test** at `tests/e2e/$1/$2/$3.e2e.test.ts`
4. **Run tests** (should fail): `/udd/test`
5. **Implement** to make test pass
6. **Verify**: `/udd/status`

## Gherkin Template

```gherkin
@area:$1 @feature:$2
Feature: $3

  Scenario: Description of what is being tested
    Given some precondition
    When an action is performed
    Then an outcome is observed
```
