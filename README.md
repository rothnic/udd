# User Driven Development (UDD)

A spec-first CLI tool where **user-facing scenarios define behavior** and **BDD scenarios are tests**. Features are done when E2E tests pass.

## Quick Start

```bash
# Install the current release candidate from GitHub
npm install github:rothnic/udd

# Initialize source-of-truth files
udd init

# Sync journey discovery context to scenarios
udd sync

# Check status
udd status
```

The npm registry package is not published yet. When working from this repository
checkout instead of an installed GitHub package, use the local wrapper:

```bash
npm run udd -- <command>
```

## How It Works

```
specs/use-cases/*.yml  →→→  specs/features/**/*.feature  →→→  tests/e2e/**/*.test.ts
  (outcomes)                  (testable behaviors)             (verification)
```

1. **Define outcomes** in `specs/use-cases/` and, when generating scenarios from narrative discovery, define journeys in `product/journeys/`
2. **Run `udd sync`** - detects journey changes and proposes scenario updates
3. **Implement code** - make the tests pass
4. **Iterate** - update the use case or scenario first, then sync and test again

## Canonical Traceability Contract

UDD's enforced source-of-truth chain is:

```text
Objective -> Use Case -> Scenario -> E2E Test
```

This is the canonical model for status, lint, review, and agent handoff:

| Layer | Canonical artifact | Required for enforcement |
|-------|--------------------|--------------------------|
| Objective | Roadmap or goal item | Required when a change is planned as project work |
| Use Case | `specs/use-cases/*.yml` | Required for traceable outcomes |
| Scenario | `specs/features/**/*.feature` | Required behavior contract |
| E2E Test | `tests/e2e/**/*.test.ts` | Required proof that behavior works |

Journey files and SysML-informed notes are optional discovery context. They help humans and agents ask better questions, document alternatives, and improve scenario completeness, but they are not a separate enforced layer in the current traceability contract.

Current optional discovery backlog classifications live in
[`docs/project/optional-discovery-backlog.yml`](docs/project/optional-discovery-backlog.yml).
Those entries are advisory unless promoted into use cases, scenarios, and E2E
proof.

For the detailed authoring model, including how journeys, use cases, Gherkin
features, phase tags, variants, and non-TypeScript proof adapters fit together,
see [`docs/spec-authoring-model.md`](docs/spec-authoring-model.md).

## Source-Of-Truth Mode

Goal 006 foundation work has landed. The current repository uses the canonical
source-of-truth chain directly:

- `specs/use-cases/*.yml`, `specs/features/**/*.feature`, and `tests/e2e/**/*.test.ts` are the active enforced chain.
- `product/journeys/*.md` may be used when a feature benefits from narrative user context.
- `README.md` and `docs/**` explain the workflow, examples, rationale, and review
  evidence. They should not be the only place where product behavior is promised.
- Do not duplicate the same requirement across journey, use case, scenario, and requirement files. Keep the enforceable requirement in the scenario/use-case chain, and keep narrative context as comments or supporting docs.
- Historical compatibility context remains documented in [`goals/006-source-of-truth-foundation.md`](goals/006-source-of-truth-foundation.md), but new behavior should route through the canonical use-case, scenario, and E2E test chain.

## Spec-First Change Loop

Use this loop for behavior changes:

1. Start from the objective or goal and identify the affected use case in `specs/use-cases/`.
2. Modify the scenario in `specs/features/` first so it states the new user-observable behavior.
3. Run the matching E2E test and confirm it fails for the expected reason.
4. Implement the smallest behavior change needed to satisfy the scenario.
5. Run the E2E test again and confirm it passes.
6. Run `npm run udd -- status` and `npm run udd -- lint` to confirm the use case, scenario, and test links are still coherent.

Example: to change inbox capture behavior, update the relevant outcome in `specs/use-cases/capture_ideas.yml`, update `specs/features/udd/cli/inbox/add_item_via_cli.feature`, then run `npm test -- tests/e2e/udd/cli/inbox/add_item_via_cli.e2e.test.ts` and confirm it fails for the expected behavior gap. Implement the CLI behavior, rerun that test until it passes, then run `npm run udd -- status` and `npm run udd -- lint` to confirm trace links.

## Branch Naming Policy

The GitHub repository default branch is currently `master` (`origin/HEAD -> origin/master` as verified on 2026-05-29). Use `master` as the PR target and baseline branch unless the repository is explicitly renamed. Do not write commands that require `origin/main` unless that remote branch exists.

## Project Structure

```
specs/
├── use-cases/                    # Required outcomes and scenario links
│   └── capture_ideas.yml
└── features/                     # Required BDD behavior contracts
    └── udd/cli/inbox/
        └── add_item_via_cli.feature

tests/
└── e2e/                          # Required executable proof
    └── udd/cli/inbox/
        └── add_item_via_cli.e2e.test.ts

product/                          # Optional discovery context
└── journeys/
    └── new_user_onboarding.md
```

## Commands

> Tip: If `udd` is not globally linked, use `npm run udd -- <command>` from the repo root.

| Command | Purpose |
|---------|---------|
| `udd init` | Initialize product/ structure with interview |
| `udd sync` | Detect journey changes and propose scenario updates |
| `udd status` | Show use-case → scenario → test coverage |
| `udd new journey <slug>` | Create optional discovery-context journey file |
| `udd new scenario <domain> <action>` | Create one canonical scenario and print the expected E2E test path |
| `udd new feature <domain> <feature-name>` | Create feature file from SysML-informed template |
| `udd discover feature <domain> <name>` | Interactive feature discovery with SysML principles |
| `udd phase current/list/set/check` | Inspect, update, and validate roadmap phase state |
| `udd lint` | Validate spec structure |
| `udd validate` | Check feature scenario completeness |

## SysML-Informed Discovery

UDD uses **SysML principles to create richer feature scenarios** without adding complexity:

- 📝 Document user needs and alternatives in feature comments
- 🎯 Comprehensive scenarios covering edge cases
- 🤔 Structured thinking about requirements
- 🤖 Agent-assisted discovery workflow

Use `udd discover feature` for guided requirements analysis or see [docs/sysml-informed-discovery.md](docs/sysml-informed-discovery.md) for examples.

## Creating Features: Which Command to Use?

UDD provides three different ways to create feature files, each optimized for different workflows:

### `udd new scenario` - Quick, Simple Scenarios
**Use when:** You need a basic scenario file and a clear E2E proof obligation quickly.
```bash
udd new scenario auth login
```
- Creates: `specs/features/auth/auth/login.feature` by default, or
  `specs/features/<domain>/<feature>/<slug>.feature` when you pass the optional
  third argument.
- Prints the expected `tests/e2e/.../*.e2e.test.ts` proof obligation without
  creating a fake passing test.
- Best for: Simple, single-scenario behavior contracts.
- Context: Minimal (just basic Given/When/Then)
- Use `--use-case <id>` when the new scenario should be linked from generated
  feature metadata.

### `udd new feature` - Template-Based Features
**Use when:** You want a structured starting point with SysML context sections.
```bash
udd new feature reporting export_csv
```
- Creates: `specs/features/reporting/export_csv/export_csv.feature` (from template)
- Includes: User needs, alternatives, success criteria, multiple scenario patterns
- Best for: Complex features requiring thoughtful design documentation
- Context: Rich template with comment sections prompting for context
- **Does NOT create test files** - you write those after defining scenarios

### `udd discover feature` - Interactive Discovery
**Use when:** You want guided, interview-style feature creation.
```bash
udd discover feature reporting/csv-export
```
- Creates: Feature file through interactive prompts
- Includes: All SysML sections filled in based on your answers
- Best for: When you need help thinking through requirements systematically
- Context: Fully guided with questions about users, alternatives, edge cases

**Summary:**
- **`new scenario`** = Fast & minimal → canonical `specs/features/...` scenario
- **`new feature`** = Template with guidance → `specs/features/<domain>/<name>/` (nested structure)
- **`discover feature`** = Interactive interview → Wherever specified

## Feature Templates

The `udd new feature` command uses `templates/feature-template.feature` which includes:
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

## Optional Journey Format

Journey files are discovery context. Use them when a narrative user path helps
clarify scenarios, then link the steps to canonical scenario files.

```markdown
# Journey: New User Onboarding

**Actor:** User  
**Goal:** Sign up and start using the app

## Steps

1. User signs up → `specs/features/auth/signup.feature`
2. User creates first task → `specs/features/tasks/create.feature`

## Success

User has created their first task within 5 minutes.
```

## Feature Evolution

Split features as they grow. Keep the use case as the outcome group, and add
focused scenario files as variants become part of the product contract:

```
specs/features/auth/
└── signup/
    ├── email_password.feature       # Phase 1 account creation
    ├── email_verification.feature   # Phase 1 email ownership
    ├── social_google.feature        # Later OAuth variant
    └── google_one_tap.feature       # Later one-tap variant
```

Use `@phase:N` before the `Feature:` line when a whole scenario file belongs to
a future roadmap phase. Update an existing scenario when existing behavior
changes; add a new scenario when a new variant, rule, edge case, or phase-owned
behavior appears.

## vitest-cucumber Integration

Uses [@amiceli/vitest-cucumber](https://github.com/amiceli/vitest-cucumber):

```typescript
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";

const feature = await loadFeature("specs/features/auth/signup.feature");

describeFeature(feature, ({ Scenario }) => {
  Scenario("User signs up with email", ({ Given, When, Then }) => {
    // Step implementations
  });
});
```

## License

MIT
