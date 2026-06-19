# Getting Started with UDD

This guide walks you through setting up UDD in a new or existing project.

## Installation

```bash
# Install the current release candidate from GitHub
npm install github:rothnic/udd

# Initialize
udd init
```

The npm registry package is not published yet. When developing from this
repository checkout, use `npm run udd -- <command>` instead of the installed
`udd` binary.

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

specs/VISION.md
specs/use-cases/new_user_onboarding.yml
specs/.udd/manifest.yml
```

## 2. Define User Journeys

Journey files are optional discovery context. Edit
`product/journeys/new_user_onboarding.md` when a narrative flow helps clarify
the user's path:

```markdown
# Journey: New User Onboarding

**Actor:** User  
**Goal:** Sign up and start using the app

## Steps

1. User signs up → `specs/features/auth/signup.feature`
2. User verifies email → `specs/features/auth/verify.feature`
3. User creates first item → `specs/features/items/create.feature`

## Success

User has created their first item within 5 minutes.
```

Then make the enforceable behavior specific in `specs/use-cases/` and
`specs/features/`. For example, email signup, email verification, Google social
sign-in, and Google One Tap should become separate scenario files when those
variants are real product commitments.

```text
specs/features/auth/signup/email_password.feature
specs/features/auth/signup/email_verification.feature
specs/features/auth/signup/social_google.feature
specs/features/auth/signup/google_one_tap.feature
```

Use `@phase:N` before `Feature:` when a whole scenario file is planned for a
future roadmap phase:

```gherkin
@phase:2
Feature: Google social signup
```

## 3. Generate or Refresh Scenarios

```bash
udd sync
```

This will:
1. Parse your journey files
2. Detect new or changed steps
3. Propose BDD scenarios for each linked step
4. Create scenario files and matching E2E test files under `tests/e2e/`

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
udd init                            # Set up project
udd sync                            # Sync journeys → scenarios
udd sync --dry-run                  # Preview without changes
udd sync --auto                     # Auto-accept proposals
udd status                          # Show coverage
udd new journey <slug>              # Create journey
udd new scenario <domain> <action>  # Create canonical scenario + print test path
udd lint                            # Validate specs
```

## Tips

- **One scenario per file** - keeps files small and focused
- **Split by variation** - `email_password.feature`, `social_google.feature`
- **Use cases and scenarios are the enforced requirements** - journeys are
  optional discovery context for describing *what* users accomplish
- **E2E tests are proof** - they verify the scenario behavior from the user's
  perspective
- **Specs are language-neutral, current proof is TypeScript/Vitest** - see
  [`spec-authoring-model.md`](spec-authoring-model.md) for what an adapter must
  provide for other languages


## Local Bootstrap Note

Commands in this guide use `udd ...` as the primary workflow.
If `udd` is not available on your shell `PATH`, run the same command through npm:

```bash
npm run udd -- <command>
# example
npm run udd -- status
```

To make `udd` available in a local dev checkout:

```bash
npm run setup:link
```

## Codex/CI Bootstrap

For freshly cloned repos in Codex or CI-like environments, run:

```bash
npm run setup:codex
```

This installs dependencies and verifies CLI access via `udd status` (or `npm run udd -- status` fallback).
