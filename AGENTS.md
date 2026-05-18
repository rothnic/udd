# Agent Instructions: UDD (User Driven Development)

UDD is a spec-first workflow where **user journeys are requirements** and **BDD scenarios are tests**.

## Core Principle

**Never implement behavior that isn't specified.** If asked to write code without a spec, guide to create the spec first.

## Critical Testing Principle

**NEVER disable or skip failing tests solely to achieve a 100% pass rate.**

This is absolutely prohibited:
- ❌ Skipping test files to make metrics look good
- ❌ Commenting out failing tests  
- ❌ Using `.skip()` or `.todo()` to hide failures
- ❌ Moving tests to different phases without fixing the underlying issue

**The only legitimate reasons to skip a test:**
- The test applies to a future phase (e.g., @phase:4 when current_phase=3)
- The test is temporarily disabled with a clear TODO and issue link
- The feature being tested has been explicitly deprioritized

**When tests fail, you must:**
1. Investigate the root cause
2. Fix the actual issue (in code OR test)
3. If the test is wrong, fix the test
4. If the code is wrong, fix the code
5. If infrastructure is broken, fix the infrastructure

**Metrics are meaningless if achieved by hiding problems.**

## SysML-Informed Discovery

UDD uses **SysML principles to create better feature scenarios**, not to add artifact layers.

**Key insight**: SysML helps us think through requirements more thoroughly. Use this thinking to create richer feature files with:
- Comments documenting alternatives considered
- Comprehensive scenarios covering edge cases
- Clear user context (who, what, why)

**See `docs/sysml-informed-discovery.md` for practical examples.**

## Architecture & Concept Mappings

UDD concepts map to formal Systems Engineering (SE) concepts:

| UDD Concept | SE Equivalent | Purpose |
|-------------|---------------|---------|
| **Journey** | CONOPS (IEEE 1362) | Operational scenarios, user workflows |
| **Use Case** | System Requirements | Functional specifications |
| **Scenario** | Acceptance Criteria | Testable BDD specifications |
| **Roadmap** | Life Cycle Plan | Phase assignments, timing |
| **Concept** | Project Charter | Philosophy, principles, scope |

**Capabilities evolve through increments** delivered across phases:
- v1-basic (current phase)
- v2-advanced (next phase)  
- v3-full (future vision)

**See `docs/architecture/concept-mappings.md` for detailed guidance on:**
- How UDD maps to SE standards (IEEE 1362, ISO 15288, INCOSE)
- Feature evolution examples
- Decision guidelines for creating/updating artifacts
- Validation rules and examples

## Project Structure

```
product/                          # Human-authored intent
├── concept.md                    # Philosophy, principles, scope (CONOPS-level)
├── README.md                     # Product overview
├── actors.md                     # Who uses it (Personas)
├── constraints.md                # NFRs, hard rules
├── changelog.md                  # Decision history (auto)
└── journeys/                     # User outcomes (per-scenario CONOPS)
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

> If `udd` is not available on PATH, run commands as `npm run udd -- <command>` from the repo root.

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

## UDD Strict Mode and Recovery

UDD strict mode enforces traceability between journeys, scenarios, and tests. When enabled, the system blocks operations that would create drift between these layers.

### What is Strict Mode

Strict mode ensures:
- Every code change traces back to a user journey
- Scenarios stay synchronized with journey definitions
- Tests remain aligned with specifications

Drift occurs when journeys change but scenarios do not, or when tests are written without corresponding scenarios.

### Gates: Critical vs Warning

UDD uses two types of enforcement gates:

| Gate Type | Behavior | When to Bypass |
|-----------|----------|----------------|
| **Critical** | Blocks operation entirely | Never. Must fix first. |
| **Warning** | Requires confirmation to proceed | Temporarily with `--skip-gate` |

Critical gates protect core traceability. Warning gates alert you to issues that should be addressed soon.

### Checking for Drift

Always check status before starting work:

```bash
udd doctor              # Check for all drift issues
udd doctor --strict     # Exit with error if drift detected
```

The doctor command analyzes:
- Journey files without corresponding scenarios
- Scenarios referencing non-existent journeys
- Tests without matching scenario definitions
- Manifest synchronization state

### Recovery Workflow

When blocked by drift:

1. **Run diagnosis**
   ```bash
   udd doctor --fix
   ```

2. **Review the plan**
   The doctor shows proposed fixes. Review each change carefully.

3. **Apply fixes**
   - Interactive mode: Confirm each fix individually
   - Auto mode: Apply safe fixes automatically
   ```bash
   udd doctor --fix --auto  # Auto-fix safe issues only
   ```

4. **Verify clean state**
   ```bash
   udd doctor
   udd status
   ```

### Checkpoint System

For ambiguous cases, UDD creates checkpoints that require clarification:

- When a journey change could map to multiple scenarios
- When scenario semantics are unclear
- When automatic sync would lose intent

Resolve checkpoints by editing the relevant journey or scenario file directly, then run `udd sync` again.

### Command Quick Reference

```bash
# Diagnosis
udd doctor              # Check drift
udd doctor --strict     # Fail on any drift

# Recovery
udd doctor --fix        # Interactive recovery
udd doctor --fix --auto # Auto-fix safe issues

# Strict operations
udd sync --strict       # Block on drift during sync

# Bypass (use sparingly)
udd new --skip-gate     # Bypass warning gates
```

### Guidelines for Agents

**Before starting work:**
1. Run `udd status` to see current state
2. Run `udd doctor` to check for drift

**If critical drift detected:**
- Stop and fix before writing any code
- Use `udd doctor --fix` for guided recovery

**If warning drift detected:**
- Prefer to fix the issue
- Can use `--skip-gate` if blocked, but create a task to fix it

**Never use `--skip-gate` for critical gates.** The block exists to prevent broken traceability.

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


## Docs Organization Preference

To keep the repository tidy, dated review/status artifacts **must not** be added directly under `docs/`.
Place them under a scoped subdirectory such as `docs/project/reviews/<YYYY-MM-DD>/` (or another domain-specific folder), and keep related files (assessment, tracker markdown, tracker YAML) together in that directory.
