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
