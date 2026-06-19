# UDD Spec Authoring Model

UDD keeps the enforced contract small:

```text
Objective -> Use Case -> Scenario -> E2E Test
```

Journey files and SysML notes are discovery aids. They are useful when a human
or agent needs narrative context, but behavior is not enforceable until it is
promoted into a use case outcome, a Gherkin scenario, and executable proof.

## Artifact Roles

| Artifact | Question it answers | When to edit it |
| --- | --- | --- |
| Objective | Why are we doing this work now? | A goal file or issue changes scope, proof, or priority. |
| Roadmap phase | When does this capability belong? | Phase, increment, or capability ownership changes. |
| Journey | What path is the user trying to complete? | Discovery needs actor context, alternatives, or cross-feature narrative. |
| Use case | What user-visible outcome must be true? | An outcome becomes part of the product contract. |
| Feature scenario | What observable behavior proves the outcome? | A behavior, variant, rule, edge case, or error state becomes testable. |
| E2E test | Does the behavior actually work? | A scenario needs executable proof in the current implementation. |

`specs/features/**/*.feature` uses the word "feature" because it is standard
Gherkin terminology. In UDD, a feature file is a behavior-contract container; it
does not have to map one-to-one to a product roadmap feature.

## Docs vs Specs

Docs explain the model, show examples, capture rationale, and help humans or
agents choose the right workflow. Docs are not the enforced product behavior
contract.

Use specs for language-agnostic product intent:

```text
specs/VISION.md                 stable purpose and boundaries
specs/roadmap.yml               phases and capability sequencing
specs/use-cases/*.yml           user-visible outcomes
specs/features/**/*.feature     behavior contracts in Gherkin
```

Use docs when the material is guidance rather than behavior:

```text
README.md                       quick orientation
docs/getting-started.md         setup walkthrough
docs/spec-authoring-model.md    authoring rules and tradeoffs
docs/project/reviews/**         dated review and evidence artifacts
```

If a statement in docs changes what the product should do, promote it into a use
case and scenario before implementation. If it only explains how to work with
the repo, keep it in docs.

## Dogfooding UDD

This repository should use UDD the way an end user would:

1. Start with one objective in `goals/` or a GitHub issue.
2. Use `specs/roadmap.yml` to place the work in a phase, capability, and
   increment. Do not use the roadmap as the narrative objective.
3. Update or add a use case outcome in `specs/use-cases/`.
4. Update or add a Gherkin behavior contract in `specs/features/`.
5. Add or update the E2E proof under `tests/e2e/`.
6. Implement only enough code to satisfy the scenario.
7. Run status, lint, tests, trace, and governance gates.

The repo currently dogfoods this pattern for CLI setup, status, linting,
recovery, test governance, agent integration, release-candidate gates, and the
reference rebuild proof. For example, package install behavior is defined in
`specs/use-cases/project_setup.yml`, described in
`specs/features/udd/cli/setup.feature`, and proved by
`tests/e2e/udd/cli/setup.e2e.test.ts`.

Docs can support those specs, but they should not be the only place where a
behavior is promised.

## Enforcement Gates

Current enforcement is intentionally mechanical:

```bash
./bin/udd lint
./bin/udd status --json
./bin/udd trace --json
./bin/udd test-scan --json
./bin/udd gate test-governance --strict --json
npm test -- --run
```

PR #90 also adds a hosted production-readiness workflow that runs release
candidate gates in CI, including lint, doctor, repair dry-run, trace, impact,
strict test governance, install smokes, full tests, status evidence, and agent
evidence.

These gates enforce that current behavior is linked and tested. They do not yet
fully enforce every authoring principle in this document. Known gaps include:

- docs can still contain behavioral claims unless reviewers promote them into
  specs,
- only `@phase:N` before `Feature:` is interpreted as phase ownership,
- non-TypeScript proof adapters are not implemented,
- Gherkin tags other than `@phase:N` are not first-class status dimensions,
- journey drift is advisory unless promoted into use cases and scenarios.

Those gaps are future UDD work, not reasons to put behavior only in docs.

## SysML-Informed Design Flow

UDD should stay lighter than full SysML, but its design order should mirror the
useful MBSE logic:

```text
Domain model -> Journey -> Use case -> Functional flow -> Scenario -> Sequence -> E2E proof
```

Use that chain this way:

- Domain model: name the system boundary, external actors, internal actors,
  major blocks/components, and key information objects.
- Journey: capture the actor's end-to-end narrative and context. This is
  discovery context, not the enforceable contract.
- Use case: name the user-visible functionality at the system boundary and the
  outcome the actor gets from the system.
- Functional flow: describe the network of decisions, alternate paths, errors,
  and handoffs that can occur while satisfying the use case.
- Scenario: select one concrete path through that flow and express it as
  Gherkin acceptance behavior.
- Sequence: when ordering or collaboration matters, detail the specific message
  exchange among actors, system parts, and external services for that scenario.
- E2E proof: verify the scenario from the stakeholder perspective.

In SysML terms, this maps approximately to blocks/actors for structure, use case
diagrams for high-level functionality, activity diagrams for flows of control
and data, sequence diagrams for a specific collaboration over time, and
allocation links from behavior back to the components that perform it.

## How Detail Scales

Start broad only long enough to orient the work. Add detail by creating focused
scenario files when a variant becomes product behavior.

For example, an onboarding journey may begin as:

```markdown
1. User signs up -> `specs/features/onboarding/first_action.feature`
```

That is discovery context. As the product becomes concrete, promote specific
behaviors into separate scenarios:

```text
specs/use-cases/new_user_onboarding.yml
specs/features/auth/signup/email_password.feature
specs/features/auth/signup/email_verification.feature
specs/features/auth/signup/social_google.feature
specs/features/auth/signup/google_one_tap.feature
tests/e2e/auth/signup/email_password.e2e.test.ts
tests/e2e/auth/signup/email_verification.e2e.test.ts
tests/e2e/auth/signup/social_google.e2e.test.ts
tests/e2e/auth/signup/google_one_tap.e2e.test.ts
```

The use case links the outcomes to those scenario ids:

```yaml
id: new_user_onboarding
name: New User Onboarding
phase: 1
outcomes:
  - description: User can create an account with email and password.
    scenario_paths:
      - auth/signup/email_password
  - description: User can verify ownership of the signup email.
    scenario_paths:
      - auth/signup/email_verification
  - description: User can create an account with Google social sign-in.
    scenario_paths:
      - auth/signup/social_google
```

Do not keep adding hidden detail to a high-level scenario until it becomes a
mini-spec for the entire feature area. Split when one of these changes:

- a new actor, channel, provider, or permission model appears,
- success behavior differs by variant,
- error handling differs enough to require separate proof,
- phase ownership differs,
- a reviewer would ask "which exact path did this test prove?"

Update an existing scenario when its existing behavior changes. Add a new
scenario when a new variant, rule, edge case, or phase appears.

## Phase Tags

The roadmap phase lives in `specs/roadmap.yml`. Use cases can also carry a
`phase` field for planning context.

Current UDD status and phase checks read `@phase:N` only when the tag appears
before the `Feature:` line in a `.feature` file:

```gherkin
@phase:2
Feature: Google social signup
```

If `N` is greater than the current roadmap phase, UDD reports the scenario as
deferred instead of current blocking work. Scenario-level phase tags may be
useful for humans, but they are not the current enforcement boundary. Prefer one
scenario file per phase-owned behavior when phase tracking matters.

## Gherkin Usage

UDD uses Gherkin as the behavior-contract language and currently relies on
`@amiceli/vitest-cucumber` for TypeScript/Vitest proof.

Recommended notation:

- `Feature:` names the behavior family.
- `Background:` holds setup shared by multiple scenarios in one file.
- `Scenario:` describes one concrete behavior or variant.
- `Scenario Outline:` and `Examples:` are appropriate for input matrices such
  as supported file types, locales, roles, or limits.
- `Rule:` can group scenarios around one business invariant when the file would
  otherwise be hard to scan.
- Tags such as `@phase:2`, `@security`, or `@performance` can mark planning or
  review concerns.

Current UDD enforcement interprets `@phase:N` and feature/test links. Other
Gherkin features are valuable authoring and test-runner syntax, but UDD does not
yet build first-class status or impact reports from every tag, `Rule`, data
table, or doc string.

## Language Portability

The spec layer is intended to be language-neutral:

```text
specs/VISION.md
specs/roadmap.yml
specs/use-cases/*.yml
specs/features/**/*.feature
```

The current proof layer is TypeScript-specific:

```text
tests/e2e/**/*.e2e.test.ts
@amiceli/vitest-cucumber
vitest run
```

To rebuild the same product in another language, the missing contract is not the
Gherkin spec. The missing contract is a language-adapter layer that can tell UDD:

- which test file proves each scenario,
- which command runs the proof,
- how to read pass/fail results,
- how to map implementation files back to scenarios for impact analysis,
- which generated starter templates belong to that language.

A portable adapter should produce the same core evidence UDD expects today:

```text
scenario id -> proof command -> proof result -> status/trace output
```

Until that adapter exists, non-TypeScript projects can still use the spec files
as the source of truth, but UDD's automated status and packaged starter workflow
are optimized for TypeScript/Vitest.
