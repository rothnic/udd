# E2E Journey Composition

This document defines how to compose journey-level end-to-end (E2E) tests from capability scenarios and lightweight orchestration glue. Journey E2E tests verify that a user can complete an outcome that spans multiple capabilities while keeping step definitions DRY and maintainable.

## Composition pattern

Journey E2E = capability scenario steps + journey orchestration glue

- Capability scenario steps: reuse existing step definitions that implement the domain actions (happy path and relevant variations). These live next to feature files in specs/ and tests/ implementations.
- Journey orchestration glue: small, journey-specific steps that arrange capabilities in sequence, pass context between steps, and assert end-to-end success criteria.

Keep orchestration glue minimal. If orchestration steps grow beyond coordinating calls and mapping context, extract a new capability scenario instead.

## Reuse vs new step definitions

When composing a journey, decide for each required behavior whether to reuse an existing step definition or create a new one.

- Reuse existing step definitions when:
  - The step expresses a single capability or domain action already covered by a capability feature.
  - The step maps directly to an implementation-backed helper (API client, page object, test utility).
  - The step is stable across journeys and has no journey-specific side effects.

- Create new journey step definitions when:
  - The step is orchestration only: it sequences capabilities, maps data between them, or asserts cross-capability success criteria.
  - It would otherwise duplicate condition handling that is unique to this journey.
  - It is a short adapter that composes multiple capability steps into one readable Gherkin line.

Rule of thumb: prefer reuse for capability behavior, prefer new small glue steps for orchestration.

## Worked example

Journey: "New user completes onboarding and creates first item"

Specs referenced:
- specs/auth/signup.feature  (capability: signup)
- specs/tasks/create.feature (capability: create task)

Journey feature (high level):

"""
# Journey: New user onboarding

Scenario: Onboard and create first task
  Given a fresh browser session
  When the user signs up with valid email and password
  And the user completes onboarding prompts
  And the user creates a new task titled "Buy milk"
  Then the task list contains "Buy milk"
"""

Implementation notes:
- Reuse the step implementations from the signup and create task capabilities: Given/When/Then from their respective feature step files.
- Add a small orchestration step `And the user completes onboarding prompts` that sequences a few capability-level steps or UI interactions, but does not reimplement signup or task creation logic.

## Journey orchestration example (pseudo-code)

// orchestration step implementation
function completeOnboardingPrompts(context) {
  // reuse page objects and helpers
  await onboardingPage.skipOptionalTours();
  await onboardingPage.setPreferences({ theme: 'light' });
  // stash values on context for downstream steps
  context.userPreferences = { theme: 'light' };
}

The orchestration glue should call into the same helpers used by capability tests so behavior remains consistent.

## Anti-duplication rules

1. Do not copy-paste capability step implementations into a journey. Always point to existing step definitions when the intent matches.
2. Do not create journey steps that duplicate domain logic. If a journey step requires substantial domain logic, move that logic into a capability step and reuse it in both the capability feature and the journey.
3. Keep journey step definitions thin. If a journey step becomes more than a few lines of orchestration logic, split responsibilities: extract domain logic to capability helpers, keep orchestration to sequencing and context mapping.
4. Name journey steps for readability, not reusability. Use plain, descriptive Gherkin lines that read like the user journey.
5. Tests must avoid duplicating assertions already covered by capability scenarios. Journey tests assert the cross-capability outcome and any end-to-end invariants only.

## When to create a new capability instead

- If two or more journeys need the same orchestration behavior, promote that orchestration into a capability feature with explicit scenarios and reusable steps.
- If orchestration contains branching business logic (many conditional branches), it likely belongs in a capability test with focused scenarios.

## References

- docs/architecture/canonical-derivation-model.md
- .sisyphus/evidence/phase2/task-12-compose.md
- .sisyphus/evidence/phase2/task-12-dup-assert.md

---

Notes
- Keep journey features focused on user outcomes. Use capability features for detailed behavior and edge cases.
- Update step registries or step index documentation if you add reusable capability steps so they are discoverable by other authors.
