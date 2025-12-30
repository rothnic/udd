# Getting Started with UDD

This guide walks you through setting up UDD in a new or existing project.

## Installation

```bash
# In your project
npm install udd
# or
npx udd init
```

## 1. Initialize Your Project

```bash
udd init
```

Answer the prompts:
- What are you building?
- Who uses it?
- What's the first thing a new user does?
- Any hard constraints?

This creates:
```
product/
├── README.md
├── actors.md
├── constraints.md
├── changelog.md
└── journeys/new_user_onboarding.md

specs/.udd/manifest.yml
```

## 2. Define User Journeys

Edit `product/journeys/new_user_onboarding.md`:

```markdown
# Journey: New User Onboarding

**Actor:** User  
**Goal:** Sign up and start using the app

## Steps

1. User signs up → `specs/auth/signup.feature`
2. User verifies email → `specs/auth/verify.feature`
3. User creates first item → `specs/items/create.feature`

## Success

User has created their first item within 5 minutes.
```

## 3. Generate Scenarios

```bash
udd sync
```

This will:
1. Parse your journey files
2. Detect new or changed steps
3. Propose BDD scenarios for each step
4. Create test stubs

## 4. Implement and Test

Run the generated tests:
```bash
npm test
```

They'll fail initially. Implement the features to make them pass.

## 5. Iterate

When requirements change:
1. Update your journey files
2. Run `udd sync` to detect changes
3. Accept or modify proposed scenarios
4. Implement new behavior

## Commands Reference

```bash
udd init                          # Set up project
udd sync                          # Sync journeys → scenarios
udd sync --dry-run                # Preview without changes
udd sync --auto                   # Auto-accept proposals
udd status                        # Show coverage
udd new journey <slug>            # Create journey
udd new scenario <domain> <action> # Create scenario + test
udd lint                          # Validate specs
```

## Tips

- **One scenario per file** - keeps files small and focused
- **Split by variation** - `login_basic.feature`, `login_2fa.feature`
- **Journeys are requirements** - they describe *what* users accomplish
- **Scenarios are tests** - they verify *how* the system behaves
