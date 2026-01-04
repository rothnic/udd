# Research: Requirements Model & SysML Functional Analysis

## Metadata

| Field | Value |
|-------|-------|
| Status | `active` |
| Created | 2026-01-04 |
| Timebox | Analysis phase |
| Decision | Document findings and reconcile UDD with SysML concepts |
| Related Features | All use cases, functional requirements |

## Question

How should UDD's requirements model support grey-box functional analysis (like SysML) while maintaining its spec-first, user-driven philosophy?

## Context

### The SysML Misconception

There's a common misconception that SysML is purely "white box" (implementation-focused). This is incorrect. SysML supports multiple levels of abstraction:

1. **Black Box (External View)**: What the system does from a user perspective
   - User interactions
   - System inputs/outputs
   - Observable behaviors
   
2. **Grey Box (Functional View)**: How functional components work together
   - Functional workflows
   - Component interactions
   - Data flows between functions
   - **Does NOT specify implementation architecture**
   
3. **White Box (Implementation View)**: How the system is built internally
   - Technology choices
   - Code architecture
   - Database schemas
   - API implementations

### UDD's Current Model

UDD currently focuses heavily on black-box testing through:
- User journeys (what users accomplish)
- BDD scenarios (observable behaviors)
- E2E tests (system-level validation)

However, the backlog issues (LEAN-REQUIREMENTS-ISSUES.md) suggest a need for:
- Use cases that are "black box, ~30 lines"
- External actors only (no internal components)

**This may be too restrictive.** We need grey-box functional analysis to:
- Specify functional workflows
- Identify how functional sub-components work together
- Achieve system-level functional requirements
- Bridge the gap between user needs and implementation

## Problem Statement Analysis

The original problem statement emphasizes:

> "sysml being called white box isn't always correct. sysml does desire functional analysis that is kind of grey box where we specify functional workflows to identify how functional sub components work together to achieve an outcome without specifying the exact implementation architecture."

> "our goal is to set a foundation in place to fully exercise the user needs and functional requirements at a system level"

### Key Requirements

1. **User journeys must drive functional requirements** - not just test scenarios
2. **Functional workflows must be specifiable** - without mandating implementation
3. **System-level functional analysis** - understanding component interactions
4. **Clear separation of concerns**:
   - Requirements (WHAT & functional HOW) ≠ Architecture (implementation HOW)

## Current State Assessment

### What's Working

✅ **User Journeys** - Clear articulation of user goals
✅ **BDD Scenarios** - Testable behavior specifications
✅ **Traceability** - Journey → Scenario → Test linkage
✅ **Spec-first workflow** - Specifications drive implementation

### What's Missing

❌ **Functional Requirements Layer** - No way to specify functional workflows
❌ **Component Interaction Models** - Can't describe how functions collaborate
❌ **Grey-box Use Cases** - Current model may be too black-box focused
❌ **System-level Functional Analysis** - Missing the middle layer

### Gap Analysis

```
Current UDD Model:
User Journeys → BDD Scenarios → E2E Tests → Code

Missing Layer:
User Journeys → [FUNCTIONAL REQUIREMENTS] → Use Cases → BDD Scenarios → Tests → Code
                     ↑
              Grey-box functional analysis
              (workflows, component interactions)
```

## Alternatives

### Option A: Pure Black Box (Current Direction)

**Description**: Keep use cases strictly black-box, focusing only on external behavior.

**Example**:
```yaml
id: user_authentication
actors: [user]
outcomes:
  - description: User logs in successfully
    scenarios: [auth/login_success]
```

**Pros**:
- Simple and focused
- Easier to maintain
- Clear separation from implementation

**Cons**:
- ❌ No functional workflow specification
- ❌ Can't model component interactions
- ❌ Missing system-level functional requirements
- ❌ Doesn't align with SysML functional analysis principles

### Option B: Grey Box Functional Analysis (Recommended)

**Description**: Allow use cases to specify functional workflows and component interactions without implementation details.

**Example**:
```yaml
id: user_authentication
actors: [user]
functional_workflow:
  - step: User provides credentials
    description: Capture and validate input format
    functions: [input_validation, credential_capture]
  - step: System validates credentials
    description: Check credentials against user directory
    functions: [credential_validation, user_directory_lookup]
    interactions:
      - credential_validation queries user_directory_lookup
  - step: System creates session
    description: Generate session token and establish session
    functions: [session_creation, token_generation]
    interactions:
      - session_creation uses token_generation
outcomes:
  - description: User logs in successfully
    scenarios: [auth/login_success]
  - description: Invalid credentials are rejected
    scenarios: [auth/login_failure]
```

**Pros**:
- ✅ Supports functional requirements
- ✅ Shows component interactions
- ✅ Aligns with SysML grey-box analysis
- ✅ Bridges user needs to implementation
- ✅ Enables system-level functional validation

**Cons**:
- More complex schema
- Requires discipline to avoid implementation details
- Need clear guidelines on what's functional vs. architectural

### Option C: Hybrid with Separate Functional Models

**Description**: Keep use cases black-box but add separate functional models.

**Example**:
```yaml
# use-case.yml (black box)
id: user_authentication
actors: [user]

# functional-model.yml (grey box)
id: authentication_flow
use_cases: [user_authentication]
functional_components:
  - credential_validator
  - session_manager
  - user_directory
interactions:
  - validator → user_directory
  - validator → session_manager
```

**Pros**:
- Separation of concerns
- Optional functional modeling

**Cons**:
- More files to maintain
- Potential for orphaned models
- Less integrated workflow

## Evaluation Criteria

| Criterion | Weight | Option A | Option B | Option C |
|-----------|--------|----------|----------|----------|
| Supports Functional Analysis | 5 | Low | High | Medium |
| System-level Requirements | 5 | Low | High | Medium |
| Simplicity | 3 | High | Medium | Low |
| SysML Alignment | 4 | Low | High | Medium |
| Maintainability | 3 | High | Medium | Low |
| User Journey Integration | 4 | High | High | Medium |

**Weighted Score**:
- Option A: 56/100 (too simplistic)
- **Option B: 92/100 (recommended)**
- Option C: 68/100 (over-engineered)

## Findings

### 2026-01-04: Backlog Analysis

Reviewed LEAN-REQUIREMENTS-ISSUES.md and identified:

1. **Issue #02** proposes "black box, ~30 lines" use cases
   - ⚠️ May be too restrictive for functional analysis
   - Should be updated to support grey-box workflows

2. **Issue #04** proposes "external actors only"
   - ⚠️ Need to distinguish between:
     - External actors (users, systems)
     - Internal functional components (for workflows)
   - Both are needed but serve different purposes

3. **Issue #09** proposes requirements model documentation
   - ✅ Good foundation
   - Should include grey-box functional analysis guidance

4. **Missing**: Explicit functional requirements layer
   - User journeys capture intent
   - Scenarios capture behavior
   - **Need**: Functional workflows that bridge the gap

### 2026-01-04: SysML Principles

Key insights from SysML methodology:

1. **Requirements ≠ Architecture**
   - Requirements specify WHAT (including functional workflows)
   - Architecture specifies implementation HOW

2. **Functional Analysis is Grey Box**
   - Shows functional decomposition
   - Describes component interactions
   - Does NOT mandate technology or architecture

3. **Traceability Across Levels**
   - User needs → Functional requirements → Behavior specs → Tests
   - Each level adds detail without jumping to implementation

### 2026-01-04: UDD Alignment

How UDD can align with SysML principles:

```
Level 1: User Journeys (User Needs)
  ↓ drives
Level 2: Use Cases with Functional Workflows (Functional Requirements) ← GREY BOX
  ↓ defines
Level 3: BDD Scenarios (Behavioral Specifications) ← BLACK BOX
  ↓ validated by
Level 4: E2E Tests (Verification)
  ↓ implemented by
Level 5: Code (Implementation) ← WHITE BOX
```

## Recommended Changes

### 1. Update Use Case Schema

Enhance use cases to support optional functional workflows:

```yaml
# Current schema (too minimal)
id: string
name: string
summary: string
actors: string[]
outcomes: []

# Proposed schema (supports grey-box)
id: string
name: string
summary: string
actors: string[]                    # External actors (users, systems)
functional_workflow:                # Optional grey-box analysis
  - step: string
    description: string
    functions: string[]             # Functional components involved
    interactions: string[]          # How they collaborate
outcomes: []
```

### 2. Update Documentation

- **VISION.md**: Add functional requirements as explicit goal
- **Use Case Guidelines**: Distinguish black box vs. grey box
- **Research Issues**: Update #02 and #04 to support grey-box
- **AGENTS.md**: Guide agents on when to use functional workflows

### 3. Create Functional Analysis Guide

New document: `docs/functional-requirements.md`

Topics:
- What is grey-box functional analysis
- When to use it
- How to avoid implementation details
- Examples from SysML
- Integration with UDD workflow

### 4. Update Issue #02 (Simplify Use Case Schema)

Current proposal: "black box, ~30 lines"

Updated proposal: "Support both black-box (simple) and grey-box (with functional workflows) use cases"

### 5. Update Issue #04 (Actor Model)

Current proposal: "External actors only"

Updated proposal: "Distinguish external actors from internal functional components. Both are needed for complete requirements model."

## Decision

**Selected**: Option B - Grey Box Functional Analysis

**Rationale**: 
- Aligns with SysML principles
- Supports system-level functional requirements
- Bridges user journeys to implementation
- Maintains separation between requirements and architecture
- Provides foundation for exercising user needs at functional level

**Trade-offs Accepted**:
- Slightly more complex schema
- Requires clear guidelines and discipline
- Need to educate on functional vs. architectural thinking

## Proposed Implementation

### Phase 1: Foundation (Phase 3)
1. Update use case schema to support optional `functional_workflow`
2. Create functional requirements documentation
3. Update VISION.md and core documentation
4. Revise issues #02 and #04

### Phase 2: Tooling (Phase 3)
5. Update `udd query` to expose functional workflows
6. Enhance `udd lint` to validate functional workflows
7. Update templates with examples

### Phase 3: Intelligence (Phase 4)
8. Add `udd analyze functional-coverage`
9. Add `udd suggest functional-workflows`
10. Create AI-assisted functional decomposition

## Learnings

Key insights to preserve:

1. **Grey-box is not white-box**: Functional workflows specify component interactions without implementation details
2. **SysML uses grey-box analysis**: This is a proven systems engineering practice
3. **Three levels of abstraction**: Black (external), Grey (functional), White (implementation)
4. **Requirements include functional workflows**: Not just external behavior
5. **User journeys should drive functional requirements**: Complete traceability chain

## Follow-up Actions

- [ ] Update VISION.md with functional requirements focus
- [ ] Create `docs/functional-requirements.md`
- [ ] Update use case schema in `src/types.ts`
- [ ] Revise LEAN-REQUIREMENTS-ISSUES.md
- [ ] Update issues #02 and #04
- [ ] Update AGENTS.md with functional analysis guidance
- [ ] Create examples of grey-box use cases
- [ ] Update templates to support functional workflows

## References

- [SysML Specification](https://www.omgsysml.org/)
- [Systems Engineering Body of Knowledge (SEBoK)](https://www.sebokwiki.org/)
- [Functional Requirements vs. Architecture](https://www.sebokwiki.org/wiki/Requirements_Engineering)
- [Grey-box Testing](https://en.wikipedia.org/wiki/Gray-box_testing)
- [INCOSE Systems Engineering Handbook](https://www.incose.org/products-and-publications/se-handbook)

---

**Status**: Active analysis and recommendation  
**Next Step**: Review and approve approach, then implement changes  
**Impact**: Fundamental enhancement to UDD's requirements model

