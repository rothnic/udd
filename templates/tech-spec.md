# Tech Spec: {{FEATURE_NAME}}

## Overview

Brief description of what this feature does and why.

## Research

Link to any research that informed this spec:
- [Research: {{RESEARCH_ID}}](../../research/{{RESEARCH_ID}}/README.md)

## Architecture

### Component Diagram

```
┌─────────────┐     ┌─────────────┐
│  Component  │────▶│  Component  │
└─────────────┘     └─────────────┘
```

### Data Flow

Describe how data flows through the feature.

## Interfaces

### Public API

```typescript
// Define the public interface
interface {{FeatureName}} {
  method(): ReturnType;
}
```

### Internal Types

```typescript
// Internal data structures
type InternalState = {
  // ...
};
```

## Implementation Details

### Key Algorithms

Describe any non-trivial algorithms.

### Dependencies

| Dependency | Purpose | Version |
|------------|---------|---------|
| zod | Schema validation | ^3.x |

## Unit Test Coverage

Each implementation detail should trace to specific tests:

| Component | Test File | Test Cases |
|-----------|-----------|------------|
| `parseConfig()` | `tests/unit/config.test.ts` | `parses valid config`, `rejects invalid` |
| `validate()` | `tests/unit/validator.test.ts` | `validates schema`, `handles errors` |

### Test Requirements

```typescript
// tests/unit/{{feature}}.test.ts

describe('{{FeatureName}}', () => {
  describe('method()', () => {
    it('should handle case A', () => {
      // Test implementation
    });

    it('should handle case B', () => {
      // Test implementation
    });
  });
});
```

## Edge Cases

| Case | Expected Behavior | Test |
|------|-------------------|------|
| Empty input | Return default | `handles empty input` |
| Invalid format | Throw ValidationError | `rejects invalid format` |
| Missing field | Use default value | `defaults missing fields` |

## Error Handling

| Error | Condition | Recovery |
|-------|-----------|----------|
| `ValidationError` | Invalid input | Return error message |
| `NotFoundError` | Resource missing | Return null or throw |

## Performance Considerations

- Expected scale: ...
- Bottlenecks: ...
- Optimizations: ...

## Security Considerations

- Input validation: ...
- Access control: ...

## Migration / Rollout

If this changes existing behavior:
1. Step 1
2. Step 2

## Open Questions

- [ ] Question 1?
- [ ] Question 2?

## Changelog

| Date | Author | Change |
|------|--------|--------|
| {{DATE}} | {{AUTHOR}} | Initial spec |
