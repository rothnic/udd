---
description: Validate UDD spec files for structural correctness
agent: quick-status
---

# /udd/lint Command

Validate all specification files for structural correctness and reference integrity.

## Lint Results

!`./bin/udd lint`

## Analysis

Based on the lint output:

1. **Errors**: Any structural issues that must be fixed before proceeding
2. **Warnings**: Issues that should be addressed but don't block progress
3. **Missing References**: Use cases referencing non-existent features/scenarios

## Recommended Fixes

If errors were found, provide specific guidance on how to fix each issue:
- Missing `_feature.yml` files: run `./bin/udd new feature <area> <feature>`
- Invalid YAML structure: show the correct format
- Broken references: identify which specs need updating
