# User Driven Development (UDD)

A spec-first CLI tool where **user journeys are requirements** and **BDD scenarios are tests**. Features are done when E2E tests pass.

## Quick Start

```bash
# Initialize in your project
npx udd init

# Sync journeys to scenarios
udd sync

# Check status
udd status
```

## How It Works

```
product/journeys/  →→→  specs/<domain>/*.feature  →→→  tests/<domain>/*.e2e.test.ts
  (what users do)        (testable behaviors)          (verification)
```

1. **Define journeys** in `product/journeys/` - what users accomplish
2. **Run `udd sync`** - generates BDD scenarios from journeys  
3. **Implement code** - make the tests pass
4. **Iterate** - update journeys, sync again

## Project Structure

```
product/                          # Human-authored
├── README.md                     # Product overview
├── actors.md                     # Who uses it
├── constraints.md                # NFRs, hard rules
├── changelog.md                  # Decision history (auto)
└── journeys/                     # User outcomes
    └── new_user_onboarding.md

specs/                            # Agent-generated
├── .udd/manifest.yml             # Traceability (auto)
└── auth/
    ├── signup.feature
    └── login.feature

tests/                            # Agent-generated
└── auth/
    ├── signup.e2e.test.ts
    └── login.e2e.test.ts
```

## Commands

| Command | Purpose |
|---------|---------|
| `udd init` | Initialize product/ structure with interview |
| `udd sync` | Detect journey changes, propose scenarios |
| `udd status` | Show journey → scenario → test coverage |
| `udd new journey <slug>` | Create new journey file |
| `udd new scenario <domain> <action>` | Create scenario + test stub |
| `udd new feature <domain> <feature-name>` | Create feature file from SysML-informed template |
| `udd discover feature <domain> <name>` | Interactive feature discovery with SysML principles |
| `udd lint` | Validate spec structure |
| `udd validate` | Check feature scenario completeness |

## SysML-Informed Discovery

UDD uses **SysML principles to create richer feature scenarios** without adding complexity:

- 📝 Document user needs and alternatives in feature comments
- 🎯 Comprehensive scenarios covering edge cases
- 🤔 Structured thinking about requirements
- 🤖 Agent-assisted discovery workflow

Use `udd discover feature` for guided requirements analysis or see [docs/sysml-informed-discovery.md](docs/sysml-informed-discovery.md) for examples.

## Feature Templates

Create comprehensive feature files using the SysML-informed template:

```bash
# Create a new feature from template
udd new feature <domain> <feature-name>

# Example
udd new feature reporting export_csv
```

The template includes sections for:
- **User Need Context** - Who needs this and why
- **Alternatives Considered** - Document design decisions
- **Success Criteria** - Measurable outcomes
- **Comprehensive Scenarios** - Happy path, errors, and edge cases

See [docs/example-features/](docs/example-features/) for complete examples like `export_data.feature` and `password_reset.feature`.

**Manual Usage:**
```bash
cp templates/feature-template.feature specs/features/<domain>/<feature-name>/<feature-name>.feature
# Edit placeholders with your feature details
```

## Journey Format

```markdown
# Journey: New User Onboarding

**Actor:** User  
**Goal:** Sign up and start using the app

## Steps

1. User signs up → `specs/auth/signup.feature`
2. User creates first task → `specs/tasks/create.feature`

## Success

User has created their first task within 5 minutes.
```

## Feature Evolution

Split features as they grow:

```
specs/auth/
├── login_basic.feature       # Email + password
├── login_2fa.feature         # Two-factor
└── login_social.feature      # OAuth
```

## vitest-cucumber Integration

Uses [@amiceli/vitest-cucumber](https://github.com/amiceli/vitest-cucumber):

```typescript
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";

const feature = await loadFeature("specs/auth/signup.feature");

describeFeature(feature, ({ Scenario }) => {
  Scenario("User signs up with email", ({ Given, When, Then }) => {
    // Step implementations
  });
});
```

## License

MIT
