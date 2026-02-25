# UDD: User Authoring Playbook

Purpose: Practical, human-facing playbook for authoring Personas, Journeys, Use Cases, Scenarios, Requirements, and Components without overlap.

Audience: Product authors, spec writers, QA, and reviewers who create or maintain UDD artifacts.

Guiding rule: One source of truth for each concern. If it's user-facing narrative, it belongs in Persona or Journey. If it's acceptance text, it belongs in a Scenario. If it's implementation, it belongs in Requirement or Component.

1. Quick workflow (step-by-step)

1.1 Prepare
- Read target product/journeys/ file or create a new journey in product/journeys/
- Confirm the primary Persona in product/actors.md applies
- Identify success metrics (measurable) and constraints

1.2 Draft Journey (Narrative)
- Write an experience-first narrative: stages, touchpoints, emotions, pain points
- Keep it user-centered: no API, no acceptance steps, no implementation hints
- Link Persona by slug (e.g., Actor: project_manager)

1.3 Define Use Case(s)
- For each meaningful capability in the journey, create a Use Case YAML in specs/use-cases/
- Include: id, description, referenced scenario paths (not steps), preconditions, and high-level constraints
- Do not copy Gherkin into Use Case

1.4 Author Scenario(s)
- Create one scenario file per behavior under specs/<domain>/*.feature
- Follow Gherkin: Given / When / Then with examples and edge cases
- Add comment blocks at top: "User need", "Alternatives considered", "Success criteria"
- Keep one scenario per file rule strictly

1.5 Create Requirement(s)
- Map the Scenario to implementation acceptance criteria, performance targets, security constraints
- Include links to Component owners
- Keep technical detail out of Scenario; keep user intent out of Requirement

1.6 Create or update Component docs
- Document interfaces, data models, API contracts, owners, dependencies
- Link back to Requirements and Use Cases

1.7 Test Review and Traceability
- Run udd lint / udd validate
- Ensure Use Case references scenario path(s)
- Ensure Requirement references scenario(s) and Component(s)
- File a remediation ticket if coverage gaps exist

2. Decision checklists

2.1 Persona checklist
- Does this describe a human archetype and goal? YES: Persona
- Does it include success metric and context? YES
- Does it contain implementation detail (API, DB)? NO: move that detail elsewhere

2.2 Journey checklist
- Does this capture an experience and sequence of steps? YES
- Does it avoid Given/When/Then and test steps? YES
- Are success metrics present? YES

2.3 Use Case checklist
- Does it reference scenario file paths instead of copying steps? YES
- Are preconditions and scope documented? YES

2.4 Scenario checklist
- Single scenario per file? YES
- Has Given/When/Then and examples? YES
- Top comments: user need, alternatives, success criteria present? YES
- No implementation-only details? YES

2.5 Requirement checklist
- Maps to scenario(s)? YES
- Contains non-functional constraints and acceptance targets? YES
- Does not duplicate scenario Gherkin? YES

2.6 Component checklist
- Has interface definitions and owner? YES
- Links to Requirement(s) and tests? YES

3. What not to do (overlap prevention)

- Do not paste Gherkin into Use Cases or Requirements. Use Cases reference scenario path only.
- Do not put API contracts or performance numbers inside Journey or Persona.
- Do not mix multiple scenarios in a single .feature file. One scenario per file rule.
- Do not edit tests while doing narrative edits. File a remediation ticket for tests or create a PR that pairs scenario and test together.
- Do not conflate success criteria with implementation targets. Success criteria belong in Journey/Scenario comments; implementation targets belong in Requirement.

Concrete overlap prevention pattern:
- If you find a journey file with Given/When/Then steps, move those steps into a new specs/<domain>/*.feature and replace journey step with a link to that scenario.

4. Examples

Example: Persona (product/actors.md)
- "Project manager who schedules daily planning and needs quick rescheduling and visibility into team load."

Example: Journey (product/journeys/daily-planning.md)
- Stages: prepare, prioritize, assign, review
- Success: "first plan created < 5 minutes"
- Link: refs specs/scheduling/reschedule.feature (do not include Gherkin here)

Example: Use Case (specs/use-cases/daily-reschedule.yml)
- id: daily.reschedule
- description: Map journey stage 'reschedule' to specs/scheduling/reschedule.feature
- scenarios:
  - specs/scheduling/reschedule.feature

Example: Scenario (specs/scheduling/reschedule.feature)
"""
# User need: Quickly move a meeting when a conflict appears
# Alternatives considered: Cancel and re-create, propose time via email
# Success criteria: Meeting updated in calendar within 300ms, attendees notified

Feature: Reschedule meeting
Scenario: User reschedules an event
  Given the user has an existing event
  When they select a new time and confirm
  Then the event is updated for all attendees
"""

Example: Requirement (requirements/reschedule-api.md)
- Reschedule API must respond within 300ms
- Must update calendar entries atomically
- Mapped scenarios: specs/scheduling/reschedule.feature

5. Review & validation steps

- Run: udd lint
- Run: udd validate
- Run: npm run check
- If lint/validate fails, follow the remediation in test review process and file tickets linking artifacts

6. Appendix: Quick fixes for common mistakes

- Mistake: Journey includes Gherkin -> Fix: Create scenario file, link from journey, remove Gherkin from journey
- Mistake: Use Case duplicates scenario text -> Fix: Keep only path reference in Use Case, move steps to scenario
- Mistake: Requirement contains user narrative -> Fix: Move narrative to Journey or Persona and add reference in Requirement

7. Sign-offs and ownership

- Persona owner: product/actors.md author
- Journey owner: product/journeys/<file> author
- Use Case owner: spec author listed in YAML
- Scenario owner: author of .feature file
- Requirement owner: component owner

8. FAQ (short)

Q: When should I edit a scenario vs requirement?
A: Edit scenario for acceptance behavior. Edit requirement for implementation constraints or non-functional targets.

Q: Where do tests live?
A: tests/ mapped to specs/ scenario paths. Tests implement the Gherkin steps.

---
End of playbook
