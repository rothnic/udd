# Troubleshooting Stub Assertions

This guide helps you identify, understand, and fix stub assertions in your test suite.

## What Are Stub Assertions?

Stub assertions are test assertions that always pass without verifying any actual behavior. They create a false sense of security and undermine the entire testing strategy.

**Common stub patterns:**

| Pattern | Why It is a Stub |
|---------|------------------|
| `expect(true).toBe(true)` | Always true, tests nothing |
| `expect(1).toBe(1)` | Always true, tests nothing |
| `expect('x').toBe('x')` | Always true, tests nothing |
| `expect(false).not.toBe(false)` | Always true (double negative), tests nothing |

## Why Stubs Are Harmful

Stub assertions create a false sense of security and undermine the entire testing strategy:

| Problem | Impact |
|---------|--------|
| **False Confidence** | Tests appear to pass while actual behavior is untested |
| **Hidden Issues** | Bugs slip through because "tests pass" |
| **Technical Debt** | Stubs accumulate, making future fixes harder |
| **TDD Violation** | Violates "test should fail first" principle |
| **Wasted CI Time** | Running tests that verify nothing |

**Remember:** Metrics are meaningless if tests do not actually test anything.

## How to Identify Stub Assertions

### Automated Detection

The UDD test governance system automatically detects stub assertions using pattern matching.

**Detection logic** (from `src/lib/test-governance.ts`):

```typescript
function detectStubAssertions(content: string): {
  hasStubs: boolean;
  stubPatterns: string[];
} {
  // Match patterns like: expect(true).toBe(true), expect(false).toBe(false), expect(0).toBe(0)
  const re =
    /expect\(\s*([^)\s]+)\s*\)\s*\.\s*(?:toBe|toEqual|toStrictEqual)\s*\(\s*\1\s*\)/g;
  const matches: string[] = [];
  for (;;) {
    const m = re.exec(content);
    if (!m) break;
    matches.push(m[0]);
  }
  return { hasStubs: matches.length > 0, stubPatterns: unique(matches) };
}
```

### Using udd doctor

Run the diagnostic command to check for stubs in your codebase:

```bash
# Check for all drift issues including stubs
udd doctor

# Check strict mode (fails if drift detected)
udd doctor --strict

# Auto-fix safe issues
udd doctor --fix
```

### Manual Inspection

Look for these red flags during code review:

1. **Literal values in both expect and assertion**
   - `expect(true).toBe(true)`
   - `expect(0).toEqual(0)`

2. **Identical strings in expect and assertion**
   - `expect('success').toBe('success')`

3. **Same variable referenced twice**
   - `expect(result).toBe(result)`

4. **Comments explaining why the test exists**
   - `// TODO: implement real assertion`
   - `// Placeholder until feature is ready`

## Phase-Aware Enforcement

Stub assertions are only blocked in the current phase and previous phases.

**Current Phase Detection:**

The system uses `@phase:N` tags to determine enforcement:

```typescript
export async function getPhaseFromTest(
  testPath: string,
): Promise<number | undefined> {
  const content = await fs.readFile(abs, "utf-8");
  const re = /@phase\s*[:=]?\s*(\d+)/i;
  const m = content.match(re);
  if (m) return Number(m[1]);
  
  // Also checks referenced feature files
  // ...
}
```

**Enforcement Rules:**

| Test Phase | Current Phase | Enforcement |
|------------|---------------|-------------|
| Phase 1 | Phase 3 | Hard block (pre-push) |
| Phase 2 | Phase 3 | Hard block (pre-push) |
| Phase 3 | Phase 3 | Hard block (pre-push) |
| Phase 4 | Phase 3 | Warning only (allowed) |
| Phase 5 | Phase 3 | Warning only (allowed) |

**Current Phase:** See `specs/VISION.md` for `current_phase` value.

## Common Patterns and Fixes

### Pattern 1: Missing Implementation

**❌ Stub:**

```typescript
Then("the user should see a success message", () => {
  expect(true).toBe(true);  // Stub: needs real implementation
});
```

**✅ Fix - Verify actual UI state:**

```typescript
Then("the user should see a success message", async () => {
  const successElement = await page.locator('[data-testid="success-message"]');
  await expect(successElement).toBeVisible();
  await expect(successElement).toHaveText("Operation completed successfully");
});
```

### Pattern 2: Error Case Not Implemented

**❌ Stub:**

```typescript
Then("the command should fail", () => {
  expect(true).toBe(true);  // Stub: needs error verification
});
```

**✅ Fix - Verify error behavior:**

```typescript
Then("the command should fail", async () => {
  const result = await runUdd("invalid-command", { expectError: true });
  expect(result.exitCode).not.toBe(0);
  expect(result.stderr).toContain("Error:");
});
```

### Pattern 3: Async Result Not Awaited

**❌ Stub:**

```typescript
Then("the file should be created", () => {
  expect(true).toBe(true);  // Stub: forgot to check file existence
});
```

**✅ Fix - Verify file system state:**

```typescript
Then("the file should be created", async () => {
  const filePath = path.join(tempDir, "output.txt");
  const exists = await fs.access(filePath).then(() => true).catch(() => false);
  expect(exists).toBe(true);
  
  const content = await fs.readFile(filePath, "utf-8");
  expect(content).toContain("expected content");
});
```

### Pattern 4: Side Effects Not Verified

**❌ Stub:**

```typescript
Then("the database should be updated", () => {
  expect(true).toBe(true);  // Stub: no DB verification
});
```

**✅ Fix - Query database state:**

```typescript
Then("the database should be updated", async () => {
  const record = await db.query("SELECT * FROM users WHERE id = ?", [userId]);
  expect(record.status).toBe("active");
  expect(record.updatedAt).toBeGreaterThan(beforeUpdate);
});
```

### Pattern 5: Conditional Logic Not Tested

**❌ Stub:**

```typescript
Then("the appropriate action should be taken", () => {
  expect(true).toBe(true);  // Stub: vague assertion
});
```

**✅ Fix - Test specific branches:**

```typescript
Then("the user should be redirected to dashboard", async () => {
  expect(page.url()).toContain("/dashboard");
});

Then("an error message should be displayed", async () => {
  const error = await page.locator('[data-testid="error"]');
  await expect(error).toBeVisible();
  await expect(error).toContainText("Invalid credentials");
});
```

## How to Fix Stub Assertions

### Step 1: Understand the Intent

Read the scenario step description carefully. What behavior is it trying to verify?

```gherkin
Then the user should receive a confirmation email
```

**Intent:** Verify email was sent with correct content.

### Step 2: Identify the Observable Outcome

What can you actually check? Examples:

- UI element visibility/text
- API response status/body
- File system changes
- Database state changes
- External service calls (mocked)

### Step 3: Implement Minimal Real Assertion

Start with the simplest verification that proves the behavior occurred:

```typescript
// Good enough for initial implementation
Then("the user should receive a confirmation email", async () => {
  const email = await emailService.getLastSent();
  expect(email.to).toBe(userEmail);
  expect(email.subject).toContain("Confirm");
});
```

### Step 4: Enhance Coverage (Optional)

Add more specific assertions once the basic test passes:

```typescript
// Enhanced version
Then("the user should receive a confirmation email", async () => {
  const email = await emailService.getLastSent();
  expect(email.to).toBe(userEmail);
  expect(email.subject).toBe("Confirm your email address");
  expect(email.body).toContain(confirmationToken);
  expect(email.body).toContain(expirationTime);
});
```

## When You Cannot Test Yet

Sometimes a scenario describes future behavior. You have three options:

| Option | When to Use | Action |
|--------|-------------|--------|
| **Mark @phase:4** | Feature not yet implemented | Add `@phase:4` tag to scenario |
| **Remove test** | Test was speculative | Delete the test case entirely |
| **Minimal assertion** | Can test something basic | Implement minimal real assertion |

### Option 1: Mark Future Phase

```gherkin
@phase:4
Scenario: User exports data to CSV
  Given the user has data
  When they export to CSV
  Then a CSV file should be downloaded
```

This tells the system: "Skip enforcement for this test until Phase 4."

### Option 2: Remove Speculative Test

If the test was written prematurely without a clear implementation path, delete it. Better to have no test than a misleading one.

### Option 3: Minimal Real Assertion

Find something, anything, you can actually verify:

```typescript
// Scenario: Complex AI analysis
// Cannot verify exact output yet, but can verify it ran
Then("analysis should complete", async () => {
  const result = await runAnalysis(data);
  expect(result.status).toBe("completed");  // Real check!
  expect(result.duration).toBeGreaterThan(0);  // Real check!
  // Don't stub: expect(result.output).toBe(result.output)
});
```

## Red/Green Team Review Guidance

### Red Team (Reviewer) Responsibilities

When reviewing code, watch for:

1. **New stub assertions** in Phase 1-3 tests
2. **Refactored assertions** that lost meaning
3. **Copy-paste errors** where values match
4. **TODO comments** promising future fixes

**Review Checklist:**

```yaml
review:
  - id: no_stub_assertions
    question: "No expect(true).toBe(true) or similar stub assertions?"
    required: true
    automated: true
  - id: meaningful_assertions
    question: "Do assertions verify actual behavior, not just existence?"
    required: true
    automated: false
```

### Green Team (Author) Responsibilities

Before submitting code:

1. **Run automated checks locally:**
   ```bash
   udd doctor
   ```

2. **Self-review for stubs:**
   ```bash
   grep -r "expect(true).toBe(true)" tests/
   grep -r "expect(1).toBe(1)" tests/
   ```

3. **Verify each assertion tests something meaningful:**
   - Could this assertion ever fail?
   - What would cause it to fail?
   - Is that failure condition related to the scenario?

### Rejection Criteria

Tests with stub assertions SHALL be rejected:

```yaml
rejection:
  reason: stub_assertion_detected
  criteria:
    - "Contains expect(true).toBe(true) or similar"
    - "Assertion cannot fail under any condition"
    - "Does not verify actual behavior"
  required_action:
    - "Replace with real assertion"
    - "Or mark with @phase:N for future phases"
    - "Or remove test if speculative"
```

## Enforcement Gates

UDD enforces the no-stub policy through multiple gates:

### Pre-Commit (Soft Warning)

```bash
⚠️  WARNING: X stub assertions found in Phase 3 tests
   These stubs must be replaced with real assertions before commit.
   Continue anyway? (y/N)
```

**Purpose:** Catches stubs early during development.
**Action:** Fix stubs or use `--skip-gate` with justification.

### Pre-Push (Hard Block)

```bash
❌ BLOCKED: Cannot push with X stub assertions in Phase 3 tests
   The following files have stub assertions:
   - tests/e2e/udd/test-governance/test_linkage.e2e.test.ts
   - tests/e2e/udd/test-governance/test_scan.e2e.test.ts
   Replace these stubs with real assertions before pushing.
```

**Purpose:** Prevents stubs from entering shared branches.
**Action:** Must fix stubs. Cannot bypass.

### CI/CD (Build Failure)

```yaml
- name: Check for stub assertions
  run: |
    STUB_COUNT=$(grep -r "expect(true).toBe(true)" tests/)
    if [ "$STUB_COUNT" -gt 0 ]; then
      echo "::error::Found $STUB_COUNT stub assertions"
      exit 1
    fi
```

**Purpose:** Final safety net before merge.
**Action:** Fix stubs and re-run CI.

## Prevention Strategies

### 1. Write Tests First (TDD)

Always start with a failing test. If you write the test first, you cannot accidentally leave a stub:

```typescript
// Step 1: Write failing test
Then("user sees greeting", () => {
  expect(screen.getByText("Hello")).toBeInTheDocument();
});
// Result: FAIL - "Hello" not found

// Step 2: Implement feature
// ...add greeting component...

// Step 3: Test passes
// Result: PASS - real behavior verified
```

### 2. Assertion Checklist

Before committing, ask for each assertion:

- [ ] **Could this fail?** (If no, it is a stub)
- [ ] **What would cause failure?** (Should relate to scenario)
- [ ] **Does it verify the requirement?** (Not just existence)
- [ ] **Is it specific enough?** (Not overly broad)

### 3. Code Review Focus

Reviewers should specifically check:

- All `expect()` calls in new tests
- Refactored tests that might have lost meaning
- Tests with `@phase:3` or lower tags
- Emergency fixes that might have shortcuts

## Quick Reference

### Stub Patterns to Avoid

```typescript
// NEVER use these patterns in Phase 3+ tests:

expect(true).toBe(true)
expect(true).toBeTruthy()
expect(true).toEqual(true)
expect(false).not.toBe(false)
expect(1).toBe(1)
expect(0).toBe(0)
expect('x').toBe('x')
expect(result).toBe(result)  // Same variable
```

### Valid Assertion Examples

```typescript
// Verify return values
expect(result.status).toBe('success');
expect(result.data.id).toBeDefined();

// Verify errors
expect(() => action()).toThrow('Invalid input');

// Verify state changes
expect(db.getUser(userId).status).toBe('active');

// Verify UI elements
expect(screen.getByText('Success')).toBeVisible();

// Verify async results
await expect(promise).resolves.toEqual(expected);

// Verify collections
expect(items).toHaveLength(3);
expect(items).toContainEqual(expectedItem);
```

## Getting Help

If you encounter a scenario that seems impossible to test without stubs:

1. **Check if the scenario is too broad** - Break into smaller, testable steps
2. **Consult the feature author** - They may know observable outcomes you missed
3. **Mark for future phase** - Use `@phase:N` if testing requires unbuilt infrastructure
4. **Ask in code review** - Reviewers can help identify testable aspects

## References

- [AGENTS.md - Test Governance Policy](../AGENTS.md#test-governance-policy)
- [src/lib/test-governance.ts](../../src/lib/test-governance.ts)
- [specs/VISION.md](../../specs/VISION.md)
- [.sisyphus/plans/comprehensive-test-governance.md](../../.sisyphus/plans/comprehensive-test-governance.md)
