# Agent Instructions: UDD (User Driven Development)

UDD is a spec-first workflow where **user-facing scenarios define behavior** and **BDD scenarios are tests**.

## Core Principle

**Never implement behavior that isn't specified.** If asked to write code without a spec, guide to create the spec first.

## SysML-Informed Discovery

UDD uses **SysML principles to create better feature scenarios**, not to add artifact layers.

**Key insight**: SysML helps us think through requirements more thoroughly. Use this thinking to create richer feature files with:
- Comments documenting alternatives considered
- Comprehensive scenarios covering edge cases
- Clear user context (who, what, why)

**See `docs/sysml-informed-discovery.md` for practical examples.**

## Project Structure

Canonical traceability chain:

```
Objective -> Use Case -> Scenario -> E2E Test
```

Required traceability artifacts:

```
specs/use-cases/*.yml             # Outcomes and scenario links
specs/features/**/*.feature       # BDD behavior contracts
tests/e2e/**/*.test.ts            # Executable proof
```

Journey files and SysML-informed notes are optional discovery context during
compatibility mode. Do not duplicate the same requirement across journey, use
case, scenario, and requirement files.

## Workflow

1. **Check status first**: `udd status`
2. **Update the use case or scenario first** for behavior changes
3. **Run `udd sync` only when journey files drive scenario generation**
4. **Tests verify behavior**: `npm test`
5. **Implement to make tests pass**

## Codex Environment

If the Codex shell has `node` but not `npm` or `npx`, run:

```bash
scripts/codex-setup.sh
```

Then run checks through:

```bash
scripts/codex-verify.sh <optional vitest path>
```

This uses Bun to supply npm from `package-lock.json` and runs Vitest with
`UDD_TEST_RUNTIME=bun` to avoid Codex bundled-Node native module restrictions.

## CLI Commands

> If `udd` is not available on PATH, run commands as `npm run udd -- <command>` from the repo root.

| Command | Purpose |
|---------|---------|
| `udd status` | Show use-case → scenario → test coverage |
| `udd sync` | Detect journey changes and propose scenario updates |
| `udd init` | Initialize product/ structure |
| `udd phase current/list/set/check` | Inspect, update, and validate roadmap phase state |
| `udd new journey <slug>` | Create optional discovery-context journey file |
| `udd new scenario <domain> <action>` | Create legacy flat scenario + test stub |
| `udd lint` | Validate spec structure |

## Optional Journey Format

Journey files are discovery context. Link journey steps to canonical scenario
files instead of treating the journey as a second requirement layer.

```markdown
# Journey: New User Onboarding

**Actor:** User  
**Goal:** Sign up and start using the app

## Steps

1. User signs up → `specs/features/auth/signup.feature`
2. User creates first item → `specs/features/items/create.feature`

## Success

User has created their first item within 5 minutes.
```

## Status Indicators

- ✓ **passing** - Scenario implemented and test passes
- ✗ **failing** - Test exists but fails (implement the code!)
- ○ **missing** - Scenario exists but no test (create the test!)
- ◇ **needs sync** - Journey changed since last sync

## Rules for Agents

1. **Check `udd status` before starting work**
2. **Create/update the use case or scenario before implementing new behavior**
3. **Run `udd sync` when journey files need to generate or update scenarios**
4. **One scenario per file** - keeps files small and focused
5. **Split by variation** - `login_basic.feature`, `login_2fa.feature`
6. **Run tests after changes**: `npm test`
7. **Commit often with meaningful messages**

## Example Workflow

User: "Add CSV export feature"

1. **Understand the user need** (SysML-style thinking):
   - Who needs this? (Data analysts)
   - Why? (To analyze data in Excel)
   - What alternatives exist? (Direct Excel, API, CSV)
   - Which is best for the user? (CSV: simple, universal)

2. Check status: `udd status`
3. Identify or create the relevant use case in `specs/use-cases/`
4. Add optional journey/SysML context if it clarifies the user need
5. Create or update the feature file with:
   - Comments explaining alternatives considered
   - Comprehensive scenarios (happy path, errors, edge cases)
6. Sync journey-driven scenario changes with `udd sync` when journey files changed
7. Run tests (fail): `npm test`
8. Implement code
9. Run tests (pass): `npm test`
10. Verify: `udd status`

**See `docs/sysml-informed-discovery.md` for detailed guidance on using SysML principles to create better feature scenarios.**


## Docs Organization Preference

To keep the repository tidy, dated review/status artifacts **must not** be added directly under `docs/`.
Place them under a scoped subdirectory such as `docs/project/reviews/<YYYY-MM-DD>/` (or another domain-specific folder), and keep related files (assessment, tracker markdown, tracker YAML) together in that directory.
