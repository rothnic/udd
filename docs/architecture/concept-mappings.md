# UDD Concept Mappings

UDD borrows systems-engineering discipline without adding unnecessary artifact
layers. The mapping below describes how current repository artifacts line up
with the concepts they represent.

## Current Mapping

| UDD concept | Systems-engineering analogue | Current location | Current status |
| --- | --- | --- | --- |
| Vision | System purpose and boundaries | `specs/VISION.md` | Stable source for long-term intent |
| Objective | Planned work item or capability increment | `specs/roadmap.yml`, `goals/*.md`, GitHub issues | Required for scoped work |
| Journey | Concept of operations / discovery narrative | `product/journeys/*.md` | Optional context; dogfooded in this repo |
| Use case | Functional requirement group | `specs/use-cases/*.yml` | Required behavior grouping |
| Scenario | Acceptance criterion | `specs/features/**/*.feature` | Required behavior contract |
| E2E test | Verification case | `tests/e2e/**/*.test.ts` | Required executable proof |
| Component | Implementation ownership surface | `specs/components/*.yml` | Available for focused ownership docs |
| Requirement | Implementation contract | `specs/requirements/*.yml` | Available, but not required for every slice |
| Roadmap phase | Life-cycle increment | `specs/roadmap.yml` | Current phase source of truth |

## Process Alignment

```text
Stakeholder need      -> objective and optional journey context
User-visible outcome  -> use-case outcome
Behavior contract     -> Gherkin scenario
Proof                 -> E2E test
Implementation owner  -> component or requirement when needed
```

The thin current path is intentional. Adding a richer graph is useful only when
it reduces ambiguity for a real change.

## Capability Evolution

Capabilities evolve through `specs/roadmap.yml`. The current active phase is
`opencode-integration`, displayed by `udd phase current` as phase 3:
Agent Integration.

Roadmap entries can distinguish:

- `delivered`: behavior is implemented and has an executable proof.
- `active`: the phase is current.
- `planned` or `future`: useful architecture context, not current behavior.
- `follow_up`: the GitHub issue that owns later work.

Docs must preserve that distinction. For example, recovery diagnostics are
delivered through `udd doctor` and `udd health-check`, while broader recovery
automation remains future work.

## Decision Rules

Create or update a use case when:

- a user-visible outcome changes,
- a scenario needs a new canonical home,
- the roadmap assigns a capability to a different phase or increment.

Create or update a scenario when:

- acceptance behavior changes,
- edge cases become part of the contract,
- a test needs a clearer user-observable assertion.

Use a journey when:

- discovery needs actor, context, alternatives, or workflow narrative,
- SysML-informed questions would improve the scenario,
- a future capability needs narrative context before it is ready to implement.

Use component or requirement artifacts when:

- implementation ownership is ambiguous,
- impact analysis needs a durable implementation link,
- the slice includes validation proving the new link is maintained.

## Naming Guidance

- Use stable snake_case ids for use cases.
- Use path-like scenario ids that match feature locations.
- Keep phase assignment in `specs/roadmap.yml` and scenario `@phase:N` tags.
- Avoid generic planning names such as story, epic, or ticket in trace fields
  when a UDD concept is more precise.
