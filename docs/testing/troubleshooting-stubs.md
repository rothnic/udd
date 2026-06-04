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

`udd test-scan --json` reports stub assertions as test-governance findings with
source references. `udd gate test-governance` reports the same findings without
failing by default so teams can adopt the gate gradually. `udd gate
test-governance --strict` exits non-zero when strict-mode findings are present.

`udd doctor` and `udd health-check` remain project health diagnostics. They do
not replace the test-governance gate.

## CI Opt-In

Goal 009 does not enable repository-wide strict gates by default. Teams that are
ready to enforce governance in CI can opt in by adding an explicit job step:

```bash
./bin/udd gate test-governance --strict
```

Use the non-strict command first while triaging existing findings:

```bash
./bin/udd gate test-governance
```

Strict mode should only be added after the repository has reviewed linked
non-stub proof or has accepted the current blocking findings as intentional CI
failures.

Useful local searches:

```bash
rg -n "expect\\((true|false|0|1|\"[^\"]*\"|'[^']*')\\)\\.to(Be|Equal|StrictEqual)\\(\\1\\)" tests
rg -n "\\b(skip|todo|stub)\\b|\\.skip\\(|\\.todo\\(" specs tests src
```

Treat search results as review leads, not automatic proof. Some matches may be
legitimate, and some weak assertions do not match a simple pattern.

Machine-readable governance output includes:

- `summary.stubbed` for detected stub assertions,
- `summary.reviewed` for clean source-controlled test reviews,
- `summary.stale` for dirty source-controlled reviews,
- `summary.missing` for feature files without linked test proof,
- `summary.gate_blocking` for findings that fail strict mode,
- `findings` for actionable source-referenced review items,
- `source_references` on test entries and findings.

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

## Future Scope

Historical flake detection, pass-rate analytics, CI wiring, and impact-based
targeted regression selection are future roadmap work. Until those land, docs
and PRs should not claim that governance gates infer changed-file impact or
historical reliability.
