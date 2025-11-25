---
description: Scaffold a new UDD use case
agent: udd
---

# /udd/new/use-case Command

Create a new use case specification file.

## Arguments

- `$1` - The use case ID (snake_case, e.g., `export_data`)

## Execution

!`./bin/udd new use-case $1`

## Next Steps

After creating the use case:

1. **Edit the use case file** at `specs/use-cases/$1.yml`
2. **Fill in the outcomes** - what user goals does this satisfy?
3. **Link to features** - which features implement these outcomes?
4. **Run lint** to validate: `/udd/lint`

## Use Case Template

A use case should define:
```yaml
id: $1
title: "Human readable title"
description: "What problem this solves for the user"
actor: "Who benefits from this"
outcomes:
  - description: "Specific measurable outcome"
    features:
      - area/feature_name
```
