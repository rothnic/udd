# Agent Instructions: UDD (User Driven Development)

UDD is a spec-first workflow where **user journeys are requirements** and **BDD scenarios are tests**.

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

```
product/                          # Human-authored intent
├── README.md                     # Product overview
├── actors.md                     # Who uses it
├── constraints.md                # NFRs, hard rules
├── changelog.md                  # Decision history (auto)
└── journeys/                     # User outcomes
    └── *.md                      # One file per journey

specs/                            # Testable behaviors
├── .udd/manifest.yml             # Traceability (auto)
└── <domain>/                     # Grouped by domain
    └── *.feature                 # BDD scenarios

tests/                            # Verification
└── <domain>/
    └── *.e2e.test.ts             # E2E tests (match scenarios)
```

## Workflow

1. **Check status first**: `udd status`
2. **Journeys define intent** in `product/journeys/`
3. **Sync generates scenarios**: `udd sync`
4. **Tests verify behavior**: `npm test`
5. **Implement to make tests pass**

## CLI Commands

| Command | Purpose |
|---------|---------|
| `udd status` | Show journey → scenario → test coverage |
| `udd sync` | Detect journey changes, propose scenarios |
| `udd init` | Initialize product/ structure |
| `udd new journey <slug>` | Create journey file |
| `udd new scenario <domain> <action>` | Create scenario + test stub |
| `udd lint` | Validate spec structure |

## Journey Format

```markdown
# Journey: New User Onboarding

**Actor:** User  
**Goal:** Sign up and start using the app

## Steps

1. User signs up → `specs/auth/signup.feature`
2. User creates first item → `specs/items/create.feature`

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
2. **Create/update journey before implementing new behavior**
3. **Run `udd sync` to generate scenarios from journeys**
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
3. Create journey: `udd new journey export_data`
4. Edit `product/journeys/export_data.md` with user context
5. Create rich feature file with:
   - Comments explaining alternatives considered
   - Comprehensive scenarios (happy path, errors, edge cases)
6. Sync: `udd sync`
7. Run tests (fail): `npm test`
8. Implement code
9. Run tests (pass): `npm test`
10. Verify: `udd status`

**See `docs/sysml-informed-discovery.md` for detailed guidance on using SysML principles to create better feature scenarios.**
