# Research: Technical Requirements Strategy

## Metadata

| Field | Value |
|-------|-------|
| Status | `active` |
| Created | 2025-11-25 |
| Timebox | 3 days |
| Decision | _TBD_ |
| Related Features | udd/cli |

## Question

How should UDD handle non-functional requirements (performance, security, etc.) and trace them to verification tests?

## Context

Gherkin scenarios capture user-facing behavior but not implementation requirements:

```gherkin
# This is captured:
When I submit valid credentials
Then I should be redirected to the dashboard

# This is NOT captured:
- Password hashing uses bcrypt with cost >= 12
- Session tokens are cryptographically secure
- Response time < 200ms
```

UDD has a `specs/requirements/` concept in the schema but:
- No requirement files exist
- Validation is stub logic
- No clear workflow for when/how to create them

## Alternatives

### Option A: Separate requirement files

Keep `specs/requirements/*.yml` as distinct artifacts.

```yaml
# specs/requirements/secure_password.yml
key: secure_password
type: non_functional
feature: auth/login
test_file: tests/unit/auth/password.test.ts
test_cases:
  - hashes with bcrypt
  - cost factor >= 12
```

**Pros:**
- Explicit artifacts for auditing
- Can be validated independently

**Cons:**
- Another layer to maintain
- Parallel structure to features
- Orphan risk (requirements not linked to anything)

### Option B: Embed in tech specs (Recommended)

Requirements live in the tech spec's "Unit Test Coverage" table.

```markdown
# _tech-spec.md

## Unit Test Coverage

| Component | Test File | Requirement | Test Cases |
|-----------|-----------|-------------|------------|
| hashPassword() | tests/unit/auth/password.test.ts | secure_password | hashes with bcrypt, cost >= 12 |
```

**Pros:**
- Single location for implementation details
- Already have tech spec template
- Natural home for "how" documentation

**Cons:**
- Markdown tables harder to validate programmatically
- Tech specs are optional

### Option C: Extended BDD

Add non-functional scenarios directly to Gherkin.

```gherkin
@security
Scenario: Password is securely stored
  Then the bcrypt cost factor should be at least 12
```

**Pros:**
- Single source of truth
- Tests verify requirements directly

**Cons:**
- Mixes behavior with implementation
- E2E tests become slower
- Clutters scenario files

## Evaluation Criteria

| Criterion | Weight | Option A | Option B | Option C |
|-----------|--------|----------|----------|----------|
| Simplicity | 3 | Low | High | Medium |
| Traceability | 2 | High | Medium | High |
| Maintenance | 3 | High effort | Low effort | Medium |
| Validation | 2 | Programmatic | Manual/Agent | Programmatic |

## Findings

### 2025-11-25: Current state

- `TechnicalRequirementSchema` exists in `src/types.ts`
- `udd new requirement` command exists
- `specs/requirements/` folder is empty
- `udd status` shows requirements section but no data
- Tech spec template has Unit Test Coverage table

### 2025-11-25: Agent verification approach

For Option B, verification could work via:

1. **Agent reads tech spec** - Extracts table
2. **Agent checks test files** - Verifies listed tests exist
3. **Agent reports coverage** - Matches requirements to tests

This avoids complex parsing and leverages agent understanding.

## Decision

_TBD - Pending review_

## Proposed Changes

If Option B is selected:

1. **Remove** `specs/requirements/` concept
2. **Remove** `TechnicalRequirementSchema` and related code
3. **Remove** `udd new requirement` command
4. **Enhance** tech spec template with clearer requirement format
5. **Add** `udd verify <feature>` - Agent-based tech spec verification
6. **Add** `@security`, `@performance` tags for critical E2E scenarios

## Follow-up

- [ ] Review and decide
- [ ] If approved, deprecate requirements concept
- [ ] Create verification agent/command
