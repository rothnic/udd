# Agent Instructions: UDD (User Driven Development)

UDD is a spec-first workflow where **user journeys are requirements** and **BDD scenarios are tests**.

## Core Principle

**Never implement behavior that isn't specified.** If asked to write code without a spec, guide to create the spec first.

## Requirements Levels (Black/Grey/White Box)

UDD supports three levels of specification aligned with SysML principles:

### 1. Black Box (External Behavior)
- **What:** Observable system behavior from user perspective
- **In UDD:** BDD scenarios in `*.feature` files
- **When:** Always - every feature needs black-box scenarios

### 2. Grey Box (Functional Workflows) ⭐
- **What:** Functional component interactions without implementation details
- **In UDD:** Use cases with `functional_workflow` field
- **When:** Complex features with multiple collaborating components
- **See:** `docs/functional-requirements.md` for detailed guidance

### 3. White Box (Implementation)
- **What:** Actual code, architecture, technology choices
- **In UDD:** Source code in `src/`
- **When:** After requirements and scenarios are defined

**Key Insight:** Grey-box is NOT white-box. It specifies **functional workflows** (how functions collaborate) without dictating **implementation architecture** (classes, databases, APIs).

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
├── use-cases/                    # System-level requirements
│   └── *.yml                     # Can include grey-box functional workflows
└── <domain>/                     # Grouped by domain
    └── *.feature                 # BDD scenarios (black-box)

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
4. **Consider grey-box analysis for complex features**
   - If feature involves multiple functional components, create use case with `functional_workflow`
   - See `docs/functional-requirements.md` for guidance
   - Focus on WHAT components do, not HOW they're implemented
5. **One scenario per file** - keeps files small and focused
6. **Split by variation** - `login_basic.feature`, `login_2fa.feature`
7. **Run tests after changes**: `npm test`
8. **Commit often with meaningful messages**

## When to Use Grey-Box Functional Workflows

✅ **Use grey-box when:**
- Feature involves multiple functional components working together
- System-level functional requirements need clarification
- You want to validate functional design before implementation
- Complex workflows benefit from decomposition

❌ **Skip grey-box when:**
- Feature is simple and maps to single behavior
- Implementation is obvious
- Over-specification adds no value

**Important:** Grey-box specifies functional workflows (component interactions) WITHOUT implementation details (no technology, architecture, or code design).

## Example Workflow

User: "Add CSV export feature"

1. Check status: `udd status`
2. Create journey: `udd new journey export_data`
3. Edit `product/journeys/export_data.md` with steps
4. Sync: `udd sync`
5. Accept proposed scenarios
6. Run tests (fail): `npm test`
7. Implement code
8. Run tests (pass): `npm test`
9. Verify: `udd status`
