# Journey: Fix Test Discovery

**Actor**: Developer  
**Goal**: Ensure tests are detected by VS Code extensions

## Context

Tests need to be visible in the IDE for effective development. This journey
ensures Vitest extension properly discovers and displays all scenarios.

## Steps

1. Developer opens VS Code
2. Vitest extension loads → `specs/features/udd/dev-experience/test_discovery/vscode_detection.feature`
3. All scenarios appear in the test explorer → `specs/features/udd/dev-experience/test_discovery/editor_status.feature`
4. Test status is visible in the editor

## Success Criteria

- Vitest extension shows all scenarios
- Test status is visible in the editor
- Tests can be run from the IDE

## Use Cases

- `specs/use-cases/fix_test_discovery.yml` - Original use case (legacy)
