# UDD Concept Mappings

This document maps User Driven Development (UDD) concepts to formal Systems Engineering (SE) concepts and defines how features evolve over time.

## Core Concept Mappings

| UDD Concept | SE Equivalent | Purpose | Location |
|-------------|---------------|---------|----------|
| **Concept** | Project Charter / System Definition | Philosophy, principles, scope boundaries | `product/concept.md` |
| **Journey** | CONOPS (Concept of Operations) | Operational scenarios, user workflows, success criteria | `product/journeys/*.md` |
| **Use Case** | System Requirements (functional) | Specific functional requirements, actors, outcomes | `specs/use-cases/*.yml` |
| **Scenario** | Acceptance Criteria / Test Case | BDD specifications, executable tests | `specs/features/**/*.feature` |
| **Roadmap** | Life Cycle Plan | Phase assignments, timing, deliverables | `specs/roadmap.yml` |
| **Capability Theme** | Capability (grouping concept) | Enduring functional area that evolves across phases | Tag on journey/use case |

## Systems Engineering Process Alignment

```
SE Process Flow                    UDD Implementation
────────────────────────────────────────────────────────────────
Stakeholder Needs Analysis    →    Journey Context
         ↓                              ↓
   Mission Analysis           →    Journey Goal
         ↓                              ↓
CONOPS (Operational         →    Journey Steps
   Scenarios)                        & Flow
         ↓                              ↓
System Requirements         →    Use Cases
   Specification                      (yaml)
         ↓                              ↓
Design & Implementation     →    Code
         ↓                              ↓
   Verification             →    E2E Tests
```

## Document Hierarchy

### Level 1: Foundation (Concept)
**File**: `product/concept.md`

Contains:
- Core philosophy and principles
- Do's and don'ts (what makes work "UDD-compliant")
- Scope boundaries (what requires full traceability)
- Project identity and values

**SE Equivalent**: Project Charter / System Definition Document

### Level 2: Operational (Journeys)
**Files**: `product/journeys/*.md`

Each journey is a mini-CONOPS describing:
- **Actor**: Who performs the journey (links to persona)
- **Goal**: What they want to achieve
- **Context**: Current state, pain points, justification
- **Steps**: Operational flow with links to scenarios
- **Success Criteria**: How we know it works
- **Evolution**: How this capability develops over phases

**SE Equivalent**: IEEE 1362 Concept of Operations (per operational scenario)

### Level 3: Requirements (Use Cases)
**Files**: `specs/use-cases/*.yml`

Specific functional requirements:
- **id**: Unique identifier
- **name**: Human-readable name
- **summary**: What this use case does
- **actors**: Who participates
- **outcomes**: Results with scenario references

**SE Equivalent**: System/Software Requirements Specification (functional requirements)

### Level 4: Verification (Scenarios)
**Files**: `specs/features/**/*.feature`

BDD specifications:
- Gherkin format
- @phase:N tags for phase assignment
- Background, scenarios, steps
- Links to E2E tests

**SE Equivalent**: Acceptance Criteria / Test Cases

### Level 5: Planning (Roadmap)
**File**: `specs/roadmap.yml`

Timing and assignments:
- Current phase
- Phase definitions
- Use case assignments per phase
- Capability evolution tracking

**SE Equivalent**: Life Cycle Plan / Development Roadmap

## Feature Evolution: How Capabilities Develop Over Time

### Example: Autonomous Development Capability

This example shows how a capability evolves across multiple phases.

#### Phase 3: Basic Orchestration (Current)

**Capability Theme**: `autonomous-development`  
**Increment**: `v1-basic`  
**Goal**: Enable simple agent delegation and monitoring

**Journey**: `orchestrated-iteration.md`
```markdown
# Journey: Orchestrated Iteration

**Actor**: Developer, Orchestrator Agent, Worker Agent  
**Goal**: Enable continuous autonomous development with agent coordination  
**Increment**: v1-basic  
**Capability**: autonomous-development

## Context
Complex projects benefit from orchestrated agent workflows. This journey
enables an orchestrator to delegate work and monitor completion.

## Steps (v1 - Basic)
1. Developer starts orchestrated session
2. Orchestrator analyzes project status 
   → `specs/features/opencode/orchestration/iterate_until_complete.feature`
3. Orchestrator delegates tasks to worker agents
   → `specs/features/opencode/orchestration/stop_on_error.feature`
4. Workers complete tasks and report back
5. Orchestrator continues until project complete

## Success Criteria (v1)
- Orchestrator delegates work to workers and monitors completion
- Orchestrator handles errors and preserves session state
- Orchestrator uses structured status to make decisions

## Evolution Roadmap
- **v1-basic (Phase 3)**: Simple delegation, basic error handling
- **v2-advanced (Phase 4)**: Multi-agent coordination, AI optimization
- **v3-full (Phase 5)**: Self-managing, zero human oversight
```

**Use Case**: `specs/use-cases/orchestrated_iteration.yml`
```yaml
id: orchestrated_iteration
name: Orchestrated Iteration
summary: Enable continuous autonomous development using an orchestrator agent that coordinates worker agents via the OpenCode SDK, iterating until project completion or error state.
increment: v1-basic
capability: autonomous-development
phase: 3
actors:
  - developer
  - orchestrator_agent
  - worker_agent
outcomes:
  - description: Orchestrator delegates work to worker and monitors completion
    scenarios:
      - opencode/orchestration/iterate_until_complete
  - description: Orchestrator handles errors and preserves session state
    scenarios:
      - opencode/orchestration/stop_on_error
  - description: Developer can configure iteration limits and pause conditions
    scenarios:
      - opencode/orchestration/configurable_iteration
```

**Scenarios**: @phase:3
- `iterate_until_complete.feature`
- `stop_on_error.feature`
- `configurable_iteration.feature`

#### Phase 4: Advanced Orchestration (Future)

**Capability Theme**: `autonomous-development`  
**Increment**: `v2-advanced`  
**Goal**: Complex multi-agent coordination with AI optimization

**Journey**: Same file, updated for v2
```markdown
## Steps (v2 - Advanced)
1. Developer defines high-level objectives
2. Orchestrator breaks down into sub-tasks
3. Multiple worker agents work in parallel
4. AI optimizes task assignment based on agent strengths
5. Automatic rollback on failure detection
6. Continuous learning from previous iterations

## Success Criteria (v2)
- Multi-agent parallel execution
- AI-driven task optimization
- Automatic failure recovery
- Performance improvement over iterations
```

**Use Case**: New use case or extended
```yaml
id: orchestrated_iteration_advanced
name: Advanced Orchestrated Iteration
summary: Multi-agent coordination with AI optimization and learning
increment: v2-advanced
capability: autonomous-development
phase: 4
actors:
  - developer
  - orchestrator_agent
  - worker_agent_pool
outcomes:
  - description: Multiple workers execute tasks in parallel
    scenarios:
      - opencode/orchestration/parallel_execution
  - description: AI optimizes task-to-agent assignment
    scenarios:
      - opencode/orchestration/ai_optimization
```

#### Phase 5: Full Autonomy (Future Vision)

**Capability Theme**: `autonomous-development`  
**Increment**: `v3-full`  
**Goal**: Self-managing development with zero human oversight

**Journey**: Conceptual, not detailed yet
```markdown
## Steps (v3 - Full Autonomy)
- System monitors codebase continuously
- Automatically identifies improvement opportunities
- Self-assigns and completes tasks
- Human only reviews major architectural changes
```

### Evolution Pattern Summary

```
CAPABILITY (enduring): autonomous-development
    ├── v1-basic (Phase 3)
    │   └── Journey: orchestrated-iteration
    │       └── Use Case: orchestrated_iteration
    │           └── Scenarios: @phase:3 [delivered]
    │
    ├── v2-advanced (Phase 4) [planned]
    │   └── Journey: orchestrated-iteration (updated)
    │       └── Use Case: orchestrated_iteration_advanced
    │           └── Scenarios: @phase:4
    │
    └── v3-full (Phase 5) [vision]
        └── Journey: conceptual
            └── Use Case: TBD
                └── Scenarios: @phase:5
```

## Roadmap.yml Structure

```yaml
# specs/roadmap.yml
current_phase: opencode-integration

phases:
  - id: opencode-integration
    name: "OpenCode Integration"
    status: active
    use_cases:
      - id: orchestrated_iteration
        increment: v1-basic
        capability: autonomous-development
        scenarios:
          - opencode/orchestration/iterate_until_complete
          - opencode/orchestration/stop_on_error
          - opencode/orchestration/configurable_iteration
          
      - id: agent_customization
        increment: v1-basic
        capability: autonomous-development
        
      - id: capture_ideas
        increment: v1
        capability: idea-management

capabilities:
  autonomous-development:
    name: "Autonomous Development"
    description: "Enduring ability for AI agents to develop software autonomously"
    current_increment: v1-basic
    increments:
      - version: v1-basic
        phase: opencode-integration
        status: delivered
        use_cases:
          - orchestrated_iteration
          - agent_customization
          
      - version: v2-advanced
        phase: agent-intelligence
        status: planned
        use_cases:
          - orchestrated_iteration_advanced
          
      - version: v3-full
        phase: advanced-workflows
        status: vision
        use_cases: []

validation_rules:
  scenario_phase_must_match_use_case_phase: true
  allow_future_phase_planning: true
  strict_mode: false
```

## Decision Guidelines

### When to Create a New Journey vs Update Existing

**Create New Journey When:**
- Entirely new operational workflow
- Different user goals
- Different actors
- Not an evolution of existing capability

**Update Existing Journey When:**
- Same operational concept, enhanced functionality
- Same actors and goals
- Evolution of capability increment
- Add new "Evolution" or "Phase N" section

### When to Create New Use Case vs Update Existing

**Create New Use Case When:**
- Significantly different functional requirements
- Different actors
- New API/interface
- Major version change (v1 → v2)

**Update Existing Use Case When:**
- Additional outcomes to same functionality
- Same actors, extended scenarios
- Minor enhancement within same increment

### Phase Tagging Rules

1. **Use Case** has `phase: N` - when it's delivered
2. **Scenario** has `@phase:N` - must match use case phase
3. **Journey** tracks evolution across phases
4. **Validation**: `udd validate --roadmap` checks alignment

## Validation Examples

### Valid Configuration
```yaml
# Use Case
id: orchestrated_iteration
phase: 3

# Scenario
@phase:3
Feature: Iterate Until Complete

# Validation: ✓ Pass
```

### Invalid Configuration (Mismatch)
```yaml
# Use Case
id: orchestrated_iteration
phase: 3

# Scenario
@phase:4  # Future phase
Feature: Iterate Until Complete

# Validation: ✗ Fail
# "Scenario tagged @phase:4 but use case assigned to phase 3"
```

### Valid Future Planning
```yaml
# Use Case
id: orchestrated_iteration_advanced
phase: 4
status: planned

# Scenario
@phase:4
Feature: Parallel Execution
# No test file yet (stub only)

# Validation: ✓ Pass (with warning: "Future phase, implementation not required yet")
```

## References

### Systems Engineering Standards
- **IEEE 1362-1998**: Guide for Information Technology—System Definition—Concept of Operations (ConOps) Document
- **ISO/IEC/IEEE 15288:2015**: Systems and software engineering—System life cycle processes
- **INCOSE Systems Engineering Handbook V4**: Chapter on Concept of Operations
- **NASA Systems Engineering Handbook (SP-2016-6105)**: Concept of Operations activity

### Systems Engineering Body of Knowledge (SEBoK)
- Stakeholder Needs and Requirements
- Concept of Operations
- System Requirements Definition
- Life Cycle Planning

## Summary

UDD maps cleanly to formal Systems Engineering:

1. **Journey = CONOPS**: Operational scenarios from user perspective
2. **Use Case = Requirements**: Functional specifications
3. **Scenario = Acceptance Criteria**: Testable behaviors
4. **Roadmap = Life Cycle Plan**: Phase assignments and timing

Capabilities evolve through **increments** delivered across phases:
- v1-basic (current phase)
- v2-advanced (next phase)
- v3-full (future vision)

Each increment has its own journey (operational concept), use cases (requirements), and scenarios (tests).

## Complete Example Project: Task Management System

This example shows a complete UDD project structure with all artifacts and their linkages.

### Project Structure

```
my-task-app/
├── product/
│   ├── concept.md                     # Project philosophy & principles
│   ├── actors.md                      # Personas: developer, project-manager
│   ├── constraints.md                 # NFRs: response time < 2s, etc.
│   └── journeys/                      # CONOPS documents
│       ├── create-task.md             # Journey: Create Task
│       ├── manage-workflow.md         # Journey: Manage Workflow
│       └── track-progress.md          # Journey: Track Progress (Phase 2)
│
├── specs/
│   ├── roadmap.yml                    # Phase planning & capability tracking
│   ├── system-boundary.yml            # Scope definition
│   ├── use-cases/                     # Functional requirements
│   │   ├── create_task.yml            # Use Case: Create Task
│   │   ├── assign_task.yml            # Use Case: Assign Task
│   │   └── workflow_automation.yml    # Use Case: Workflow (Phase 2)
│   │
│   └── features/                      # BDD scenarios
│       └── task-management/
│           ├── create_task.feature    # Scenario: Create Task @phase:1
│           ├── assign_task.feature    # Scenario: Assign Task @phase:1
│           └── workflow_rules.feature # Scenario: Auto-assign @phase:2
│
├── tests/
│   └── e2e/
│       └── task-management/
│           ├── create_task.e2e.test.ts
│           ├── assign_task.e2e.test.ts
│           └── workflow_rules.e2e.test.ts
│
└── .udd/
    └── manifest.yml                   # Auto-generated traceability
```

### Example Files and Linkages

#### 1. Concept (Project Charter)
**File**: `product/concept.md`
```markdown
# Task Management System - Concept

## Philosophy
Simple task management that stays out of the way.

## Do
- Create tasks in under 5 seconds
- Assign with natural language
- Track progress automatically

## Don't
- Complex project hierarchies
- Time tracking
- Resource allocation
```

#### 2. Journey (CONOPS)
**File**: `product/journeys/create-task.md`
```markdown
---
persona_id: developer
capability: task-creation
increment: v1-basic
---

# Journey: Create Task

**Actor**: Developer  
**Goal**: Quickly capture a task without interrupting flow

## Context
Developers lose ideas when task creation is slow. This journey
enables instant task capture from anywhere.

## Steps
1. User triggers quick capture (hotkey/CLI)
   → `specs/features/task-management/create_task.feature`
2. User enters natural language description
3. System parses and creates task
4. System confirms with optional details

## Success Criteria
- Task created in < 5 seconds
- Natural language understood
- No mandatory fields

## Evolution
- **v1-basic (Phase 1)**: CLI quick capture
- **v2-smart (Phase 2)**: AI parsing, auto-categorization
```

#### 3. Use Case (Requirements)
**File**: `specs/use-cases/create_task.yml`
```yaml
id: create_task
name: Create Task
summary: Enable instant task creation via CLI with natural language parsing
capability: task-creation
increment: v1-basic
phase: 1
actors:
  - developer
outcomes:
  - description: User creates task via CLI with single command
    scenarios:
      - task-management/create_task
  - description: System parses natural language description
    scenarios:
      - task-management/create_task
```

#### 4. Scenario (Acceptance Criteria)
**File**: `specs/features/task-management/create_task.feature`
```gherkin
@phase:1
Feature: Create Task

  As a developer
  I want to create tasks quickly via CLI
  So that I don't lose ideas while coding

  Scenario: Create task with single command
    Given I run "task create 'Fix login bug'"
    When the command completes
    Then a task "Fix login bug" should exist
    And it should be in status "todo"
    And it should have no assignee

  Scenario: Create task with assignee
    Given I run "task create 'Review PR' --assignee=@alice"
    When the command completes
    Then a task "Review PR" should exist
    And it should be assigned to "alice"
```

#### 5. Roadmap (Life Cycle Plan)
**File**: `specs/roadmap.yml`
```yaml
current_phase: core-features

phases:
  - id: core-features
    name: "Core Features"
    status: active
    use_cases:
      - id: create_task
        capability: task-creation
        increment: v1-basic
        scenarios:
          - task-management/create_task
          
      - id: assign_task
        capability: task-management
        increment: v1-basic
        scenarios:
          - task-management/assign_task

  - id: workflow-automation
    name: "Workflow Automation"
    status: planned
    use_cases:
      - id: workflow_automation
        capability: workflow
        increment: v1-basic
        scenarios:
          - task-management/workflow_rules

capabilities:
  task-creation:
    name: "Task Creation"
    current_increment: v1-basic
    increments:
      - version: v1-basic
        phase: core-features
        status: active
        use_cases:
          - create_task
          
      - version: v2-smart
        phase: workflow-automation
        status: planned
        use_cases:
          - create_task_enhanced
```

### Traceability Chain Example

```
CONCEPT
  "Enable instant task capture"
      ↓
JOURNEY: create-task
  Actor: developer
  Goal: "Quickly capture a task"
  Capability: task-creation (v1-basic)
      ↓
USE CASE: create_task
  Phase: 1 (core-features)
  Scenarios: [create_task]
      ↓
SCENARIO: create_task.feature
  @phase:1
  Feature: Create Task
      ↓
TEST: create_task.e2e.test.ts
  Validates scenario
```

### Validation Examples

**✓ Valid: All aligned**
- Use Case `create_task` has `phase: 1`
- Scenario has `@phase:1`
- Journey has increment `v1-basic`
- Roadmap assigns to `core-features` phase

**✗ Invalid: Phase mismatch**
- Use Case `create_task` has `phase: 1`
- Scenario has `@phase:2` ← ERROR
- Validation: "Scenario @phase:2 but use case assigned to phase 1"

**✗ Invalid: Missing link**
- Journey references scenario `create_task`
- No use case includes this scenario ← ERROR
- Validation: "Orphan scenario - no use case references it"

### Decision Flow

**Adding a new feature:**

1. **Does it fit the Concept?**
   - Check `product/concept.md` scope
   - If yes, proceed

2. **Existing capability or new?**
   - Check `specs/roadmap.yml` capabilities
   - If extends existing → same capability, new increment
   - If new area → new capability

3. **Create/Update Journey**
   - New workflow → new journey
   - Enhancement → update existing journey with new increment section

4. **Create Use Case**
   - New YAML file in `specs/use-cases/`
   - Link to capability and increment
   - Set phase based on roadmap

5. **Create Scenario**
   - New `.feature` file
   - Tag with `@phase:N` matching use case

6. **Validate**
   - Run `udd validate --trace`
   - Ensure chain: Concept → Journey → Use Case → Scenario → Test

## Quick Reference: File Relationships

| File Type | Example | Links To | SE Equivalent |
|-----------|---------|----------|---------------|
| Concept | `product/concept.md` | Nothing (foundation) | Project Charter |
| Journey | `product/journeys/*.md` | Use Cases (via manifest) | CONOPS |
| Use Case | `specs/use-cases/*.yml` | Scenarios | Requirements |
| Scenario | `specs/features/*.feature` | E2E Tests | Acceptance Criteria |
| Roadmap | `specs/roadmap.yml` | Use Cases (assigns phase) | Life Cycle Plan |
| Test | `tests/e2e/*.test.ts` | Scenarios | Verification |

