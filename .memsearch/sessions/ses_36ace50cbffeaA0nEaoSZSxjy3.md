# Collect official traceability metadata best practices (@librarian subagent)

**ID**: ses_36ace50cbffeaA0nEaoSZSxjy3
**Project ID**: ad761ea6174e58ed763fc75290c3f403ed51079d
**Created**: 2/25/2026, 8:26:27 AM
**Stats**: 1 files changed, +96 -0

---

## USER (8:26:27 AM)

# UDD Concept Model: Canonical Taxonomy and Non-Overlap Rules

Purpose: provide concise, canonical definitions for the UDD artifacts that stakeholders and agents rely on. Make boundaries explicit so automation (udd tooling) can make deterministic decisions and flag misuses.

Scope: Persona, Journey, Use Case, Scenario, Requirement, Component, Test Review.

Principles
- Keep scenario text only in .feature files. Use cases reference scenario paths, they do not restate scenario steps.
- One scenario per .feature file. Scenario identity equals area/feature/slug path.
- Requirements reference scenarios and features; they do not contain user-facing scenario text.

1. Persona
- Definition: A concise human archetype describing who acts in the system, their context, goals, and pain points. Persona entries are short, testable, and used to guide journey language.
- Location: product/actors.md (or product/journeys frontmatter). Personas are human descriptions, not actors in tests.
- Positive example: "Team Member: mobile-first individual who needs to capture ideas quickly while away from desk. Goals: capture tasks, surface top 3 priorities." (short, measurable goals)
- Negative example: "User: wants things." (vague, no context or measurable goals)

Boundary rule: Persona describes motivations and context only. Do not include scenarios, steps, or technical requirements inside persona docs.

2. Journey
- Definition: A short, ordered list of user-focused steps that describe an outcome the persona wants to achieve. Journeys map to one or more use cases and point to scenario files where behaviors are specified.
- Location: product/journeys/*.md
- Positive example: Daily Planning journey listing steps: Review inbox -> Prioritize -> Commit to today, each step mapping to use case or scenario references.
- Negative example: A journey that contains full Gherkin Given/When/Then blocks inside the journey markdown.

Boundary rule: Journey explains intent and outcome. Steps may include pointers to use cases or scenario paths, but must not duplicate scenario text.

3. Use Case
- Definition: A compact YAML document capturing an interaction goal, expected outcomes, the persona(s) involved, and an explicit list of scenario path references that exercise the use case.
- Location: specs/use-cases/*.yml
- Positive example: capture_task.yml with id, summary, actors: [Team Member], outcomes and scenarios: [tasks/quick_capture/mobile_widget]
- Negative example: A use-case that embeds Gherkin scenarios or repeats long scenario steps in prose.

Boundary rule: Use cases reference scenarios by path (area/feature/slug). They must not restate scenario steps or become the primary source of truth for behavior.

4. Scenario
- Definition: A single Gherkin Scenario block stored in a .feature file. Scenarios are the single source of truth for user-facing behavior and acceptance criteria.
- Location: specs/features/<area>/<feature>/<slug>.feature
- Identity rule: path area/feature/slug uniquely identifies the scenario.
- Positive example: specs/features/todos/basic/add_todo_with_title.feature with one Scenario block describing Given/When/Then.
- Negative example: A .feature file containing multiple Scenario blocks or scenario text duplicated in a use-case YAML.

Boundary rule: Scenario text belongs only in .feature files. Tests map to scenarios; scenario edits should trigger stale detection of tests.

5. Requirement
- Definition: A technical requirement (functional or non-functional) that links to feature ids and scenario slugs it supports. Requirements describe implementation expectations and test mapping but do not replace scenario text.
- Location: specs/requirements/<key>.yml
- Positive example: store_new_todo.yml type: functional feature: todos/basic scenarios: [add_todo_with_title] description: Persist a new todo with title and default completed=false
- Negative example: A requirement that repeats full user-facing steps or includes acceptance Gherkin instead of referencing scenario slugs.

Boundary rule: Requirements may reference scenarios and list tests but must remain implementation-facing. They can include details that are outside Gherkin scope (performance budgets, error codes), but must not contradict scenario text.

6. Component
- Definition: A logical implementation unit (service, module, UI widget) that lists the responsibilities, public interfaces, and the set of use cases or scenarios it supports. Components map to implementation boundaries, not user-behavior artifacts.
- Location: specs/components/*.md or specs/components/*.yml
- Positive example: task_service.md describing API endpoints, supported use cases: capture_task, and scenarios it supports: mobile_widget, voice_input
- Negative example: A component doc that contains user-facing scenarios or rephrases the scenario steps as requirement-level prose.

Boundary rule: Component documentation focuses on implementation surface and mapping to requirements/use cases. It must not host scenario text.

7. Test Review
- Definition: A short, reviewable artifact describing that a test maps correctly to a scenario, includes a checklist (name matches scenario, steps correspond to Gherkin steps), and documents any overrides or known staleness.
- Location: tests/**/*.test-review.yml or tests/**/*.test-review.md
- Positive example: mobile_widget.test-review.yml containing checks: name_matches_scenario: true; steps_implemented: true; notes: none
- Negative example: A test-review that attempts to re-specify behavior or contains new user-facing steps absent from the scenario.

Boundary rule: Test reviews validate mapping and quality of test implementations; they must not be used to change the scenario meaning. Any test-driven clarifications must go back into the scenario file via a spec change.

Anti-Overlap Rules (summary)
- Persona vs Journey: Persona explains who; Journey explains what they do. Do not put steps in Persona.
- Journey vs Use Case: Journey is user-centered flow; Use Case is a machine-friendly mapping that references scenarios implementing steps. Use cases must not restate full scenario text.
- Use Case vs Scenario: Use Case references scenario paths. Scenario contains the authoritative behavior text. Never duplicate scenario steps in use case.
- Scenario vs Requirement: Scenario is user-facing acceptance text. Requirement is implementation-facing and may reference scenarios but must not replace scenario text.
- Requirement vs Component: Requirement says what must be true. Component says who implements it. Keep requirements independent of component design where possible; map via references.
- Component vs Scenario: Component documents implementation boundaries and which scenarios it supports. Do not write Gherkin in component documentation.
- Test Review vs Scenario/Requirement: Reviews check fidelity. They must not define behavior.

Decision table: When to put content where
- User intent, readable by humans and product owners -> Journey or Persona
- Executable acceptance criteria -> Scenario (.feature)
- Implementation contract, tests -> Requirement (.yml)
- Mapping from user intent to scenarios -> Use Case (.yml)
- Implementation notes, API surface -> Component docs
- Test-to-scenario verification -> Test Review

Concept boundary examples (short)
- Scenario->Requirement boundary: A scenario says "Then I see my task in the list". The requirement adds "persist in tasks table, return 201, eventual consistency within 2s".
- Use Case->Scenario boundary: Use case "Capture Task" lists scenarios [mobile_widget, voice_input]; it does not include the Given/When/Then content.

Change management note
- If a scenario edit changes user-observable steps, update related use cases and requirements to avoid contradiction. Tooling should flag stale tests and stale requirements.

Appendix: Examples matrix
- For each concept, one positive and one negative example (see above within each section).

Contact: Update this file via normal PR process. If you need to relax a rule, propose a spec change under specs/changes/ referencing affected artifacts.


