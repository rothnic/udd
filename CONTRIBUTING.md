# Contributing to UDD

Development workflow for the UDD project.

## Quick Start

```bash
udd status    # Check project health
npm test      # Run tests
udd sync      # Sync journeys to scenarios
```

## The UDD Workflow

```
product/journeys/  →  specs/<domain>/*.feature  →  tests/<domain>/*.e2e.test.ts
   (intent)              (behavior)                   (verification)
```

1. **Journeys** (`product/journeys/`) - What users accomplish
2. **Scenarios** (`specs/<domain>/`) - BDD specifications
3. **Tests** (`tests/<domain>/`) - E2E verification
4. **Code** (`src/`) - Implementation

### Key Principle

> If the code doesn't match the spec, **fix the code**, not the spec.

## Development Cycle

```bash
# 1. Check current state
udd status

# 2. Create or update a journey
udd new journey export_data
# Edit product/journeys/export_data.md

# 3. Generate scenarios from journey
udd sync

# 4. Run tests (should fail first)
npm test

# 5. Implement the code

# 6. Run tests (should pass)
npm test

# 7. Verify complete
udd status
```

## Creating Rich Feature Scenarios

UDD uses **SysML principles to create better feature scenarios** without adding complexity.

### Start with User Needs

Before creating features, understand:
- **Who** needs this? (actors, user roles)
- **What** are they trying to accomplish? (goals)
- **Why** does it matter? (value, problem being solved)
- **What** alternatives exist? (other solutions, trade-offs)

### Three Ways to Create Features

| Command | Best For | Output |
|---------|----------|--------|
| `udd new scenario <domain> <action>` | Quick, simple scenarios | Basic feature file + test stub |
| `udd new feature <domain> <name>` | Template-based features | Rich feature file with context sections |
| `udd discover feature <domain>/<name>` | Guided discovery | Interactive interview → complete feature |

### Creating a Rich Feature File

Use the template-based or discovery approach to include:

```gherkin
Feature: Export Project Data
  # User Need: Data analysts need to analyze project data in Excel
  # Who: Data Analysts, Project Managers
  # Why: Create custom reports, pivot tables, presentations
  # 
  # Alternatives Considered:
  #   - Direct Excel integration: Rejected (too complex)
  #   - REST API access: Deferred (Phase 4)
  #   - CSV export: CHOSEN (simple, universal)
  #
  # Success Criteria:
  #   - Export completes in < 30s for 1000 records
  #   - File opens correctly in Excel
  
  Scenario: Export current view to CSV
    Given user is viewing projects list
    When user clicks "Export to CSV"
    Then file is downloaded
    And file contains all projects
```

**See [docs/sysml-informed-discovery.md](docs/sysml-informed-discovery.md) for detailed guidance and examples.**

## File Structure

```
product/                          # Human-authored
├── README.md                     # Product overview
├── actors.md                     # Who uses it
├── constraints.md                # NFRs
├── changelog.md                  # Auto-updated
└── journeys/*.md                 # User outcomes

specs/                            # Testable behaviors
├── .udd/manifest.yml             # Traceability
└── <domain>/*.feature            # BDD scenarios

tests/<domain>/*.e2e.test.ts      # E2E tests
src/                              # Implementation
```

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

## CLI Commands

| Command | Purpose |
|---------|---------|
| `udd init` | Initialize product/ structure |
| `udd sync` | Sync journeys → scenarios |
| `udd status` | Show coverage |
| `udd new journey <slug>` | Create journey |
| `udd new scenario <domain> <action>` | Create scenario + test |
| `udd new feature <domain> <name>` | Create feature from SysML template |
| `udd discover feature <domain>/<name>` | Interactive feature discovery |
| `udd lint` | Validate specs |
| `udd validate` | Check feature completeness |

## Feature Evolution

Split scenarios as features grow:

```
specs/auth/
├── login_basic.feature
├── login_2fa.feature
└── login_social.feature
```

## Branching

```
main                              # Stable
  └── feature/<name>              # Development
```

## Commit Messages

Follow conventional commits:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation
- `refactor:` - Code change (no behavior change)
- `test:` - Test changes
