# Troubleshooting Stub Assertions

Stub assertions are tests that pass without proving behavior. They are harmful
because they make status output look healthier than the implementation really
is.

## Common Stub Patterns

| Pattern | Why it is a stub |
| --- | --- |
| `expect(true).toBe(true)` | Always true |
| `expect(1).toBe(1)` | Always true |
| `expect("ok").toBe("ok")` | Always true |
| `expect(result).toBe(result)` | Compares a value to itself |
| `expect(value).toBeDefined()` as the only assertion | Often proves setup, not behavior |

## Current Practice

Automated test-governance enforcement is planned in the roadmap, but it is not
the current behavior of `udd doctor` or `udd health-check`. Today, stub
assertions are prevented by author review, independent review, and targeted
search.

Useful local searches:

```bash
rg -n "expect\\((true|false|0|1|\"[^\"]*\"|'[^']*')\\)\\.to(Be|Equal|StrictEqual)\\(\\1\\)" tests
rg -n "\\b(skip|todo|stub)\\b|\\.skip\\(|\\.todo\\(" specs tests src
```

Treat search results as review leads, not automatic proof. Some matches may be
legitimate, and some weak assertions do not match a simple pattern.

## Fixing A Stub

1. Read the scenario step and identify the observable behavior.
2. Make the test fail when that behavior is absent.
3. Prefer user-visible state, command output, file state, exit code, or persisted
   data over implementation internals.
4. Keep the assertion as narrow as the scenario requires.

Example:

```ts
// Weak: proves only that the test ran.
expect(true).toBe(true);

// Better: proves the command produced the required result.
expect(result.exitCode).toBe(0);
expect(result.stdout).toContain("Project Status");
```

## Future Enforcement

The roadmap tracks broader test-governance work separately. A future slice can
make stub detection machine-enforced, phase-aware, and integrated with health
checks. Until that work lands, docs and PRs should not claim that `udd doctor`
or `udd health-check` blocks stub assertions.
