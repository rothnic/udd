# SysML-Informed Requirements Discovery

This guide shows how to use SysML principles to create better feature scenarios without adding complexity.

## The UDD Philosophy

**Keep it simple**: User needs → Feature files → BDD specs → Tests → Code

SysML doesn't add layers - it helps us think through requirements more thoroughly.

## What SysML Teaches Us

### 1. SysML Is Not "White Box"

**Common misconception**: SysML is just about implementation details.

**Reality**: SysML helps with requirements analysis at multiple levels:
- **User needs analysis** - Understanding what users actually need
- **Functional requirements** - What the system must do (not how to build it)
- **Alternatives evaluation** - Comparing different approaches before committing

### 2. Focus on User Needs First

Before writing features, understand:
- **Who** are the users/actors?
- **What** are they trying to achieve?
- **Why** does it matter?
- **What** are the acceptance criteria?

### 3. Evaluate Alternatives

Don't jump to the first solution. Consider:
- Different ways to achieve the user need
- Trade-offs of each approach
- Which best serves the user

## How This Improves Feature Scenarios

Instead of creating parallel SysML artifacts, use SysML thinking to create **richer feature files**:

### Before (Incomplete)
```gherkin
Feature: User can export data
  Scenario: Export to CSV
    When user clicks export
    Then CSV file is downloaded
```

### After (SysML-Informed)
```gherkin
Feature: User can export data
  # User Need: Data analysts need to analyze project data in Excel
  # Alternative Considered: Direct Excel integration (rejected: too complex)
  # Alternative Considered: API access (deferred: phase 2)
  # Chosen Approach: CSV export (simple, universal, meets immediate need)
  
  Scenario: Export current view to CSV
    Given user is viewing the projects list
    And the list contains 10 projects
    When user clicks "Export to CSV"
    Then a file "projects_2024-01-04.csv" is downloaded
    And the file contains all 10 projects
    And the file includes columns: name, status, owner, created_date
  
  Scenario: Export handles large datasets
    Given user is viewing a list with 1000+ items
    When user clicks "Export to CSV"
    Then export begins with progress indicator
    And file is generated within 30 seconds
    And user receives success notification
```

## Agent-Assisted Requirements Discovery

Let agents help with SysML-style analysis:

```bash
# Ask agent to analyze user needs
"I need to add an export feature. Help me understand:
 - Who needs this and why?
 - What are the alternatives?
 - What should the feature scenarios include?"
```

The agent can:
1. Ask clarifying questions about user needs
2. Suggest alternatives with trade-offs
3. Identify edge cases and error scenarios
4. Propose comprehensive feature scenarios

## Practical Workflow

### 1. Start with User Need
Document in `product/journeys/`:
```markdown
# Journey: Data Analysis

**Actor:** Data Analyst
**Goal:** Export project data for analysis in Excel
**Why:** Need to create custom reports and pivot tables
**Success:** Can export and analyze data within 5 minutes
```

### 2. Use SysML Thinking (With Agent Help)
- **Clarify requirements**: What data? What format? How often?
- **Evaluate alternatives**: CSV vs Excel vs API vs direct integration
- **Consider constraints**: Performance, security, usability
- **Identify scenarios**: Happy path, errors, edge cases

### 3. Create Rich Feature File
Add all insights directly to the feature file as comments and scenarios.

### 4. Generate BDD Specs
Use `udd sync` to create initial specs, then enhance with discovered scenarios.

## What NOT to Do

❌ Don't create separate SysML diagrams as artifacts to maintain
❌ Don't add "functional workflow" layers between journeys and features
❌ Don't create multiple versions of the same information
❌ Don't use SysML just to check a box

## What TO Do

✅ Use SysML thinking to ask better questions about user needs
✅ Document alternatives considered as comments in feature files
✅ Let agents help with requirements analysis
✅ Create comprehensive scenarios that cover edge cases
✅ Keep feature files as the single source of truth

## Example: Applying SysML Analysis

### Step 1: User Need
"Users need to reset their password if they forget it"

### Step 2: SysML-Style Questions
- What triggers the need? (Forgot password? Security breach? Expired?)
- Who are the actors? (User, email system, support team?)
- What are the alternatives?
  - Email reset link (chosen: secure, standard)
  - SMS code (deferred: requires phone verification)
  - Security questions (rejected: less secure)
- What could go wrong?
  - Email doesn't arrive
  - Reset link expires
  - User tries multiple times

### Step 3: Rich Feature File
```gherkin
Feature: Password Reset
  # User Need: Users need to regain access when they forget their password
  # Alternative Evaluated: SMS verification (requires phone collection - deferred)
  # Alternative Evaluated: Security questions (less secure - rejected)
  # Chosen: Email with time-limited reset link (standard, secure)
  
  Background:
    Given a registered user with email "user@example.com"
    
  Scenario: User requests password reset
    When user clicks "Forgot Password"
    And enters email "user@example.com"
    Then user sees "Check your email for reset instructions"
    And an email is sent to "user@example.com"
    And the email contains a reset link valid for 1 hour
    
  Scenario: User completes password reset
    Given user has received a valid reset link
    When user clicks the reset link
    And enters new password "SecurePass123!"
    And confirms password "SecurePass123!"
    Then password is updated
    And user is logged in
    And user sees "Password reset successful"
    
  Scenario: Reset link expires
    Given user has received a reset link
    And 2 hours have passed
    When user clicks the reset link
    Then user sees "This reset link has expired"
    And user is prompted to request a new link
    
  Scenario: User requests multiple resets
    When user requests reset for "user@example.com"
    And user requests reset again for "user@example.com"
    Then previous reset links are invalidated
    And only the newest link works
```

## Benefits of This Approach

✅ **Simpler**: No extra artifact layers
✅ **Clearer**: All context in feature files where it's needed
✅ **Practical**: Agents can help with analysis
✅ **Maintainable**: One source of truth
✅ **Complete**: Better scenarios through structured thinking

## Summary

**SysML's value**: Structured thinking about requirements
**UDD's approach**: Apply that thinking directly to feature creation
**Result**: Richer, more complete feature scenarios without extra complexity

Use SysML principles to **think better**, not to **create more artifacts**.
