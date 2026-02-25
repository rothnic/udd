# UDD Concept Model

## Overview

This document defines the canonical concept model for User Driven Development (UDD). It reconciles existing repository language (product/actors.md and journey artifacts) with SysML-informed traceability decisions captured during phase 2. The goal is to provide clear boundaries, reduce ambiguity for agents and humans, and enable deterministic linting and traceability rules.

## Concepts

### Persona
**Definition:** A human archetype representing a class of users, their goals, context, and constraints. Personas are written by product authors and live as guidance in product/actors.md. Use Personas to express needs and motivations, not implementation details.

**Scope:** User goals, context, motivations, common behaviors, skill levels, and success criteria relevant to product decisions and journey narratives.

**Anti-Scope:** Implementation details, technical constraints, acceptance criteria, test steps, or API contracts.

**Positive Example:** "Project manager who schedules daily planning, needs quick rescheduling and visibility into team load." (Recorded as a Persona in product/actors.md and referenced by journeys.)

**Negative Example:** "Persona lists the API endpoint to call for rescheduling." (Implementation detail - belongs to Component or Requirement.)

### Journey
**Definition:** An experience-first narrative describing how a Persona progresses through stages to achieve a goal. Journeys capture stages, touchpoints, channels, emotions, pain points, and success metrics.

**Scope:** High-level sequence of user activities, narrative context, goals, success metrics, and links to Use Cases and scenarios. Journeys must avoid implementation internals.

**Anti-Scope:** Detailed acceptance steps, scenario text, code, component design, and test assertions.

**Positive Example:** "Daily planning journey that describes stages: prepare, prioritize, assign, review, with success metric 'first plan created < 5 minutes'." (Stored under product/journeys/.)

**Negative Example:** "Journey includes step-by-step API interaction or SQL schema for storing plans." (Belongs to Component/Requirement.)

### Use Case
**Definition:** A mapping from a Journey or Persona need to one or more testable behaviors. Use Cases are YAML artifacts that reference scenario slugs (paths to .feature files) and provide the connection between narrative intent and executable scenarios.

**Scope:** Use-case identifier, description, referenced scenario paths, preconditions, and high-level constraints needed to implement the capability.

**Anti-Scope:** Full scenario text, implementation code, component internals, or low-level test steps. Use Cases must not duplicate scenario steps.

**Positive Example:** "use-cases/daily-reschedule.yml references specs/scheduling/reschedule.feature and lists precondition: user authenticated." 

**Negative Example:** "A Use Case containing Given/When/Then steps copied from a feature file." (Scenario text must live only in .feature files.)

### Scenario
**Definition:** The single source of acceptance for a behavior, written in Gherkin and stored in a .feature file. Scenarios are user-facing acceptance descriptions that drive E2E tests.

**Scope:** Gherkin steps (Given/When/Then), examples, data tables, and comments documenting user intent and edge cases. One scenario per file policy applies.

**Anti-Scope:** Implementation notes, test harness details, component wiring, or internal requirement mapping (those belong in Requirement or Component docs).

**Positive Example:** "specs/scheduling/reschedule.feature contains a scenario 'User reschedules an event' with Given/When/Then steps describing the expected behavior." 

**Negative Example:** "A scenario file that includes NodeJS test fixtures or API implementation snippets." (Implementation must be in tests or components.)

### Requirement
**Definition:** A developer-facing contract that links scenarios to implementation details: acceptance criteria mapping, API contracts, non-functional constraints, and traceability pointers to components and tests.

**Scope:** Detailed acceptance criteria, success metrics for implementation, performance and security constraints, mappings to scenario(s), and references to Component owners.

**Anti-Scope:** User narrative, journey stages, or scenario step text. Requirements must not replace scenarios as the acceptance source.

**Positive Example:** "Requirement: Reschedule API must respond within 300ms and update calendar entries atomically. Maps to specs/scheduling/reschedule.feature and component scheduling-service." 

**Negative Example:** "Requirement that copies Gherkin steps as acceptance criteria verbatim and uses them as the only test specification." (This duplicates scenario responsibility.)

### Component
**Definition:** A documented implementation unit (service, module, UI component, database schema) responsible for delivering parts of a Use Case or Requirement. Component docs map to Use Cases and include design, interfaces, owners, and test mappings.

**Scope:** Architecture diagrams, API/interface contracts, data models, owner, dependencies, and references to Requirements and tests.

**Anti-Scope:** User-facing narratives, journey storytelling, or scenario text. Components should not contain acceptance-step Gherkin.

**Positive Example:** "components/scheduling-service.md describes endpoints, data model, owner, and links to the reschedule Requirement and tests." 

**Negative Example:** "Component file that contains high-level user goals and emotional journey information instead of interfaces." (That belongs to Journey or Persona.)

### Test Review
**Definition:** A human or automated assessment that verifies tests and scenarios accurately represent intended behavior and meet quality guidelines. Test Reviews include review outcomes, issues found, and required remediation actions.

**Scope:** Test completeness, scenario coverage, mapping between scenarios and Use Cases, test data validity, and annotations for flaky or missing tests.

**Anti-Scope:** Implementation changes, component design decisions, or journey edits. Reviews may recommend changes but must not alter source artifacts directly.

**Positive Example:** "A review notes that reschedule.feature lacks an error-case scenario and files a remediation ticket linking to the Use Case." 

**Negative Example:** "A Test Review that edits a component's API contract directly instead of raising an issue and routing to the component owner." 

## Anti-Overlap Rules Summary
| Concept | Owns | Must NOT Contain |
|---------|------|------------------|
| Persona | User archetype, goals, context | Acceptance steps, API contracts, implementation details |
| Journey | Experience narrative, stages, metrics | Gherkin scenarios, component internals |
| Use Case | Links from journey to scenarios, preconditions | Scenario text (Given/When/Then), implementation code |
| Scenario | Gherkin acceptance text, examples | Component design, API contract, non-functional implementation notes |
| Requirement | Implementation acceptance criteria, test mapping | User narrative, journey stages, scenario Gherkin |
| Component | Design, interfaces, owners, data models | User journey, scenario steps, high-level narrative |
| Test Review | Review findings, coverage, remediation items | Direct code or spec edits; implementation changes |

## References
- .sisyphus/evidence/phase2/task-1-concepts.md
- .sisyphus/evidence/phase2/task-1-ambiguity.md
- .sisyphus/notepads/udd-sysml-traceability-phase2/decisions.md
