# Implement Task 4 canonical derivation model documentation (@Sisyphus-Junior subagent)

**ID**: ses_36aa836b6ffeDn1rHtKkM0Yjvj
**Project ID**: ad761ea6174e58ed763fc75290c3f403ed51079d
**Created**: 2/25/2026, 9:08:04 AM
**Stats**: 1 files changed, +292 -0

---

## USER (9:08:35 AM)

# Canonical Derivation Model

Purpose: Define the authoritative derivation path from user intent to implementation requirements. This document establishes the canonical chain that all UDD traceability queries follow, ensuring deterministic navigation through the artifact graph.

Scope: Persona, Journey, Use Case, Scenario, E2E Test, Component, Requirement.

Alignment: This model extends the trace query path defined in `specs/traceability-contract.yml` (line 334: `persona → journey → use_case → scenario → e2e_test → requirement`) by adding Component as the implementation mapping layer. It complements `docs/architecture/udd-concept-model.md` by defining derivation semantics rather than artifact definitions.

## 1. Canonical Derivation Path

The canonical path in exact order:

```
Persona → Journey → Use Case → Scenario → E2E Test → Component → Requirement
```

This path represents the complete forward trace from user intent to technical implementation. Each layer MUST derive from the previous layer; skipping layers is prohibited except under explicit exception rules (see Exception Policy).

## 2. Node Definitions

### 2.1 Persona
- **Definition**: Human archetype describing who acts in the system, their context, goals, and pain points.
- **Source**: `product/actors.md` or journey frontmatter.
- **Key Fields**: `id` (kebab-case), `name`, `description`, `goals` (array of measurable goals).
- **Owner**: ProductOwner.

### 2.2 Journey
- **Definition**: Ordered list of user-focused steps describing an outcome the persona wants to achieve.
- **Source**: `product/journeys/*.md`
- **Key Fields**: `id` (kebab-case), `actor` (references persona.id), `goal`, `steps` (ordered list with path or use_case references).
- **Owner**: ProductOwner.

### 2.3 Use Case
- **Definition**: Compact YAML document capturing an interaction goal, expected outcomes, and explicit scenario path references.
- **Source**: `specs/use-cases/*.yml`
- **Key Fields**: `id` (kebab-case), `name`, `summary`, `actors` (array of persona.id), `outcomes` (with scenario references).
- **Owner**: ProductOwner.

### 2.4 Scenario
- **Definition**: Single Gherkin Scenario block in a .feature file; single source of truth for user-facing behavior.
- **Source**: `specs/features/<area>/<feature>/<slug>.feature`
- **Key Fields**: `id` (area/feature/slug), `feature_path`, `title`.
- **Owner**: ProductOwner.

### 2.5 E2E Test
- **Definition**: Implementation test that verifies a scenario.
- **Source**: `tests/**/*.e2e.test.ts`
- **Key Fields**: `id` (kebab-case matching scenario slug), `scenario_path`, `status` (passing/failing/pending).
- **Owner**: Agent (generated).

### 2.6 Component
- **Definition**: Logical implementation unit (service, module, UI widget) that lists responsibilities, public interfaces, and supported use cases/scenarios.
- **Source**: `specs/components/*.md` or `specs/components/*.yml`
- **Key Fields**: `id` (kebab-case), `name`, `responsibilities`, `supported_use_cases`, `supported_scenarios`.
- **Owner**: TechnicalLead.

### 2.7 Requirement
- **Definition**: Technical requirement (functional or non-functional) linking to features and scenarios.
- **Source**: `specs/requirements/*.yml`
- **Key Fields**: `id` (kebab-case), `type` (functional/non-functional), `feature`, `description`, `scenarios` (array of scenario slugs).
- **Owner**: TechnicalLead.

## 3. Link Semantics Between Layers

### 3.1 Persona → Journey
- **Link Field**: `journey.actor` = `persona.id`
- **Semantics**: A journey MUST reference exactly one persona in its `actor` field. Multiple personas may reference the same journey.
- **Cardinality**: One persona → many journeys. One journey → one persona.

### 3.2 Journey → Use Case
- **Link Field**: `journey.steps` contains use_case.id references
- **Semantics**: Each step in a journey references either a use_case.id or a scenario path. Use cases are the preferred intermediate.
- **Cardinality**: One journey → many use cases.

### 3.3 Use Case → Scenario
- **Link Field**: `use_case.outcomes[].scenarios` contains scenario.id (area/feature/slug)
- **Semantics**: A use case lists scenario paths that implement its outcomes. Scenarios are the single source of truth.
- **Cardinality**: One use case → many scenarios. One scenario → many use cases.

### 3.4 Scenario → E2E Test
- **Link Field**: `e2e_test.scenario_path` = `scenario.feature_path`
- **Semantics**: Each scenario should have at least one E2E test that maps to its feature_path. Tests verify scenario behavior.
- **Cardinality**: One scenario → one or many E2E tests. One E2E test → one scenario.

### 3.5 E2E Test → Component
- **Link Field**: Component documents `supported_scenarios` or `supported_use_cases`
- **Semantics**: Components declare which scenarios/use cases they implement. Tests implicitly validate components through scenario execution.
- **Cardinality**: One component → many scenarios/use cases. One scenario → one or many components.

### 3.6 Component → Requirement
- **Link Field**: Requirements may reference components via `feature` or component documentation links to requirements
- **Semantics**: Components implement requirements. A requirement may be satisfied by one or many components.
- **Cardinality**: One component → many requirements. One requirement → one or many components.

## 4. Worked Example: Happy-Path Derivation

This example demonstrates the canonical path for a "Capture Task" workflow.

### Input: Persona
```yaml
id: "team-member"
name: "Team Member"
description: "Mobile-first individual who needs to capture ideas quickly while away from desk"
goals: ["capture tasks", "surface top 3 priorities"]
```

### Derivation Step 1: Journey
```yaml
id: "daily-capture-workflow"
actor: "team-member"
goal: "Capture and organize tasks quickly"
steps:
  - "Quick capture → use_cases/capture_task"
  - "View inbox → use_cases/view_inbox"
```

### Derivation Step 2: Use Case
```yaml
id: "capture_task"
name: "Capture Task"
summary: "Quickly capture raw tasks into inbox"
actors: ["team-member"]
outcomes:
  - description: "Task created with title"
    scenarios: ["udd/cli/inbox/add_item_via_cli"]
```

### Derivation Step 3: Scenario
```
# File: specs/features/udd/cli/inbox/add_item_via_cli.feature
Feature: CLI Inbox Management

  Scenario: User adds item via CLI
    Given the CLI is installed
    When I run "udd add 'Buy milk'"
    Then I see "Added: Buy milk" in output
```

### Derivation Step 4: E2E Test
```typescript
// File: tests/e2e/udd/cli/inbox/add_item_via_cli.e2e.test.ts
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";

const feature = await loadFeature("specs/features/udd/cli/inbox/add_item_via_cli.feature");

describeFeature(feature, ({ Scenario }) => {
  Scenario("User adds item via CLI", ({ Given, When, Then }) => {
    // Step implementations...
  });
});
```

### Derivation Step 5: Component
```yaml
# File: specs/components/cli-command-service.md
id: "cli-command-service"
name: "CLI Command Service"
responsibilities:
  - "Parse CLI arguments"
  - "Execute add/list/delete commands"
  - "Format output for terminal"
supported_use_cases:
  - "capture_task"
  - "view_inbox"
supported_scenarios:
  - "udd/cli/inbox/add_item_via_cli"
```

### Derivation Step 6: Requirement
```yaml
# File: specs/requirements/persist_item_with_defaults.yml
id: "persist_item_with_defaults"
type: "functional"
feature: "udd/cli/inbox"
description: "Persist a new item with title and default completed=false"
scenarios:
  - "udd/cli/inbox/add_item_via_cli"
```

## 5. Anti-Example: Skipped Layer (Invalid)

This example demonstrates an invalid derivation that skips the Use Case layer.

### Invalid Derivation: Journey → Scenario Direct

```yaml
# INVALID: Journey directly references scenario without Use Case intermediate
id: "invalid-capture-workflow"
actor: "team-member"
goal: "Capture tasks quickly"
steps:
  - "Quick capture → specs/features/udd/cli/inbox/add_item_via_cli.feature"
  # ^ INVALID: Skips use_case layer
```

**Why This Is Invalid:**
1. **Traceability Break**: Forward trace queries from persona to requirement fail because journey.steps should reference use_case.id (intermediate layer), not direct scenario paths.
2. **Use Case Orphaning**: The use case layer becomes unreachable from this journey.
3. **Mapping Ambiguity**: Multiple journeys could reference the same scenario without a use case intermediary, causing confusion about which user goal the scenario serves.
4. **Contract Violation**: Per `specs/traceability-contract.yml`, journey.steps should reference use_case.id; direct scenario references break the trace query `journey_to_use_case`.

### Corrected Version

```yaml
# VALID: Journey references use case, use case references scenario
id: "valid-capture-workflow"
actor: "team-member"
goal: "Capture tasks quickly"
steps:
  - "Quick capture → use_cases/capture_task"
```

```yaml
# use_cases/capture_task.yml
id: "capture_task"
name: "Capture Task"
actors: ["team-member"]
outcomes:
  - description: "Task created with title"
    scenarios: ["udd/cli/inbox/add_item_via_cli"]
```

## 6. Exception Policy

Skipping intermediate layers in the canonical derivation path is **prohibited by default** with the following exceptions:

### 6.1 Allowed Exceptions

1. **Direct Scenario Reference from Journey (Conditional)**
   - **When Allowed**: Only when the scenario is atomic and represents a single, self-contained user action with no ambiguity about intent.
   - **How to Document**: Journey step must include both use_case.id AND scenario.id in format: `step_name → use_case:scenario`. The use case must still exist and reference the scenario.
   - **Example**: `Quick add → use_cases/capture_task:udd/cli/inbox/add_item_via_cli`

2. **Component Omission for Purely Declarative Scenarios**
   - **When Allowed**: When a scenario describes declarative state assertions (e.g., "Then I see the dashboard") without specific implementation behavior.
   - **How to Document**: Mark component reference as `N/A` in traceability manifest with justification note.

3. **Legacy Artifact Migration**
   - **When Allowed**: During migration from non-UDD artifact systems where intermediate layers did not exist.
   - **How to Document**: Add `migration_justification` field in the artifact metadata explaining why the layer is absent and planned remediation timeline.

### 6.2 Exception Request Process

To request an exception:
1. Document the proposed derivation in a spec change file under `specs/changes/`
2. Include `exception_type`, `justification`, and `documented_as` fields
3. Obtain approval from ProductOwner (for Persona/Journey/Use Case layers) or TechnicalLead (for Component/Requirement layers)
4. Update this document with the approved exception pattern if it establishes precedent

### 6.3 Invalid Exceptions

The following are never allowed:
- Skipping both Persona and Journey layers
- Skipping Use Case without documented exception
- Direct Requirement → Implementation code without Component intermediary (violates boundary_subject: udd-core)

## 7. Query Alignment

This derivation model aligns with trace queries defined in `specs/traceability-contract.yml`:

| Query | Canonical Path Segment |
|-------|------------------------|
| persona_to_journey | Persona → Journey |
| journey_to_use_case | Journey → Use Case |
| use_case_to_scenario | Use Case → Scenario |
| scenario_to_test | Scenario → E2E Test |
| test_to_requirement | E2E Test → Component → Requirement |

Forward trace: Persona → Journey → Use Case → Scenario → E2E Test → Component → Requirement
Reverse trace: Requirement → Component → E2E Test → Scenario → Use Case → Journey → Persona

## 8. Boundary Alignment

This model respects `specs/system-boundary.yml`:
- **Boundary Subject**: udd-core
- **In Scope**: Scenario and test mapping, use-case YAMLs, manifest
- **Out of Scope**: Runtime implementation code (src/), external services
- Component is included as it maps scenarios to implementation-facing requirements within the boundary.

## 9. Concept Non-Overlap

Per `docs/architecture/udd-concept-model.md`:
- Persona explains who; Journey explains what they do
- Use Case references scenarios by path; Scenario is the source of truth
- Requirement is implementation-facing; Scenario is user-facing acceptance
- Component documents implementation surface; Scenario documents user behavior

This derivation model does not change these boundaries—it provides the traversal path through them.

---

Contact: Update this file via normal PR process. If changes to the canonical path are needed, propose a spec change under `specs/changes/` with evidence of derivation simulation.


