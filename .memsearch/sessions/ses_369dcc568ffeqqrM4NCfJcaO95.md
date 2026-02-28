# Update source code references to new paths (@Sisyphus-Junior subagent)

**ID**: ses_369dcc568ffeqqrM4NCfJcaO95
**Project ID**: ad761ea6174e58ed763fc75290c3f403ed51079d
**Created**: 2/25/2026, 12:50:17 PM
**Stats**: 23 files changed, +735 -705

---

## USER (12:50:17 PM)

# Use SysML Principles to Enhance Feature Scenarios

**Labels:** enhancement

## Overview

Apply SysML-style thinking to create richer, more complete feature scenarios without adding separate artifact layers. This improves requirements quality while keeping UDD simple.

## Problem

Current feature scenarios can be thin:
- Missing context about user needs
- No documentation of alternatives considered
- Incomplete edge case coverage
- Agents don't know how to help with discovery

## Solution

Use SysML principles (user needs analysis, alternatives evaluation) to create **better feature files** with:
- Comments documenting why and alternatives considered
- Comprehensive scenarios covering edge cases
- Clear user context (who, what, why)
- Agent-assisted discovery prompts

**NOT adding**: Separate SysML artifacts, extra layers, parallel documents

## Enhanced Feature File Format

### Before (Thin)
```gherkin
Feature: User can export data
  Scenario: Export to CSV
    When user clicks export
    Then CSV file is downloaded
```

### After (SysML-Informed)
```gherkin
Feature: Export Project Data
  # User Need: Data analysts need to analyze project data in Excel
  # Who: Data Analysts, Project Managers
  # Why: Create custom reports, pivot tables, presentations
  # 
  # Alternatives Considered:
  #   - Direct Excel integration: Rejected (too complex, requires Office)
  #   - REST API access: Deferred (Phase 4, for advanced users)
  #   - CSV export: CHOSEN (simple, universal, immediate value)
  #
  # Success Criteria:
  #   - Export completes in < 30s for 1000 records
  #   - All visible columns included
  #   - File opens correctly in Excel
  
  Background:
    Given user is authenticated
    And user has permission to view projects
  
  Scenario: Export current view to CSV
    Given user is viewing projects list
    And the list contains 10 projects
    When user clicks "Export to CSV"
    Then file "projects_2024-01-04.csv" is downloaded
    And file contains all 10 projects
  
  Scenario: Export large dataset with progress
    Given user is viewing list with 1000+ projects
    When user clicks "Export to CSV"
    Then progress indicator appears
    And export completes within 30 seconds
```

## Implementation Changes

### 1. Update Documentation

**File:** `docs/sysml-informed-discovery.md` ✅ (Already created in merge)

**File:** `AGENTS.md` - Add section on discovery workflow ✅ (Already updated)

**File:** `README.md` - Reference SysML-informed discovery

### 2. Update Templates

**File:** `templates/feature-template.feature` (new)

### 3. Add `udd discover` Command Enhancement

**File:** `src/commands/discover.ts` (enhance existing or create)

## Acceptance Criteria

- [ ] Documentation explains SysML-informed approach ✅ (Already done)
- [ ] AGENTS.md includes discovery workflow ✅ (Already updated)
- [ ] README.md references SysML principles
- [ ] Feature template includes context sections
- [ ] `udd discover feature` command guides through questions
- [ ] Examples show rich feature files with comments
- [ ] No separate SysML artifacts created
- [ ] Feature files remain single source of truth

## Files to Create/Modify

- `README.md` - Add SysML-informed discovery reference
- `templates/feature-template.feature` - New template with context
- `src/commands/discover.ts` - Add `discover feature` subcommand
  - `examples/feature-features/` - Add example rich feature files

## Benefits

**For Humans:**
- 📊 Richer context for understanding features
- 🎯 Better thought-through requirements
- 📖 Document why decisions were made
- 🎨 No extra artifacts to maintain

**For Agents:**
- 🔍 Clear guidance on helping with discovery
- 🤖 Structured questions to ask
- ✅ Know how to create complete scenarios

**For UDD:**
- 🏆 Higher quality requirements
- ⚡ Still simple and maintainable
- 🧠 SysML principles without SysML overhead


# Add Feature Template with SysML Context

**Labels:** enhancement

## Overview

Create a feature file template that includes SysML-informed context sections, making it easy for developers and agents to create comprehensive feature scenarios.

## Problem

When creating new feature files:
- No standard template to follow
- Easy to forget context sections
- Inconsistent format across features
- Agents don't know expected structure

## Solution

Add template file that includes all SysML-informed sections as comments/placeholders.

## Template

**File:** `templates/feature-template.feature`

```gherkin
Feature: [Feature Name]
  # User Need: [What user is trying to accomplish]
  # Who: [Types of users who need this]
  # Why: [Why this matters to them]
  # 
  # Alternatives Considered:
  #   - [Option 1]: [Pros/Cons, Why chosen/rejected/deferred]
  #   - [Option 2]: [Pros/Cons, Why chosen/rejected/deferred]
  #
  # Success Criteria:
  #   - [Measurable outcome 1]
  #   - [Performance/Quality metric]
  
  Background:
    Given [common precondition]
  
  Scenario: [Happy path]
    Given [initial context]
    When [user action]
    Then [expected outcome]
  
  Scenario: [Error handling]
    Given [error condition]
    When [action]
    Then [system handles gracefully]
  
  Scenario: [Edge case]
    Given [unusual situation]
    When [action]
    Then [expected behavior]
```

## Usage

### Manual Creation
```bash
cp templates/feature-template.feature specs/features/myfeature/action.feature
# Edit placeholders
```

### With `udd new` Command
```bash
udd new feature <domain> <feature-name>
# Creates feature file from template
```

## Examples Directory

Create examples showing good usage:

**File:** `examples/feature-features/export-csv.feature`

## Acceptance Criteria

- [ ] Template file created with all SysML sections
- [ ] Template includes scenario patterns
- [ ] `udd new feature` uses template
- [ ] Example features created in docs
- [ ] README documents template usage
- [ ] Template is valid Gherkin

## Benefits

**For Humans:**
- 📝 Don't forget important context
- ✅ Consistent format across features
- 💡 Prompts remind what to include

**For Agents:**
- 🤖 Know expected format
- 📋 Can fill in template programmatically
- ✨ Understand what each section means


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

## Creating Features: Which Command to Use?

UDD provides three different ways to create feature files, each optimized for different workflows:

### `udd new scenario` - Quick, Simple Scenarios
**Use when:** You need a basic feature file and test stub quickly.
```bash
udd new scenario auth login
```
- Creates: `specs/auth/login.feature` (simple scenario)
- Creates: `tests/auth/login.e2e.test.ts` (test stub)
- Best for: Simple, single-scenario features or when rapid prototyping
- Context: Minimal (just basic Given/When/Then)

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
- **`new scenario`** = Fast & minimal → `specs/<domain>/` (flat structure)
- **`new feature`** = Template with guidance → `specs/features/<domain>/<name>/` (nested structure)
- **`discover feature`** = Interactive interview → Wherever specified

## Feature Templates

The `udd new feature` command uses `templates/feature-template.feature` which includes:
- **User Need Context** - Who needs this and why
- **Alternatives Considered** - Document design decisions
- **Success Criteria** - Measurable outcomes
- **Comprehensive Scenarios** - Happy path, errors, and edge cases

See [examples/feature-features/](examples/feature-features/) for complete examples like `export_data.feature` and `password_reset.feature`.

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


# Example Feature Files

This directory contains example feature files that demonstrate the **SysML-informed approach** to writing comprehensive Gherkin scenarios.

## What Makes These Examples "SysML-Informed"?

Each feature file includes:

1. **User Need Context** - Comments explaining who needs this and why
2. **Alternatives Analysis** - Documents what alternatives were considered and why they were rejected/deferred/chosen
3. **Success Criteria** - Clear, measurable goals for the feature
4. **Comprehensive Scenarios** - Not just happy path, but:
   - Error conditions
   - Edge cases
   - Performance considerations
   - Security aspects
   - Boundary conditions

## Available Examples

### `export_data.feature`
**Demonstrates:**
- User need analysis for a data export feature
- Evaluation of multiple export formats (CSV, Excel, API, PDF)
- Comprehensive scenarios including:
  - Happy path with various data sizes
  - Special character handling
  - Filter and sort preservation
  - Progress indicators for large datasets
  - Error handling
  - Empty state handling

**Key Takeaway:** Shows how to think through alternatives and cover all the edge cases for a seemingly simple feature.

### `password_reset.feature`
**Demonstrates:**
- Security-focused feature with user need analysis
- Evaluation of different authentication recovery methods
- Comprehensive security scenarios including:
  - Token expiration
  - Rate limiting
  - Single-use links
  - Password complexity
  - Privacy considerations (non-existent emails)
  - Token security requirements

**Key Takeaway:** Shows how SysML thinking leads to more secure, complete implementations by considering attack vectors and edge cases upfront.

## How to Use These Examples

### For Creating New Features

1. **Start with the template**: Use `/templates/feature-template.feature` as your starting point
2. **Review similar examples**: Look at these examples for inspiration
3. **Ask the right questions**:
   - Who needs this feature and why?
   - What alternatives exist?
   - What could go wrong?
   - What are the edge cases?
   - What are the performance requirements?

### For Agents

When asked to create a feature:
1. Use these examples to understand the expected level of detail
2. Ask clarifying questions similar to the comments in these files
3. Propose comprehensive scenarios covering happy path, errors, and edge cases
4. Document alternatives considered in comments

### For Code Reviews

When reviewing feature files, check:
- [ ] User need is clearly documented
- [ ] Alternatives are considered and decisions explained
- [ ] Success criteria are measurable
- [ ] Happy path is covered
- [ ] Error conditions are handled
- [ ] Edge cases are identified
- [ ] Performance considerations (if relevant)
- [ ] Security aspects (if relevant)

## Pattern: Feature File Evolution

Features often start simple and grow:

**Phase 1:** Basic happy path
```gherkin
Feature: User Login
  Scenario: User logs in successfully
    When user enters valid credentials
    Then user is logged in
```

**Phase 2:** Add error handling
```gherkin
Feature: User Login
  Scenario: User logs in successfully
    ...
  
  Scenario: User enters wrong password
    ...
```

**Phase 3:** SysML-informed (Complete)
```gherkin
Feature: User Login
  # User Need: ...
  # Alternatives: ...
  # Success Criteria: ...
  
  Scenario: User logs in successfully
  Scenario: Wrong password with lockout after N attempts  
  Scenario: Account locked notification
  Scenario: Case-insensitive email
  Scenario: Remember me functionality
  ...
```

**It's okay to start simple!** But as features mature, use SysML thinking to make them more complete.

## Tips

1. **Don't over-engineer early features** - Start with basics, add depth as you learn
2. **Use comments liberally** - Future you will thank past you
3. **Split large features** - If a feature file gets too big, split it:
   - `login_basic.feature`
   - `login_2fa.feature`
   - `login_social.feature`
4. **Keep scenarios focused** - One clear purpose per scenario
5. **Make scenarios readable** - Use Given/When/Then that reads naturally

## Benefits You'll See

✅ Fewer "oh, we didn't think about that" moments in production
✅ Better estimates (you know the full scope)
✅ Easier onboarding (new devs understand the context)
✅ Fewer bugs (edge cases are specified upfront)
✅ Better discussions (alternatives document leads to better decisions)

## Further Reading

- [docs/sysml-informed-discovery.md](../sysml-informed-discovery.md) - Full guide to the approach
- [AGENTS.md](../../AGENTS.md) - How agents should use these principles
- [templates/feature-template.feature](../../templates/feature-template.feature) - Template for creating new features


Feature: Export Project Data
  # User Need: Data analysts and project managers need to analyze project data in Excel
  # Who: Data Analysts, Project Managers, Business Stakeholders
  # Why: Create custom reports, pivot tables, and presentations for stakeholders
  # 
  # Alternatives Considered:
  #   - Direct Excel integration: Rejected (requires Office installation, platform-specific, too complex)
  #   - REST API access: Deferred to Phase 4 (for advanced users and integrations)
  #   - PDF export: Rejected (not editable, limits analysis capabilities)
  #   - CSV export: CHOSEN (simple, universal format, works with Excel, Google Sheets, and any analysis tool)
  #
  # Success Criteria:
  #   - Export completes in < 30 seconds for datasets up to 1000 records
  #   - All visible columns are included in export
  #   - File opens correctly in Excel and Google Sheets without formatting issues
  #   - Large exports show progress to user
  #   - Export respects current filters and sorting
  #
  # Edge Cases to Cover:
  #   - Empty project list
  #   - Projects with special characters in names
  #   - Very large datasets (1000+ projects)
  #   - Network interruption during export
  #   - Insufficient disk space

  Background:
    Given user is authenticated
    And user has permission to view projects

  Scenario: Export current view to CSV
    Given user is viewing the projects list
    And the list contains 10 projects
    When user clicks "Export to CSV"
    Then a file "projects_2024-01-04.csv" is downloaded
    And the file contains all 10 projects
    And the file includes columns: name, status, owner, created_date, updated_date
    And the file opens correctly in Excel

  Scenario: Export respects current filters
    Given user is viewing the projects list
    And the list is filtered to show only "Active" projects
    And there are 5 active projects and 10 archived projects
    When user clicks "Export to CSV"
    Then the exported file contains only 5 projects
    And all exported projects have status "Active"

  Scenario: Export large dataset with progress indicator
    Given user is viewing a list with 1000+ projects
    When user clicks "Export to CSV"
    Then a progress indicator appears showing "Exporting..."
    And export completes within 30 seconds
    And progress indicator shows "Complete"
    And user receives success notification "1000 projects exported"

  Scenario: Export empty list
    Given user is viewing the projects list
    And the list contains 0 projects
    When user clicks "Export to CSV"
    Then a file "projects_2024-01-04.csv" is downloaded
    And the file contains only the header row
    And user sees notification "Exported 0 projects"

  Scenario: Handle special characters in data
    Given user is viewing the projects list
    And project "Test, Project" contains a comma in the name
    And project "Quote"Test" contains quotes
    When user clicks "Export to CSV"
    Then the exported file correctly escapes special characters
    And the file opens correctly in Excel with proper cell separation

  Scenario: Export includes current sort order
    Given user is viewing the projects list
    And the list is sorted by "created_date" descending
    When user clicks "Export to CSV"
    Then the exported file preserves the sort order
    And newest projects appear first in the CSV

  Scenario: Handle export failure gracefully
    Given user is viewing the projects list with 100 projects
    And the export service is temporarily unavailable
    When user clicks "Export to CSV"
    Then user sees error message "Export failed. Please try again."
    And no partial or corrupted file is created
    And user can retry the export

  Scenario: Filename includes timestamp
    Given user is viewing the projects list
    And current date is "2024-01-04"
    And current time is "14:30:00"
    When user clicks "Export to CSV"
    Then the downloaded file is named "projects_2024-01-04_143000.csv"
    And the filename is safe for all operating systems


Feature: Password Reset
  # User Need: Users need to regain access when they forget their password
  # Who: All registered users who have forgotten their credentials
  # Why: Common security requirement - users forget passwords and need secure recovery
  # 
  # Alternatives Considered:
  #   - SMS verification: Deferred to Phase 3 (requires phone collection and SMS provider)
  #   - Security questions: Rejected (less secure, users forget answers, not NIST recommended)
  #   - Admin password reset: Rejected (not scalable, privacy concerns, requires support staff)
  #   - Email with time-limited reset link: CHOSEN (standard, secure, no additional user data required)
  #
  # Success Criteria:
  #   - Reset email arrives within 60 seconds
  #   - Reset link is valid for 1 hour
  #   - Previous reset links are invalidated when new one is requested
  #   - Password complexity requirements are enforced
  #   - User is automatically logged in after successful reset
  #
  # Edge Cases to Cover:
  #   - Email doesn't exist in system
  #   - Reset link expires before use
  #   - User requests multiple resets
  #   - Weak password attempts
  #   - Reset link is reused after successful reset

  Background:
    Given the password reset feature is enabled
    And the email service is available

  Scenario: User requests password reset
    Given a registered user with email "user@example.com"
    When user navigates to login page
    And user clicks "Forgot Password"
    And user enters email "user@example.com"
    And user clicks "Send Reset Link"
    Then user sees message "Check your email for reset instructions"
    And an email is sent to "user@example.com"
    And the email subject is "Password Reset Request"
    And the email contains a reset link valid for 1 hour

  Scenario: User completes password reset successfully
    Given user "user@example.com" has requested a password reset
    And user has received a valid reset link
    When user clicks the reset link in email
    Then user is taken to password reset page
    When user enters new password "SecurePass123!"
    And user confirms password "SecurePass123!"
    And user clicks "Reset Password"
    Then password is updated in the system
    And user is automatically logged in
    And user sees success message "Password reset successful"
    And user is redirected to dashboard

  Scenario: Reset link expires after time limit
    Given user "user@example.com" has requested a password reset
    And the reset link was generated 2 hours ago
    When user clicks the expired reset link
    Then user sees message "This reset link has expired"
    And user sees a button "Request New Reset Link"
    And the expired link cannot be used to reset password

  Scenario: User requests multiple resets in succession
    Given user "user@example.com" exists
    When user requests password reset at "14:00:00"
    And user requests password reset again at "14:05:00"
    And user requests password reset again at "14:10:00"
    Then only the most recent reset link is valid
    And the two previous reset links are invalidated
    And user receives only one active reset email

  Scenario: Non-existent email address
    Given no user exists with email "nonexistent@example.com"
    When user requests password reset for "nonexistent@example.com"
    Then user sees message "Check your email for reset instructions"
    And no email is sent
    And no error reveals that the email doesn't exist

  Scenario: Password doesn't meet complexity requirements
    Given user "user@example.com" has a valid reset link
    When user clicks the reset link
    And user enters new password "weak"
    And user clicks "Reset Password"
    Then user sees error "Password must be at least 8 characters and include uppercase, lowercase, and number"
    And password is not changed
    And user can try again

  Scenario: Passwords don't match during reset
    Given user "user@example.com" has a valid reset link
    When user clicks the reset link
    And user enters new password "SecurePass123!"
    And user enters confirmation password "DifferentPass456!"
    And user clicks "Reset Password"
    Then user sees error "Passwords do not match"
    And password is not changed
    And form remains populated for retry

  Scenario: Reset link is single-use
    Given user "user@example.com" has a valid reset link
    When user completes password reset successfully
    And user tries to use the same reset link again
    Then user sees message "This reset link has already been used"
    And user is prompted to request a new link if needed

  Scenario: Rate limiting on reset requests
    Given user "user@example.com" exists
    When user requests password reset 5 times within 1 minute
    Then subsequent requests are blocked
    And user sees message "Too many reset requests. Please try again in 15 minutes."
    And no additional emails are sent

  Scenario: Reset link contains secure token
    Given user "user@example.com" requests a password reset
    When the reset email is generated
    Then the reset link contains a cryptographically secure random token
    And the token is at least 32 characters long
    And the token is single-use
    And the token cannot be guessed or enumerated


# Example: Todo App with UDD

This walkthrough demonstrates UDD on a simple todo app.

## 1. Initialize

```bash
mkdir todo-app && cd todo-app
npm init -y
npx udd init
```

Answer prompts:
- **Building:** A todo app for personal productivity
- **Actors:** User
- **First action:** Creates their first todo
- **Constraints:** Works offline, syncs when online

Creates:
```
product/
├── README.md
├── actors.md
├── constraints.md
├── changelog.md
└── journeys/new_user_onboarding.md
```

## 2. Define a Journey

Edit `product/journeys/new_user_onboarding.md`:

```markdown
# Journey: New User Onboarding

**Actor:** User  
**Goal:** Create their first todo and mark it complete

## Steps

1. User opens the app → `specs/todos/view_empty_state.feature`
2. User adds a todo → `specs/todos/add_todo.feature`
3. User completes the todo → `specs/todos/complete_todo.feature`

## Success

User has added and completed their first todo within 2 minutes.
```

## 3. Sync Journey to Scenarios

```bash
udd sync
```

Output:
```
🔄 Syncing journeys to scenarios...

📝 Journey: New User Onboarding (new)
  → specs/todos/view_empty_state.feature (missing)
    Create? [Y/n] y
    ✓ Created specs/todos/view_empty_state.feature
    ✓ Created tests/todos/view_empty_state.e2e.test.ts
  → specs/todos/add_todo.feature (missing)
    Create? [Y/n] y
    ✓ Created specs/todos/add_todo.feature
    ✓ Created tests/todos/add_todo.e2e.test.ts
  → specs/todos/complete_todo.feature (missing)
    Create? [Y/n] y
    ✓ Created specs/todos/complete_todo.feature
    ✓ Created tests/todos/complete_todo.e2e.test.ts

📊 Sync Summary:
   Journeys processed: 1
   Changes detected: 1
   Scenarios created: 3
```

## 4. Review Generated Scenarios

`specs/todos/add_todo.feature`:
```gherkin
Feature: New User Onboarding

  Scenario: User adds a todo
    Given I am a User
    When I user adds a todo
    Then the action is completed successfully
```

Edit to be more specific:
```gherkin
Feature: Todo Management

  Scenario: User adds a todo
    Given I have no todos
    When I add a todo with title "Buy groceries"
    Then I should see "Buy groceries" in my todo list
```

## 5. Run Tests (Fail First)

```bash
npm test
```

Tests fail because there's no implementation.

## 6. Implement

Create `src/todos.ts`:
```typescript
export interface Todo {
  id: string;
  title: string;
  completed: boolean;
}

const todos: Todo[] = [];

export function addTodo(title: string): Todo {
  const todo = { id: Date.now().toString(), title, completed: false };
  todos.push(todo);
  return todo;
}

export function getTodos(): Todo[] {
  return todos;
}

export function completeTodo(id: string): void {
  const todo = todos.find(t => t.id === id);
  if (todo) todo.completed = true;
}
```

## 7. Update Test

`tests/todos/add_todo.e2e.test.ts`:
```typescript
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { expect } from "vitest";
import { addTodo, getTodos } from "../../src/todos";

const feature = await loadFeature("specs/todos/add_todo.feature");

describeFeature(feature, ({ Scenario }) => {
  Scenario("User adds a todo", ({ Given, When, Then }) => {
    Given("I have no todos", () => {
      // Reset state for test
    });

    When(/I add a todo with title "(.+)"/, (title: string) => {
      addTodo(title);
    });

    Then(/I should see "(.+)" in my todo list/, (title: string) => {
      const todos = getTodos();
      expect(todos.some(t => t.title === title)).toBe(true);
    });
  });
});
```

## 8. Run Tests (Pass)

```bash
npm test
# ✓ All tests pass
```

## 9. Check Status

```bash
udd status
```

Output:
```
Project Status
==============

User Journeys:
  New User Onboarding: 3/3
```

## 10. Iterate

Add more journeys for new features:
- `product/journeys/manage_multiple_todos.md`
- `product/journeys/filter_todos.md`

Then `udd sync` and repeat.

## Summary

The UDD workflow:
1. **Intent** → User journeys describe what users accomplish
2. **Behavior** → BDD scenarios define testable behaviors
3. **Verification** → E2E tests verify the system works
4. **Implementation** → Code makes tests pass

This keeps development user-focused and spec-driven.


# Examples

This directory contains curated example artifacts to illustrate UDD patterns and project structure.

Structure:
- feature-examples/: Example Gherkin feature files (SysML-informed)
- todo-app/: Minimal example product for a Todo app (journeys, actors, constraints)

Use these examples as references when creating new journeys, features, and tests.

## Purpose
These examples are intended to help contributors and agents understand expected file layout and the level of detail for product artifacts.


# Example Feature Files

This directory contains example feature files that demonstrate the **SysML-informed approach** to writing comprehensive Gherkin scenarios.

## What Makes These Examples "SysML-Informed"?

Each feature file includes:

1. **User Need Context** - Comments explaining who needs this and why
2. **Alternatives Analysis** - Documents what alternatives were considered and why they were rejected/deferred/chosen
3. **Success Criteria** - Clear, measurable goals for the feature
4. **Comprehensive Scenarios** - Not just happy path, but:
   - Error conditions
   - Edge cases
   - Performance considerations
   - Security aspects
   - Boundary conditions

## Available Examples

### `export_data.feature`
**Demonstrates:**
- User need analysis for a data export feature
- Evaluation of multiple export formats (CSV, Excel, API, PDF)
- Comprehensive scenarios including:
  - Happy path with various data sizes
  - Special character handling
  - Filter and sort preservation
  - Progress indicators for large datasets
  - Error handling
  - Empty state handling

**Key Takeaway:** Shows how to think through alternatives and cover all the edge cases for a seemingly simple feature.

### `password_reset.feature`
**Demonstrates:**
- Security-focused feature with user need analysis
- Evaluation of different authentication recovery methods
- Comprehensive security scenarios including:
  - Token expiration
  - Rate limiting
  - Single-use links
  - Password complexity
  - Privacy considerations (non-existent emails)
  - Token security requirements

**Key Takeaway:** Shows how SysML thinking leads to more secure, complete implementations by considering attack vectors and edge cases upfront.

## How to Use These Examples

### For Creating New Features

1. **Start with the template**: Use `/templates/feature-template.feature` as your starting point
2. **Review similar examples**: Look at these examples for inspiration
3. **Ask the right questions**:
   - Who needs this feature and why?
   - What alternatives exist?
   - What could go wrong?
   - What are the edge cases?
   - What are the performance requirements?

### For Agents

When asked to create a feature:
1. Use these examples to understand the expected level of detail
2. Ask clarifying questions similar to the comments in these files
3. Propose comprehensive scenarios covering happy path, errors, and edge cases
4. Document alternatives considered in comments

### For Code Reviews

When reviewing feature files, check:
- [ ] User need is clearly documented
- [ ] Alternatives are considered and decisions explained
- [ ] Success criteria are measurable
- [ ] Happy path is covered
- [ ] Error conditions are handled
- [ ] Edge cases are identified
- [ ] Performance considerations (if relevant)
- [ ] Security aspects (if relevant)

## Pattern: Feature File Evolution

Features often start simple and grow:

**Phase 1:** Basic happy path
```gherkin
Feature: User Login
  Scenario: User logs in successfully
    When user enters valid credentials
    Then user is logged in
```

**Phase 2:** Add error handling
```gherkin
Feature: User Login
  Scenario: User logs in successfully
    ...
  
  Scenario: User enters wrong password
    ...
```

**Phase 3:** SysML-informed (Complete)
```gherkin
Feature: User Login
  # User Need: ...
  # Alternatives: ...
  # Success Criteria: ...
  
  Scenario: User logs in successfully
  Scenario: Wrong password with lockout after N attempts  
  Scenario: Account locked notification
  Scenario: Case-insensitive email
  Scenario: Remember me functionality
  ...
```

**It's okay to start simple!** But as features mature, use SysML thinking to make them more complete.

## Tips

1. **Don't over-engineer early features** - Start with basics, add depth as you learn
2. **Use comments liberally** - Future you will thank past you
3. **Split large features** - If a feature file gets too big, split it:
   - `login_basic.feature`
   - `login_2fa.feature`
   - `login_social.feature`
4. **Keep scenarios focused** - One clear purpose per scenario
5. **Make scenarios readable** - Use Given/When/Then that reads naturally

## Benefits You'll See

✅ Fewer "oh, we didn't think about that" moments in production
✅ Better estimates (you know the full scope)
✅ Easier onboarding (new devs understand the context)
✅ Fewer bugs (edge cases are specified upfront)
✅ Better discussions (alternatives document leads to better decisions)

## Further Reading

- [docs/sysml-informed-discovery.md](../sysml-informed-discovery.md) - Full guide to the approach
- [AGENTS.md](../../AGENTS.md) - How agents should use these principles
- [templates/feature-template.feature](../../templates/feature-template.feature) - Template for creating new features


Feature: Export Project Data
  # User Need: Data analysts and project managers need to analyze project data in Excel
  # Who: Data Analysts, Project Managers, Business Stakeholders
  # Why: Create custom reports, pivot tables, and presentations for stakeholders
  # 
  # Alternatives Considered:
  #   - Direct Excel integration: Rejected (requires Office installation, platform-specific, too complex)
  #   - REST API access: Deferred to Phase 4 (for advanced users and integrations)
  #   - PDF export: Rejected (not editable, limits analysis capabilities)
  #   - CSV export: CHOSEN (simple, universal format, works with Excel, Google Sheets, and any analysis tool)
  #
  # Success Criteria:
  #   - Export completes in < 30 seconds for datasets up to 1000 records
  #   - All visible columns are included in export
  #   - File opens correctly in Excel and Google Sheets without formatting issues
  #   - Large exports show progress to user
  #   - Export respects current filters and sorting
  #
  # Edge Cases to Cover:
  #   - Empty project list
  #   - Projects with special characters in names
  #   - Very large datasets (1000+ projects)
  #   - Network interruption during export
  #   - Insufficient disk space

  Background:
    Given user is authenticated
    And user has permission to view projects

  Scenario: Export current view to CSV
    Given user is viewing the projects list
    And the list contains 10 projects
    When user clicks "Export to CSV"
    Then a file "projects_2024-01-04.csv" is downloaded
    And the file contains all 10 projects
    And the file includes columns: name, status, owner, created_date, updated_date
    And the file opens correctly in Excel

  Scenario: Export respects current filters
    Given user is viewing the projects list
    And the list is filtered to show only "Active" projects
    And there are 5 active projects and 10 archived projects
    When user clicks "Export to CSV"
    Then the exported file contains only 5 projects
    And all exported projects have status "Active"

  Scenario: Export large dataset with progress indicator
    Given user is viewing a list with 1000+ projects
    When user clicks "Export to CSV"
    Then a progress indicator appears showing "Exporting..."
    And export completes within 30 seconds
    And progress indicator shows "Complete"
    And user receives success notification "1000 projects exported"

  Scenario: Export empty list
    Given user is viewing the projects list
    And the list contains 0 projects
    When user clicks "Export to CSV"
    Then a file "projects_2024-01-04.csv" is downloaded
    And the file contains only the header row
    And user sees notification "Exported 0 projects"

  Scenario: Handle special characters in data
    Given user is viewing the projects list
    And project "Test, Project" contains a comma in the name
    And project "Quote"Test" contains quotes
    When user clicks "Export to CSV"
    Then the exported file correctly escapes special characters
    And the file opens correctly in Excel with proper cell separation

  Scenario: Export includes current sort order
    Given user is viewing the projects list
    And the list is sorted by "created_date" descending
    When user clicks "Export to CSV"
    Then the exported file preserves the sort order
    And newest projects appear first in the CSV

  Scenario: Handle export failure gracefully
    Given user is viewing the projects list with 100 projects
    And the export service is temporarily unavailable
    When user clicks "Export to CSV"
    Then user sees error message "Export failed. Please try again."
    And no partial or corrupted file is created
    And user can retry the export

  Scenario: Filename includes timestamp
    Given user is viewing the projects list
    And current date is "2024-01-04"
    And current time is "14:30:00"
    When user clicks "Export to CSV"
    Then the downloaded file is named "projects_2024-01-04_143000.csv"
    And the filename is safe for all operating systems


Feature: Password Reset
  # User Need: Users need to regain access when they forget their password
  # Who: All registered users who have forgotten their credentials
  # Why: Common security requirement - users forget passwords and need secure recovery
  # 
  # Alternatives Considered:
  #   - SMS verification: Deferred to Phase 3 (requires phone collection and SMS provider)
  #   - Security questions: Rejected (less secure, users forget answers, not NIST recommended)
  #   - Admin password reset: Rejected (not scalable, privacy concerns, requires support staff)
  #   - Email with time-limited reset link: CHOSEN (standard, secure, no additional user data required)
  #
  # Success Criteria:
  #   - Reset email arrives within 60 seconds
  #   - Reset link is valid for 1 hour
  #   - Previous reset links are invalidated when new one is requested
  #   - Password complexity requirements are enforced
  #   - User is automatically logged in after successful reset
  #
  # Edge Cases to Cover:
  #   - Email doesn't exist in system
  #   - Reset link expires before use
  #   - User requests multiple resets
  #   - Weak password attempts
  #   - Reset link is reused after successful reset

  Background:
    Given the password reset feature is enabled
    And the email service is available

  Scenario: User requests password reset
    Given a registered user with email "user@example.com"
    When user navigates to login page
    And user clicks "Forgot Password"
    And user enters email "user@example.com"
    And user clicks "Send Reset Link"
    Then user sees message "Check your email for reset instructions"
    And an email is sent to "user@example.com"
    And the email subject is "Password Reset Request"
    And the email contains a reset link valid for 1 hour

  Scenario: User completes password reset successfully
    Given user "user@example.com" has requested a password reset
    And user has received a valid reset link
    When user clicks the reset link in email
    Then user is taken to password reset page
    When user enters new password "SecurePass123!"
    And user confirms password "SecurePass123!"
    And user clicks "Reset Password"
    Then password is updated in the system
    And user is automatically logged in
    And user sees success message "Password reset successful"
    And user is redirected to dashboard

  Scenario: Reset link expires after time limit
    Given user "user@example.com" has requested a password reset
    And the reset link was generated 2 hours ago
    When user clicks the expired reset link
    Then user sees message "This reset link has expired"
    And user sees a button "Request New Reset Link"
    And the expired link cannot be used to reset password

  Scenario: User requests multiple resets in succession
    Given user "user@example.com" exists
    When user requests password reset at "14:00:00"
    And user requests password reset again at "14:05:00"
    And user requests password reset again at "14:10:00"
    Then only the most recent reset link is valid
    And the two previous reset links are invalidated
    And user receives only one active reset email

  Scenario: Non-existent email address
    Given no user exists with email "nonexistent@example.com"
    When user requests password reset for "nonexistent@example.com"
    Then user sees message "Check your email for reset instructions"
    And no email is sent
    And no error reveals that the email doesn't exist

  Scenario: Password doesn't meet complexity requirements
    Given user "user@example.com" has a valid reset link
    When user clicks the reset link
    And user enters new password "weak"
    And user clicks "Reset Password"
    Then user sees error "Password must be at least 8 characters and include uppercase, lowercase, and number"
    And password is not changed
    And user can try again

  Scenario: Passwords don't match during reset
    Given user "user@example.com" has a valid reset link
    When user clicks the reset link
    And user enters new password "SecurePass123!"
    And user enters confirmation password "DifferentPass456!"
    And user clicks "Reset Password"
    Then user sees error "Passwords do not match"
    And password is not changed
    And form remains populated for retry

  Scenario: Reset link is single-use
    Given user "user@example.com" has a valid reset link
    When user completes password reset successfully
    And user tries to use the same reset link again
    Then user sees message "This reset link has already been used"
    And user is prompted to request a new link if needed

  Scenario: Rate limiting on reset requests
    Given user "user@example.com" exists
    When user requests password reset 5 times within 1 minute
    Then subsequent requests are blocked
    And user sees message "Too many reset requests. Please try again in 15 minutes."
    And no additional emails are sent

  Scenario: Reset link contains secure token
    Given user "user@example.com" requests a password reset
    When the reset email is generated
    Then the reset link contains a cryptographically secure random token
    And the token is at least 32 characters long
    And the token is single-use
    And the token cannot be guessed or enumerated


# Example: Todo App with UDD

This walkthrough demonstrates UDD on a simple todo app.

## 1. Initialize

```bash
mkdir todo-app && cd todo-app
npm init -y
npx udd init
```

Answer prompts:
- **Building:** A todo app for personal productivity
- **Actors:** User
- **First action:** Creates their first todo
- **Constraints:** Works offline, syncs when online

Creates:
```
product/
├── README.md
├── actors.md
├── constraints.md
├── changelog.md
└── journeys/new_user_onboarding.md
```

## 2. Define a Journey

Edit `product/journeys/new_user_onboarding.md`:

```markdown
# Journey: New User Onboarding

**Actor:** User  
**Goal:** Create their first todo and mark it complete

## Steps

1. User opens the app → `specs/todos/view_empty_state.feature`
2. User adds a todo → `specs/todos/add_todo.feature`
3. User completes the todo → `specs/todos/complete_todo.feature`

## Success

User has added and completed their first todo within 2 minutes.
```

## 3. Sync Journey to Scenarios

```bash
udd sync
```

Output:
```
🔄 Syncing journeys to scenarios...

📝 Journey: New User Onboarding (new)
  → specs/todos/view_empty_state.feature (missing)
    Create? [Y/n] y
    ✓ Created specs/todos/view_empty_state.feature
    ✓ Created tests/todos/view_empty_state.e2e.test.ts
  → specs/todos/add_todo.feature (missing)
    Create? [Y/n] y
    ✓ Created specs/todos/add_todo.feature
    ✓ Created tests/todos/add_todo.e2e.test.ts
  → specs/todos/complete_todo.feature (missing)
    Create? [Y/n] y
    ✓ Created specs/todos/complete_todo.feature
    ✓ Created tests/todos/complete_todo.e2e.test.ts

📊 Sync Summary:
   Journeys processed: 1
   Changes detected: 1
   Scenarios created: 3
```

## 4. Review Generated Scenarios

`specs/todos/add_todo.feature`:
```gherkin
Feature: New User Onboarding

  Scenario: User adds a todo
    Given I am a User
    When I user adds a todo
    Then the action is completed successfully
```

Edit to be more specific:
```gherkin
Feature: Todo Management

  Scenario: User adds a todo
    Given I have no todos
    When I add a todo with title "Buy groceries"
    Then I should see "Buy groceries" in my todo list
```

## 5. Run Tests (Fail First)

```bash
npm test
```

Tests fail because there's no implementation.

## 6. Implement

Create `src/todos.ts`:
```typescript
export interface Todo {
  id: string;
  title: string;
  completed: boolean;
}

const todos: Todo[] = [];

export function addTodo(title: string): Todo {
  const todo = { id: Date.now().toString(), title, completed: false };
  todos.push(todo);
  return todo;
}

export function getTodos(): Todo[] {
  return todos;
}

export function completeTodo(id: string): void {
  const todo = todos.find(t => t.id === id);
  if (todo) todo.completed = true;
}
```

## 7. Update Test

`tests/todos/add_todo.e2e.test.ts`:
```typescript
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { expect } from "vitest";
import { addTodo, getTodos } from "../../src/todos";

const feature = await loadFeature("specs/todos/add_todo.feature");

describeFeature(feature, ({ Scenario }) => {
  Scenario("User adds a todo", ({ Given, When, Then }) => {
    Given("I have no todos", () => {
      // Reset state for test
    });

    When(/I add a todo with title "(.+)"/, (title: string) => {
      addTodo(title);
    });

    Then(/I should see "(.+)" in my todo list/, (title: string) => {
      const todos = getTodos();
      expect(todos.some(t => t.title === title)).toBe(true);
    });
  });
});
```

## 8. Run Tests (Pass)

```bash
npm test
# ✓ All tests pass
```

## 9. Check Status

```bash
udd status
```

Output:
```
Project Status
==============

User Journeys:
  New User Onboarding: 3/3
```

## 10. Iterate

Add more journeys for new features:
- `product/journeys/manage_multiple_todos.md`
- `product/journeys/filter_todos.md`

Then `udd sync` and repeat.

## Summary

The UDD workflow:
1. **Intent** → User journeys describe what users accomplish
2. **Behavior** → BDD scenarios define testable behaviors
3. **Verification** → E2E tests verify the system works
4. **Implementation** → Code makes tests pass

This keeps development user-focused and spec-driven.


# Actors — Todo App

Actors (minimal):

- User: A person who creates, updates, and completes todo items.
- Guest: Unauthenticated user who can view public todos (optional).
- Admin: Can manage all todos and users (optional, out of scope for basic examples).

Keep actor definitions concise for example purposes.


# Constraints — Todo App

Non-functional constraints (minimal):

- Response time: API should respond within 200ms for common operations in dev example
- Data retention: Example data may be ephemeral; production retention is out of scope
- Security: Authentication required for modifying todos; example omits provider details

These are minimal placeholders to demonstrate required files in the product directory.


---
# Example journey manifest demonstrating linking pattern
# Based on specs/traceability-contract.yml

id: example_journey
title: Example journey manifest
actor: user.persona.example
goal: Demonstrate forward and reverse traceability links from journey to tests
summary: |
  Small example manifest showing how to link journey -> use_cases -> scenarios -> e2e_tests
  and provide reverse links and an ownership matrix.
tags:
  - example
  - traceability

use_cases:
  - id: uc.example.onboard
    name: Onboard new user
    actors:
      - user.persona.example
    outcomes:
      scenarios:
        - sc.auth.signup
        - sc.auth.verify_email

  - id: uc.example.create_item
    name: Create first item
    actors:
      - user.persona.example
    outcomes:
      scenarios:
        - sc.items.create_first

# Forward links (authoritative pointers)
forward_links:
  journey_to_use_cases:
    - uc.example.onboard
    - uc.example.create_item

  use_case_to_scenarios:
    uc.example.onboard:
      - sc.auth.signup
      - sc.auth.verify_email
    uc.example.create_item:
      - sc.items.create_first

  scenario_to_e2e_tests:
    sc.auth.signup:
      - id: e2e.auth.signup.test
        path: tests/auth/signup.e2e.test.ts
        status: unknown
    sc.auth.verify_email:
      - id: e2e.auth.verify_email.test
        path: tests/auth/verify_email.e2e.test.ts
        status: unknown
    sc.items.create_first:
      - id: e2e.items.create_first.test
        path: tests/items/create_first.e2e.test.ts
        status: unknown

# Reverse links (computed / explicit reverse mapping to help tools)
reverse_links:
  tests_to_scenarios:
    tests/auth/signup.e2e.test.ts: sc.auth.signup
    tests/auth/verify_email.e2e.test.ts: sc.auth.verify_email
    tests/items/create_first.e2e.test.ts: sc.items.create_first

  scenarios_to_use_cases:
    sc.auth.signup: uc.example.onboard
    sc.auth.verify_email: uc.example.onboard
    sc.items.create_first: uc.example.create_item

  use_cases_to_journeys:
    uc.example.onboard: example_journey
    uc.example.create_item: example_journey

# Ownership matrix: human | agent | generated
ownership:
  journey:
    human: product_manager@example.com
    agent: sre-agent
    generated: false

  use_cases:
    uc.example.onboard:
      human: pm@example.com
      agent: spec-generator
      generated: true
    uc.example.create_item:
      human: pm@example.com
      agent: spec-generator
      generated: true

  scenarios:
    sc.auth.signup:
      human: qa_lead@example.com
      agent: udd-sync
      generated: true
    sc.auth.verify_email:
      human: qa_lead@example.com
      agent: udd-sync
      generated: true
    sc.items.create_first:
      human: product_owner@example.com
      agent: udd-sync
      generated: true

  e2e_tests:
    e2e.auth.signup.test:
      human: qa_eng@example.com
      agent: test-gen
      generated: true
    e2e.auth.verify_email.test:
      human: qa_eng@example.com
      agent: test-gen
      generated: true
    e2e.items.create_first.test:
      human: qa_eng@example.com
      agent: test-gen
      generated: true

references:
  traceability_contract: specs/traceability-contract.yml

evidence:
  - .sisyphus/evidence/phase2/task-8-traversal.md
  - .sisyphus/evidence/phase2/task-8-stale.md

---


---
# Example journey manifest demonstrating linking pattern
# Based on specs/traceability-contract.yml

id: example_journey
title: Example journey manifest
actor: user.persona.example
goal: Demonstrate forward and reverse traceability links from journey to tests
summary: |
  Small example manifest showing how to link journey -> use_cases -> scenarios -> e2e_tests
  and provide reverse links and an ownership matrix.
tags:
  - example
  - traceability

use_cases:
  - id: uc.example.onboard
    name: Onboard new user
    actors:
      - user.persona.example
    outcomes:
      scenarios:
        - sc.auth.signup
        - sc.auth.verify_email

  - id: uc.example.create_item
    name: Create first item
    actors:
      - user.persona.example
    outcomes:
      scenarios:
        - sc.items.create_first

# Forward links (authoritative pointers)
forward_links:
  journey_to_use_cases:
    - uc.example.onboard
    - uc.example.create_item

  use_case_to_scenarios:
    uc.example.onboard:
      - sc.auth.signup
      - sc.auth.verify_email
    uc.example.create_item:
      - sc.items.create_first

  scenario_to_e2e_tests:
    sc.auth.signup:
      - id: e2e.auth.signup.test
        path: tests/auth/signup.e2e.test.ts
        status: unknown
    sc.auth.verify_email:
      - id: e2e.auth.verify_email.test
        path: tests/auth/verify_email.e2e.test.ts
        status: unknown
    sc.items.create_first:
      - id: e2e.items.create_first.test
        path: tests/items/create_first.e2e.test.ts
        status: unknown

# Reverse links (computed / explicit reverse mapping to help tools)
reverse_links:
  tests_to_scenarios:
    tests/auth/signup.e2e.test.ts: sc.auth.signup
    tests/auth/verify_email.e2e.test.ts: sc.auth.verify_email
    tests/items/create_first.e2e.test.ts: sc.items.create_first

  scenarios_to_use_cases:
    sc.auth.signup: uc.example.onboard
    sc.auth.verify_email: uc.example.onboard
    sc.items.create_first: uc.example.create_item

  use_cases_to_journeys:
    uc.example.onboard: example_journey
    uc.example.create_item: example_journey

# Ownership matrix: human | agent | generated
ownership:
  journey:
    human: product_manager@example.com
    agent: sre-agent
    generated: false

  use_cases:
    uc.example.onboard:
      human: pm@example.com
      agent: spec-generator
      generated: true
    uc.example.create_item:
      human: pm@example.com
      agent: spec-generator
      generated: true

  scenarios:
    sc.auth.signup:
      human: qa_lead@example.com
      agent: udd-sync
      generated: true
    sc.auth.verify_email:
      human: qa_lead@example.com
      agent: udd-sync
      generated: true
    sc.items.create_first:
      human: product_owner@example.com
      agent: udd-sync
      generated: true

  e2e_tests:
    e2e.auth.signup.test:
      human: qa_eng@example.com
      agent: test-gen
      generated: true
    e2e.auth.verify_email.test:
      human: qa_eng@example.com
      agent: test-gen
      generated: true
    e2e.items.create_first.test:
      human: qa_eng@example.com
      agent: test-gen
      generated: true

references:
  traceability_contract: specs/traceability-contract.yml

evidence:
  - .sisyphus/evidence/phase2/task-8-traversal.md
  - .sisyphus/evidence/phase2/task-8-stale.md

---


Feature: Validate Feature Completeness
  # User Need: Developers need feedback on whether their feature scenarios are complete
  # Who: Developers, Product Owners, Quality Engineers
  # Why: Ensure feature scenarios follow SysML-informed best practices and cover edge cases
  # 
  # Alternatives Considered:
  #   - Manual code review: Rejected (inconsistent, time-consuming, subjective)
  #   - Agent-only validation: Deferred (Phase 4, for more sophisticated analysis)
  #   - Linting only structure: Rejected (doesn't check completeness of scenarios)
  #   - Automated completeness scoring: CHOSEN (fast, consistent, actionable feedback)
  #
  # Success Criteria:
  #   - Command runs in < 5 seconds for typical project
  #   - Provides clear, actionable feedback
  #   - Scores features on 0-100% completeness scale
  #   - Identifies missing SysML context
  #   - Flags incomplete scenario coverage

  Scenario: Validate all feature files in project
    Given I have feature files in the specs directory
    When I run "udd validate"
    Then the command should succeed
    And the output should show completeness scores for each feature
    And the output should show an average completeness score

  Scenario: Validate specific feature file
    Given I have a feature file "examples/feature-features/export_data.feature"
    When I run "udd validate -f examples/feature-features/export_data.feature"
    Then the command should succeed
    And the output should show the completeness score for that feature

  Scenario: Validate reports missing SysML context
    Given I have a feature file without SysML comments
    When I run "udd validate -f specs/features/udd/cli/check_status.feature"
    Then the output should warn about missing user need context
    And the output should warn about missing alternatives analysis
    And the output should warn about missing success criteria

  Scenario: Validate scores complete features at 100%
    Given I have a complete feature file "examples/feature-features/export_data.feature"
    When I run "udd validate -f examples/feature-features/export_data.feature"
    Then the completeness score should be 100%
    And the output should show "Complete"


import fs from "node:fs/promises";
import path from "node:path";
import { confirm, input, select } from "@inquirer/prompts";
import chalk from "chalk";
import { Command } from "commander";

export const discoverCommand = new Command("discover").description(
	"Interactive feature discovery using SysML principles",
);

discoverCommand
	.command("feature")
	.argument(
		"<path>",
		"Feature path (e.g., export/csv-export, export/tabular/csv, auth/login)",
	)
	.description("Guided feature discovery with SysML-style analysis")
	.action(async (featurePath: string) => {
		// Parse the path into directory parts and feature name
		const pathParts = featurePath.split("/").filter((part) => part.length > 0);
		if (pathParts.length < 2) {
			console.error(
				chalk.red(
					"Error: Feature path must be in format <domain>/<name> or <domain>/<subdomain>/<name> (e.g., export/csv-export, export/tabular/csv)",
				),
			);
			process.exit(1);
		}
		const name = pathParts[pathParts.length - 1];
		const domain = pathParts.slice(0, -1).join("/");
		console.log(chalk.blue.bold("\n🔍 SysML-Informed Feature Discovery\n"));
		console.log(
			chalk.dim(
				"Let's think through this feature thoroughly before writing scenarios.\n",
			),
		);

		try {
			// Step 1: Understand the user need
			console.log(chalk.yellow("📋 Step 1: User Need Analysis\n"));

			// Helper function to sanitize input for Gherkin comments
			const sanitizeForComment = (text: string): string => {
				return text
					.replace(/\n/g, " ") // Replace newlines with spaces
					.replace(/\r/g, "") // Remove carriage returns
					.trim();
			};

			const userNeed = sanitizeForComment(
				await input({
					message: "What user need does this feature address?",
					validate: (value) =>
						value.length > 0 || "Please describe the user need",
				}),
			);

			const who = sanitizeForComment(
				await input({
					message: "Who are the users/actors? (e.g., Data Analysts, Users)",
					validate: (value) => value.length > 0 || "Please specify the users",
				}),
			);

			const why = sanitizeForComment(
				await input({
					message: "Why does this matter? (Business value)",
					validate: (value) =>
						value.length > 0 || "Please explain the business value",
				}),
			);

			// Step 2: Alternatives
			console.log(chalk.yellow("\n🤔 Step 2: Alternatives Analysis\n"));
			console.log(
				chalk.dim("Consider different approaches before committing to one.\n"),
			);

			const alternatives: Array<{
				name: string;
				description: string;
				decision: string;
				reason: string;
			}> = [];

			let addMore = true;
			while (addMore) {
				const altName = sanitizeForComment(
					await input({
						message: "Alternative approach name:",
					}),
				);

				if (!altName) {
					if (alternatives.length === 0) {
						console.log(
							chalk.yellow(
								"\nAt least one alternative should be considered. Please add one.\n",
							),
						);
						continue;
					}
					break;
				}

				const altDescription = sanitizeForComment(
					await input({
						message: `Describe "${altName}":`,
					}),
				);

				const altDecision = await select({
					message: `Decision for "${altName}":`,
					choices: [
						{ name: "Chosen (this is the best option)", value: "CHOSEN" },
						{ name: "Deferred (maybe later)", value: "Deferred" },
						{ name: "Rejected (not suitable)", value: "Rejected" },
					],
				});

				const altReason = sanitizeForComment(
					await input({
						message: `Why ${altDecision.toLowerCase()}?`,
					}),
				);

				alternatives.push({
					name: altName,
					description: altDescription,
					decision: altDecision,
					reason: altReason,
				});

				addMore = await confirm({
					message: "Add another alternative?",
					default: true,
				});
			}

			// Step 3: Success Criteria
			console.log(chalk.yellow("\n✅ Step 3: Success Criteria\n"));
			console.log(
				chalk.dim("What does 'done' look like? Be specific and measurable.\n"),
			);

			const successCriteria: string[] = [];
			let addMoreCriteria = true;

			while (addMoreCriteria) {
				const criterion = sanitizeForComment(
					await input({
						message: "Success criterion (leave empty to finish):",
					}),
				);

				if (!criterion) break;

				successCriteria.push(criterion);

				addMoreCriteria = await confirm({
					message: "Add another criterion?",
					default: true,
				});
			}

			// Step 4: Edge Cases
			console.log(chalk.yellow("\n⚠️  Step 4: Edge Cases & Error Conditions\n"));
			console.log(
				chalk.dim(
					"Think about what could go wrong, boundaries, and unusual conditions.\n",
				),
			);

			const edgeCases: string[] = [];
			let addMoreEdgeCases = true;

			while (addMoreEdgeCases) {
				const edgeCase = sanitizeForComment(
					await input({
						message: "Edge case or error condition (leave empty to finish):",
					}),
				);

				if (!edgeCase) break;

				edgeCases.push(edgeCase);

				addMoreEdgeCases = await confirm({
					message: "Add another edge case?",
					default: true,
				});
			}

			// Step 5: Generate feature file
			console.log(chalk.yellow("\n📝 Step 5: Generating Feature File\n"));

			const featureName = name
				.split("_")
				.map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
				.join(" ");

			// Build alternatives section
			const alternativesText = alternatives
				.map(
					(alt) =>
						`  #   - ${alt.name}: ${alt.description} - ${alt.decision} (${alt.reason})`,
				)
				.join("\n");

			const successCriteriaText = successCriteria
				.map((c) => `  #   - ${c}`)
				.join("\n");

			const edgeCasesText = edgeCases.map((e) => `  #   - ${e}`).join("\n");

			const featureContent = `Feature: ${featureName}
  # User Need: ${userNeed}
  # Who: ${who}
  # Why: ${why}
  # 
  # Alternatives Considered:
${alternativesText}
  #
  # Success Criteria:
${successCriteriaText}
  #
  # Edge Cases to Cover:
${edgeCasesText}

  Background:
    Given [common preconditions that apply to all scenarios]

  Scenario: [Happy path - describe the main success scenario]
    Given [initial state]
    When [user action]
    Then [expected outcome]

  Scenario: [Error handling - what if it goes wrong?]
    Given [setup for error condition]
    When [action that triggers error]
    Then [appropriate error response]

  # Add more scenarios based on edge cases identified above
  # For each edge case, create a specific scenario that tests it
`;

			// Save feature file
			const rootDir = process.cwd();
			const specsDir = path.join(rootDir, "specs", domain);
			const filePath = path.join(specsDir, `${name}.feature`);

			await fs.mkdir(specsDir, { recursive: true });
			await fs.writeFile(filePath, featureContent);

			console.log(chalk.green(`\n✓ Created feature file: ${filePath}`));

			// Offer to create test stub
			const createTest = await confirm({
				message: "Create test stub?",
				default: true,
			});

			if (createTest) {
				const testDir = path.join(rootDir, "tests", "e2e", domain);
				const testFilePath = path.join(testDir, `${name}.e2e.test.ts`);
				const testContent = `import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { expect } from "vitest";

const feature = await loadFeature("specs/${domain}/${name}.feature");

describeFeature(feature, ({ Scenario }) => {
	// Implement scenarios based on the feature file
	// Replace these placeholders with actual step implementations
	
	Scenario("Happy path - describe the main success scenario", ({ Given, When, Then }) => {
		Given(/(.+)/, (state: string) => {
			// Set up initial state
		});

		When(/(.+)/, (action: string) => {
			// Perform the action
		});

		Then(/(.+)/, (outcome: string) => {
			// Verify the outcome
			expect(true).toBe(true);
		});
	});

	Scenario("Error handling - what if it goes wrong?", ({ Given, When, Then }) => {
		Given(/(.+)/, (state: string) => {
			// Set up error condition
		});

		When(/(.+)/, (action: string) => {
			// Trigger the error
		});

		Then(/(.+)/, (response: string) => {
			// Verify error handling
			expect(true).toBe(true);
		});
	});
});
`;

				await fs.mkdir(testDir, { recursive: true });
				await fs.writeFile(testFilePath, testContent);
				console.log(chalk.green(`✓ Created test stub: ${testFilePath}`));
			}

			// Summary
			console.log(chalk.blue.bold("\n📊 Discovery Summary:\n"));
			console.log(chalk.white(`User Need: ${userNeed}`));
			console.log(chalk.white(`Actors: ${who}`));
			console.log(
				chalk.white(`Alternatives Considered: ${alternatives.length}`),
			);
			console.log(chalk.white(`Success Criteria: ${successCriteria.length}`));
			console.log(chalk.white(`Edge Cases Identified: ${edgeCases.length}`));

			console.log(chalk.yellow("\n📝 Next Steps:\n"));
			console.log(
				chalk.dim(
					"1. Review and refine the generated feature file with specific scenarios",
				),
			);
			console.log(
				chalk.dim("2. Add concrete Given/When/Then steps based on edge cases"),
			);
			console.log(chalk.dim("3. Implement test step definitions"));
			console.log(chalk.dim("4. Run tests (they should fail initially)"));
			console.log(chalk.dim("5. Implement the feature to make tests pass"));
			console.log(
				chalk.dim(
					"\nSee examples/feature-features/ for examples of complete feature files.",
				),
			);
		} catch (error) {
			if (
				error instanceof Error &&
				error.message === "User force closed the prompt"
			) {
				console.log(chalk.yellow("\n\nDiscovery cancelled."));
				process.exit(0);
			}
			console.error(chalk.red("Error during discovery:"), error);
			process.exit(1);
		}
	});


import fs from "node:fs/promises";
import path from "node:path";
import chalk from "chalk";
import { Command } from "commander";

export const newCommand = new Command("new").description("Scaffold new specs");

newCommand
	.command("journey")
	.argument("<slug>", "Journey slug (e.g. new_user_onboarding)")
	.description("Create a new user journey")
	.action(async (slug) => {
		const rootDir = process.cwd();
		const journeysDir = path.join(rootDir, "product/journeys");
		const filePath = path.join(journeysDir, `${slug}.md`);

		const journeyName = slug
			.split("_")
			.map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
			.join(" ");

		const content = `# Journey: ${journeyName}

**Actor:** User  
**Goal:** TODO: Describe the user's goal

## Steps

1. TODO: First step → \`specs/domain/action.feature\`

## Success

TODO: Define success criteria
`;

		try {
			await fs.mkdir(journeysDir, { recursive: true });
			await fs.writeFile(filePath, content);
			console.log(chalk.green(`Created journey: ${filePath}`));
			console.log(chalk.dim("Next: Run `udd sync` to generate scenarios"));
		} catch (error) {
			console.error(chalk.red("Error creating journey:"), error);
			process.exit(1);
		}
	});

newCommand
	.command("scenario")
	.argument("<domain>", "Domain (e.g. auth)")
	.argument("<action>", "Action slug (e.g. login)")
	.description("Create a new scenario and test stub")
	.action(async (domain, action) => {
		const rootDir = process.cwd();
		const specsDir = path.join(rootDir, "specs", domain);
		const filePath = path.join(specsDir, `${action}.feature`);

		const scenarioName = action
			.split("_")
			.map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
			.join(" ");

		const content = `Feature: ${domain}

  Scenario: ${scenarioName}
    Given I am a User
    When I ${action.replace(/_/g, " ")}
    Then the action is completed successfully
`;

		const testDir = path.join(rootDir, "tests", domain);
		const testFilePath = path.join(testDir, `${action}.e2e.test.ts`);
		const testContent = `import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { expect } from "vitest";

const feature = await loadFeature("specs/${domain}/${action}.feature");

describeFeature(feature, ({ Scenario }) => {
	Scenario("${scenarioName}", ({ Given, When, Then }) => {
		Given(/I am a (.+)/, (actor: string) => {
			// TODO: Implement - set up actor context
		});

		When(/I (.+)/, (action: string) => {
			// TODO: Implement - perform action
		});

		Then("the action is completed successfully", () => {
			// TODO: Implement - verify outcome
			expect(true).toBe(true);
		});
	});
});
`;

		try {
			// Create scenario
			await fs.mkdir(specsDir, { recursive: true });
			await fs.writeFile(filePath, content);
			console.log(chalk.green(`Created scenario: ${filePath}`));

			// Create test
			await fs.mkdir(testDir, { recursive: true });
			await fs.writeFile(testFilePath, testContent);
			console.log(chalk.green(`Created test: ${testFilePath}`));
		} catch (error) {
			console.error(chalk.red("Error creating scenario:"), error);
			process.exit(1);
		}
	});

newCommand
	.command("feature")
	.argument("<domain>", "Domain (e.g. auth, user, reporting)")
	.argument(
		"<feature-name>",
		"Feature name slug (e.g. export_csv, password_reset)",
	)
	.description(
		"Create feature file from SysML template (use 'scenario' for simple features, 'discover' for guided creation)",
	)
	.action(async (domain, featureName) => {
		const rootDir = process.cwd();
		const templatePath = path.join(
			rootDir,
			"templates",
			"feature-template.feature",
		);

		// Create feature directory structure: specs/features/<domain>/<feature-name>/
		const featureDir = path.join(
			rootDir,
			"specs",
			"features",
			domain,
			featureName,
		);
		const featureFilePath = path.join(featureDir, `${featureName}.feature`);

		// Convert feature name to title case for display
		const featureTitle = featureName
			.split("_")
			.map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
			.join(" ");

		try {
			// Read template
			const templateContent = await fs.readFile(templatePath, "utf-8");

			// Replace [Feature Name] placeholder with actual feature name
			const content = templateContent.replace(
				/\[Feature Name\]/g,
				featureTitle,
			);

			// Create feature directory and file
			await fs.mkdir(featureDir, { recursive: true });
			await fs.writeFile(featureFilePath, content);

			console.log(chalk.green(`✓ Created feature: ${featureFilePath}`));
			console.log(chalk.dim("\nNext steps:"));
			console.log(
				chalk.dim("  1. Edit the feature file to fill in context sections"),
			);
			console.log(chalk.dim("  2. Replace placeholders with actual scenarios"));
			console.log(
				chalk.dim("  3. See examples/feature-features/ for reference examples"),
			);
			console.log(
				chalk.dim("  4. Run 'udd lint' to validate the feature file"),
			);
			console.log(
				chalk.dim(
					"\nNote: This creates a rich template with SysML context sections.",
				),
			);
			console.log(
				chalk.dim(
					"      For simpler features, use 'udd new scenario' instead.",
				),
			);
			console.log(
				chalk.dim(
					"      For guided creation, use 'udd discover feature' instead.",
				),
			);
		} catch (error) {
			if (
				(error as NodeJS.ErrnoException).code === "ENOENT" &&
				(error as NodeJS.ErrnoException).path?.includes("template")
			) {
				console.error(
					chalk.red(
						"Error: Template file not found at templates/feature-template.feature",
					),
				);
				console.error(
					chalk.dim(
						"Make sure you're running this command from the project root",
					),
				);
			} else {
				console.error(chalk.red("Error creating feature:"), error);
			}
			process.exit(1);
		}
	});


import fs from "node:fs/promises";
import path from "node:path";
import chalk from "chalk";
import { Command } from "commander";
import { glob } from "glob";

export const validateCommand = new Command("validate")
	.description("Check feature scenario completeness")
	.option(
		"-f, --feature <path>",
		"Validate specific feature file (default: all in specs/)",
	)
	.option("--strict", "Require all completeness checks to pass", false)
	.action(async (options) => {
		const rootDir = process.cwd();
		let featureFiles: string[] = [];

		if (options.feature) {
			featureFiles = [path.resolve(rootDir, options.feature)];
		} else {
			// Find all feature files
			const specsDir = path.join(rootDir, "specs");
			const pattern = path.join(specsDir, "**/*.feature");
			featureFiles = await glob(pattern);
		}

		if (featureFiles.length === 0) {
			console.log(chalk.yellow("No feature files found to validate."));
			process.exit(0);
		}

		console.log(
			chalk.blue.bold(
				`\n🔍 Validating Feature Completeness (${featureFiles.length} files)\n`,
			),
		);

		const results: Array<{
			file: string;
			issues: string[];
			warnings: string[];
			score: number;
		}> = [];

		for (const file of featureFiles) {
			const content = await fs.readFile(file, "utf-8");
			const relativePath = path.relative(rootDir, file);
			const analysis = analyzeFeatureCompleteness(content);

			results.push({
				file: relativePath,
				issues: analysis.issues,
				warnings: analysis.warnings,
				score: analysis.score,
			});
		}

		// Report results
		let hasIssues = false;
		let totalScore = 0;

		for (const result of results) {
			const scoreColor =
				result.score >= 80
					? chalk.green
					: result.score >= 60
						? chalk.yellow
						: chalk.red;

			console.log(
				`${scoreColor(`[${result.score}%]`)} ${chalk.white(result.file)}`,
			);

			if (result.issues.length > 0) {
				hasIssues = true;
				for (const issue of result.issues) {
					console.log(`  ${chalk.red("✗")} ${issue}`);
				}
			}

			if (result.warnings.length > 0) {
				for (const warning of result.warnings) {
					console.log(`  ${chalk.yellow("!")} ${warning}`);
				}
			}

			if (result.issues.length === 0 && result.warnings.length === 0) {
				console.log(`  ${chalk.green("✓")} Complete`);
			}

			console.log();
			totalScore += result.score;
		}

		// Summary
		const avgScore = Math.round(totalScore / results.length);
		const summaryColor =
			avgScore >= 80 ? chalk.green : avgScore >= 60 ? chalk.yellow : chalk.red;

		console.log(chalk.blue.bold("📊 Summary\n"));
		console.log(`Files analyzed: ${results.length}`);
		console.log(`Average completeness: ${summaryColor(`${avgScore}%`)}`);

		// Recommendations
		if (avgScore < 80) {
			console.log(chalk.yellow("\n💡 Recommendations:\n"));
			console.log(
				chalk.dim(
					"  • Add comments documenting user needs and alternatives considered",
				),
			);
			console.log(
				chalk.dim("  • Include error handling and edge case scenarios"),
			);
			console.log(
				chalk.dim("  • Use Background for common setup across scenarios"),
			);
			console.log(
				chalk.dim(
					"  • See examples/feature-features/ for examples of complete features",
				),
			);
			console.log(
				chalk.dim("  • Use 'udd discover feature' for guided feature creation"),
			);
		}

		if (options.strict && hasIssues) {
			console.log(chalk.red("\n✗ Validation failed (strict mode)"));
			process.exit(1);
		}

		if (!hasIssues) {
			console.log(chalk.green("\n✓ All validations passed"));
		}
	});

interface FeatureAnalysis {
	issues: string[];
	warnings: string[];
	score: number;
}

function analyzeFeatureCompleteness(content: string): FeatureAnalysis {
	const issues: string[] = [];
	const warnings: string[] = [];
	let score = 100;

	const _lines = content.split("\n");

	// Check for Feature declaration
	if (!content.match(/^Feature:/m)) {
		issues.push("Missing Feature declaration");
		score -= 20;
	}

	// Check for at least one Scenario
	const scenarioCount = (content.match(/^\s*Scenario:/gm) || []).length;
	if (scenarioCount === 0) {
		issues.push("No scenarios defined");
		score -= 30;
	} else if (scenarioCount === 1) {
		warnings.push(
			"Only one scenario - consider adding error cases and edge cases",
		);
		score -= 10;
	}

	// Check for SysML-style context comments
	const hasUserNeed = content.includes("# User Need:");
	const hasAlternatives = content.includes("# Alternatives Considered:");
	const hasSuccessCriteria = content.includes("# Success Criteria:");

	if (!hasUserNeed) {
		warnings.push("Missing user need context (# User Need:)");
		score -= 10;
	}

	if (!hasAlternatives) {
		warnings.push("Missing alternatives analysis (# Alternatives Considered:)");
		score -= 10;
	}

	if (!hasSuccessCriteria) {
		warnings.push("Missing success criteria (# Success Criteria:)");
		score -= 10;
	}

	// Check for Given/When/Then structure
	const hasGiven = content.includes("Given");
	const hasWhen = content.includes("When");
	const hasThen = content.includes("Then");

	if (!hasGiven || !hasWhen || !hasThen) {
		issues.push("Incomplete Given/When/Then structure");
		score -= 15;
	}

	// Check for error handling scenarios
	const hasErrorScenario =
		/Scenario:.*\b(error|fail|failure|invalid|wrong|incorrect|missing)\b/i.test(
			content,
		);

	if (scenarioCount > 1 && !hasErrorScenario) {
		warnings.push(
			"No error handling scenarios found - consider adding failure cases",
		);
		score -= 5;
	}

	// Check for edge cases
	const hasEdgeCaseComment = content.includes("# Edge Cases");
	const hasEdgeCaseScenario =
		/Scenario:.*\b(edge|boundary|empty|large|limit|maximum|minimum|zero)\b/i.test(
			content,
		);

	if (!hasEdgeCaseComment && !hasEdgeCaseScenario && scenarioCount > 1) {
		warnings.push(
			"No edge cases mentioned - consider boundary conditions and unusual inputs",
		);
		score -= 5;
	}

	// Check for Background (if multiple scenarios)
	if (scenarioCount > 2 && !content.includes("Background:")) {
		warnings.push(
			"Consider using Background for common setup across scenarios",
		);
		score -= 5;
	}

	// Check for template boilerplate (only in feature declaration and Given/When/Then steps)
	const hasTemplatePlaceholders =
		/^Feature:.*\[.*\]/m.test(content) ||
		/^\s*(Given|When|Then|And)\s+\[.*\]/m.test(content);

	if (hasTemplatePlaceholders) {
		warnings.push("Contains template placeholders - needs customization");
		score -= 10;
	}

	// Ensure score doesn't go below 0
	score = Math.max(0, score);

	return { issues, warnings, score };
}


# SysML-Informed Feature Template
# 
# This template helps you create comprehensive feature scenarios using SysML principles.
# Remove this header when creating your actual feature file.

Feature: [Feature Name]
  # User Need: [Who needs this and why?]
  # Who: [Specific user types/roles]
  # Why: [Business value or user problem being solved]
  # 
  # Alternatives Considered:
  #   - [Alternative 1]: [Brief description] - [Decision: Rejected/Deferred/Chosen] ([Reason])
  #   - [Alternative 2]: [Brief description] - [Decision: Rejected/Deferred/Chosen] ([Reason])
  #   - [Chosen Approach]: [Brief description] - CHOSEN ([Why this is best])
  #
  # Success Criteria:
  #   - [Measurable criteria 1]
  #   - [Measurable criteria 2]
  #   - [Measurable criteria 3]
  #
  # Edge Cases to Cover:
  #   - [Edge case 1]
  #   - [Edge case 2]
  #   - [Error condition]

  Background:
    Given [common preconditions that apply to all scenarios]
    And [additional setup if needed]

  Scenario: [Happy path - most common successful case]
    Given [initial state]
    And [additional context]
    When [user action]
    Then [expected outcome]
    And [additional verification]

  Scenario: [Alternative success path]
    Given [different initial state]
    When [user action]
    Then [expected outcome]

  Scenario: [Error handling - what if it goes wrong?]
    Given [setup for error condition]
    When [action that triggers error]
    Then [appropriate error response]
    And [system remains stable]

  Scenario: [Edge case - boundary condition]
    Given [edge case setup]
    When [action at boundary]
    Then [expected behavior at edge]

  Scenario: [Performance/scale consideration]
    Given [large dataset or load condition]
    When [user action]
    Then [completes within acceptable time]
    And [displays progress if needed]

# Guidelines for Using This Template:
# 
# 1. User Need Section:
#    - Be specific about WHO needs this feature
#    - Clearly state WHY it matters (business value)
#    - Include context about the user's workflow
#
# 2. Alternatives Considered:
#    - List ALL alternatives you considered
#    - Document why each was rejected, deferred, or chosen
#    - This helps future maintainers understand decisions
#
# 3. Success Criteria:
#    - Use measurable, testable criteria
#    - Include performance targets if relevant
#    - Think about what "done" looks like
#
# 4. Scenarios:
#    - Start with the happy path
#    - Cover error cases (what could go wrong?)
#    - Include edge cases (boundaries, limits, unusual conditions)
#    - Consider performance with large datasets
#    - Think about concurrent users if relevant
#
# 5. Keep It Focused:
#    - One feature per file
#    - Split large features into smaller ones
#    - Use Background for common setup
#
# 6. Examples of Complete Features:
#    - See examples/feature-features/ for real-world examples


import { describe } from "vitest";
import { z } from "zod";

export const schema = z.string();
export const suite = describe("suite", () => {});


## USER (12:55:38 PM)

import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { expect } from "vitest";
import { runUdd } from "../../../../utils.js";

const feature = await loadFeature(
	"specs/features/udd/cli/validation/validate_completeness.feature",
);

describeFeature(feature, ({ Scenario }) => {
	Scenario(
		"Validate all feature files in project",
		({ Given, When, Then, And }) => {
			let commandOutput: { stdout: string; stderr: string };
			let commandError:
				| { code: number; stdout: string; stderr: string }
				| undefined;

			Given("I have feature files in the specs directory", () => {
				// Already true in this project
			});

			When('I run "udd validate"', async () => {
				try {
					commandOutput = await runUdd("validate");
				} catch (error) {
					commandError = error as {
						code: number;
						stdout: string;
						stderr: string;
					};
				}
			});

			Then("the command should succeed", () => {
				if (commandError) {
					console.error(commandError.stdout);
					console.error(commandError.stderr);
					throw new Error(`Command failed with code ${commandError.code}`);
				}
			});

			And("the output should show completeness scores for each feature", () => {
				expect(commandOutput.stdout).toMatch(/\[\d+%\]/);
			});

			And("the output should show an average completeness score", () => {
				expect(commandOutput.stdout).toContain("Average completeness:");
			});
		},
	);

	Scenario("Validate specific feature file", ({ Given, When, Then, And }) => {
		let commandOutput: { stdout: string; stderr: string };
		let commandError:
			| { code: number; stdout: string; stderr: string }
			| undefined;

		Given(
			'I have a feature file "examples/feature-features/export_data.feature"',
			() => {
				// Already exists in the project
			},
		);

		When(
			'I run "udd validate -f examples/feature-features/export_data.feature"',
			async () => {
				try {
					commandOutput = await runUdd(
						"validate -f examples/feature-features/export_data.feature",
					);
				} catch (error) {
					commandError = error as {
						code: number;
						stdout: string;
						stderr: string;
					};
				}
			},
		);

		Then("the command should succeed", () => {
			if (commandError) {
				console.error(commandError.stdout);
				console.error(commandError.stderr);
				throw new Error(`Command failed with code ${commandError.code}`);
			}
		});

		And(
			"the output should show the completeness score for that feature",
			() => {
				expect(commandOutput.stdout).toContain(
					"examples/feature-features/export_data.feature",
				);
				expect(commandOutput.stdout).toMatch(/\[\d+%\]/);
			},
		);
	});

	Scenario(
		"Validate reports missing SysML context",
		({ Given, When, Then, And }) => {
			let commandOutput: { stdout: string; stderr: string };
			let _commandError:
				| { code: number; stdout: string; stderr: string }
				| undefined;

			Given("I have a feature file without SysML comments", () => {
				// specs/features/udd/cli/check_status.feature exists and doesn't have SysML comments
			});

			When(
				'I run "udd validate -f specs/features/udd/cli/check_status.feature"',
				async () => {
					try {
						commandOutput = await runUdd(
							"validate -f specs/features/udd/cli/check_status.feature",
						);
					} catch (error) {
						_commandError = error as {
							code: number;
							stdout: string;
							stderr: string;
						};
					}
				},
			);

			Then("the output should warn about missing user need context", () => {
				expect(commandOutput.stdout).toContain("Missing user need context");
			});

			And("the output should warn about missing alternatives analysis", () => {
				expect(commandOutput.stdout).toContain("Missing alternatives analysis");
			});

			And("the output should warn about missing success criteria", () => {
				expect(commandOutput.stdout).toContain("Missing success criteria");
			});
		},
	);

	Scenario(
		"Validate scores complete features at 100%",
		({ Given, When, Then, And }) => {
			let commandOutput: { stdout: string; stderr: string };
			let _commandError:
				| { code: number; stdout: string; stderr: string }
				| undefined;

			Given(
				'I have a complete feature file "examples/feature-features/export_data.feature"',
				() => {
					// Already exists and is complete
				},
			);

			When(
				'I run "udd validate -f examples/feature-features/export_data.feature"',
				async () => {
					try {
						commandOutput = await runUdd(
							"validate -f examples/feature-features/export_data.feature",
						);
					} catch (error) {
						_commandError = error as {
							code: number;
							stdout: string;
							stderr: string;
						};
					}
				},
			);

			Then("the completeness score should be 100%", () => {
				expect(commandOutput.stdout).toContain("[100%]");
			});

			And('the output should show "Complete"', () => {
				expect(commandOutput.stdout).toContain("Complete");
			});
		},
	);
});


