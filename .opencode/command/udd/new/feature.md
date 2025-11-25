---
description: Scaffold a new UDD feature
agent: udd
---

# /udd/new/feature Command

Create a new feature specification directory and _feature.yml.

## Arguments

- `$1` - The area (e.g., `cli`, `api`, `ui`)
- `$2` - The feature name (snake_case, e.g., `export`)

## Execution

!`./bin/udd new feature $1 $2`

## Next Steps

After creating the feature:

1. **Edit the feature file** at `specs/features/$1/$2/_feature.yml`
2. **Add scenarios**: `/udd/new/scenario $1 $2 <scenario_name>`
3. **Link to use case** - update the use case to reference this feature
4. **Run lint** to validate: `/udd/lint`

## Feature Template

A feature should define:
```yaml
id: "$1/$2"
title: "Human readable title"
description: "What capability this feature provides"
scenarios:
  - scenario_name
```
