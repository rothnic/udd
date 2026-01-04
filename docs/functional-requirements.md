# Functional Requirements in UDD

This guide explains how UDD supports **grey-box functional analysis** to bridge user journeys and system-level functional requirements.

## Three Levels of Abstraction

UDD recognizes three levels for describing systems, aligned with SysML and systems engineering best practices:

### 1. Black Box (External View)

**What it is:** The system's observable behavior from a user's perspective.

**Focuses on:**
- What the system does
- User interactions
- System inputs and outputs
- Observable results

**Example:**
```gherkin
Feature: User Authentication
  Scenario: Successful login
    Given a registered user
    When they provide valid credentials
    Then they should be logged in
```

**In UDD:** BDD scenarios are black-box specifications.

### 2. Grey Box (Functional View) ⭐

**What it is:** Functional workflows showing how functional components collaborate **without specifying implementation**.

**Focuses on:**
- Functional decomposition
- Component interactions
- Data flows between functions
- System-level functional requirements

**Does NOT specify:**
- Technology choices
- Code architecture
- Database schemas
- API implementations

**Example:**
```yaml
id: user_authentication
functional_workflow:
  - step: Capture credentials
    functions: [input_validation, credential_capture]
  - step: Validate credentials
    functions: [credential_validation, user_directory_lookup]
    interactions:
      - credential_validation queries user_directory_lookup
  - step: Create session
    functions: [session_creation, token_generation]
    interactions:
      - session_creation uses token_generation
```

**In UDD:** Use cases with `functional_workflow` field are grey-box specifications.

### 3. White Box (Implementation View)

**What it is:** The actual implementation details and architecture.

**Focuses on:**
- Technology stack
- Code structure
- Database design
- API specifications
- Deployment architecture

**Example:**
```typescript
// Implementation (white box)
class AuthenticationService {
  async authenticate(credentials: Credentials): Promise<Session> {
    const user = await this.userRepo.findByEmail(credentials.email);
    const valid = await bcrypt.compare(credentials.password, user.passwordHash);
    if (!valid) throw new InvalidCredentialsError();
    return this.sessionManager.create(user.id);
  }
}
```

**In UDD:** Source code in `src/` is white-box implementation.

## Why Grey Box Matters

### The Problem

Without grey-box analysis, there's a gap between user needs and implementation:

```
❌ Too Big a Jump:
User Journey → BDD Scenario → Code
   (intent)      (behavior)     (implementation)
```

### The Solution

Grey-box functional analysis fills the gap:

```
✅ Complete Traceability:
User Journey → Use Case (grey-box) → BDD Scenario → Code
   (intent)    (functional req)      (behavior)     (impl)
```

### Benefits

1. **System-level understanding** - See how functional components work together
2. **Implementation-agnostic** - Specify WHAT without HOW
3. **Better design** - Identify functional boundaries before coding
4. **Clearer requirements** - Bridge between user needs and behavior specs
5. **SysML-aligned** - Follow proven systems engineering practices

## When to Use Grey Box

### Use Grey Box When:

✅ The system involves multiple functional components working together
✅ You need to understand functional workflows before implementation
✅ The use case is complex enough to benefit from decomposition
✅ You want to validate functional design before writing code
✅ Multiple scenarios share the same functional workflow

### Skip Grey Box When:

❌ The use case is simple and straightforward
❌ It maps directly to a single behavior
❌ Over-specification would add no value
❌ The implementation is obvious

## How to Write Grey-Box Use Cases

### Schema

```yaml
id: string                         # Use case identifier
name: string                       # Human-readable name
summary: string                    # Brief description
actors: string[]                   # External actors (users, systems)
functional_workflow:               # Optional grey-box analysis
  - step: string                   # Workflow step name
    description: string            # What happens in this step
    functions: string[]            # Functional components involved
    interactions: string[]         # How functions collaborate (optional)
outcomes:                          # Links to BDD scenarios
  - description: string
    scenarios: string[]
```

### Example: Simple (Black Box Only)

```yaml
id: user_logout
name: User Logout
summary: Allow users to log out of the system
actors: [user]
outcomes:
  - description: User logs out successfully
    scenarios: [auth/logout_success]
```

### Example: Complex (With Grey Box)

```yaml
id: password_reset
name: Password Reset
summary: Allow users to reset forgotten passwords securely
actors: [user, email_system]
functional_workflow:
  - step: Request password reset
    description: User initiates reset process with email
    functions: [request_validator, user_lookup, token_generator]
    interactions:
      - request_validator checks user_lookup for email existence
      - token_generator creates secure reset token
  - step: Send reset email
    description: System sends email with reset link
    functions: [email_composer, email_sender, token_storage]
    interactions:
      - email_composer creates message with token
      - email_sender delivers via email_system
      - token_storage persists token with expiration
  - step: Validate reset token
    description: User clicks link and token is validated
    functions: [token_validator, token_storage]
    interactions:
      - token_validator checks token_storage for validity
  - step: Update password
    description: User provides new password and it's saved
    functions: [password_validator, password_hasher, user_updater]
    interactions:
      - password_validator checks strength requirements
      - password_hasher creates secure hash
      - user_updater saves to user record
outcomes:
  - description: User receives reset email
    scenarios: [auth/password_reset_email_sent]
  - description: User resets password successfully
    scenarios: [auth/password_reset_success]
  - description: Expired token is rejected
    scenarios: [auth/password_reset_expired_token]
```

## Guidelines

### Do's ✅

1. **Name functional components clearly** - Use domain language
2. **Describe interactions** - Show how functions work together
3. **Focus on WHAT, not HOW** - Don't specify technology
4. **Align with user journeys** - Ensure workflows serve user needs
5. **Keep it implementation-agnostic** - Multiple architectures should satisfy it

### Don'ts ❌

1. **Don't specify technology** - No "React", "PostgreSQL", "REST API"
2. **Don't dictate architecture** - No class hierarchies, database schemas
3. **Don't include implementation details** - No algorithms, data structures
4. **Don't be too fine-grained** - Focus on system-level functions
5. **Don't duplicate scenarios** - Workflows complement, don't replace scenarios

## Validation

When reviewing grey-box use cases, ask:

1. **Implementation-agnostic?** - Could this be implemented in different ways?
2. **Functional focus?** - Does it describe functional behavior, not implementation?
3. **Adds value?** - Does it clarify something not obvious from scenarios?
4. **Clear interactions?** - Are component relationships understandable?
5. **Aligns with journeys?** - Does it support the user's goals?

## Integration with UDD Workflow

```bash
# 1. Define user journey
product/journeys/password_reset.md

# 2. Create use case with functional workflow
specs/use-cases/password_reset.yml
  └── functional_workflow (grey box)

# 3. Define BDD scenarios
specs/features/auth/password_reset_*.feature
  └── (black box)

# 4. Implement tests
tests/e2e/auth/password_reset_*.e2e.test.ts

# 5. Implement code
src/auth/*.ts
  └── (white box)
```

## Tools and Commands

```bash
# Query functional workflows
udd query use-case password_reset

# Validate grey-box specifications
udd lint

# Analyze functional coverage
udd analyze functional-coverage

# Suggest functional decomposition
udd suggest functional-workflow password_reset
```

## Examples from UDD Project

### Example 1: Spec Validation (Simple, Black Box)

```yaml
id: validate_specs
name: Validate Specs
summary: Ensure spec files follow defined structure
actors: [developer, agent]
# No functional_workflow - simple enough to skip
outcomes:
  - description: Valid specs pass linting
    scenarios: [udd/cli/lint_valid_specs]
  - description: Invalid specs report errors
    scenarios: [udd/cli/lint_invalid_specs]
```

### Example 2: Orchestrated Iteration (Complex, Grey Box)

```yaml
id: orchestrated_iteration
name: Orchestrated Iteration
summary: Enable continuous autonomous development
actors: [developer, orchestrator_agent, worker_agent]
functional_workflow:
  - step: Initialize iteration
    description: Orchestrator reads project state
    functions: [status_reader, goal_parser, work_planner]
    interactions:
      - status_reader gathers current state
      - goal_parser identifies objectives
      - work_planner creates execution plan
  - step: Delegate work
    description: Orchestrator assigns tasks to worker
    functions: [task_delegator, worker_coordinator, session_manager]
    interactions:
      - task_delegator creates work unit
      - worker_coordinator assigns to worker_agent
      - session_manager tracks execution state
  - step: Monitor execution
    description: Track worker progress and handle errors
    functions: [progress_monitor, error_detector, state_preserver]
    interactions:
      - progress_monitor polls worker status
      - error_detector identifies failures
      - state_preserver captures session data
  - step: Evaluate completion
    description: Determine if work is complete
    functions: [completion_checker, quality_validator, decision_maker]
    interactions:
      - completion_checker assesses progress
      - quality_validator checks acceptance criteria
      - decision_maker determines next action
outcomes:
  - description: Orchestrator delegates and monitors work
    scenarios: [opencode/orchestration/iterate_until_complete]
  - description: Orchestrator handles errors gracefully
    scenarios: [opencode/orchestration/stop_on_error]
  - description: Developer configures iteration limits
    scenarios: [opencode/orchestration/configurable_iteration]
```

## References

- **SysML**: [Systems Modeling Language Specification](https://www.omgsysml.org/)
- **SEBoK**: [Systems Engineering Body of Knowledge](https://www.sebokwiki.org/)
- **INCOSE**: [Systems Engineering Handbook](https://www.incose.org/)
- **Requirements Engineering**: [SEBoK Requirements](https://www.sebokwiki.org/wiki/Requirements_Engineering)

## Summary

Grey-box functional analysis is the **missing middle layer** that bridges user intent to implementation:

- **Black box** (scenarios) - What the system does externally
- **Grey box** (functional workflows) - How functional components collaborate
- **White box** (code) - How it's actually built

By supporting grey-box use cases, UDD aligns with SysML principles and enables true system-level functional requirements without mandating implementation details.

---

**Remember**: Grey box specifies **functional workflows**, not **implementation architecture**. Think "components collaborating" not "classes and databases."
