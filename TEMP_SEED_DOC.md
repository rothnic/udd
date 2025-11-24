# UDD Spec System – Core Requirements for Implementation

This document is intended to be handed to a **coding agent** (or human dev) to implement the initial version of the User Driven Development (UDD) spec system.

The goals:

* Make **user-facing scenarios** the single source of truth for behavior.
* Keep everything **simple, discoverable, and deterministic** for agents.
* Avoid duplicate specs and giant markdown piles.
* Ensure a **feature is only considered done when its E2E tests pass**.

---

## 1. High-Level Objectives

1. Implement a small, opinionated spec system around this structure:

   * **Vision**: markdown with frontmatter.
   * **Use cases**: small YAML files.
   * **Features**: one feature directory per `<area>/<feature>`, with metadata YAML and Gherkin scenarios.
   * **Technical requirements**: YAML files.
   * **Scenarios**: Gherkin `.feature` files (one Scenario per file).
   * **Tests**: E2E and technical tests, mapped via predictable paths.

2. Provide a simple CLI (e.g. `udd`) to:

   * Validate spec structure and relationships.
   * Summarize current status (what’s passing / failing / missing).
   * Help generate stubs (E2E tests, requirement files) from existing specs.

3. Make it trivial for an agent to:

   * Discover **which features exist**.
   * See **which scenarios** exist for each feature.
   * Know **which tests** correspond to which scenarios/requirements.
   * Decide **what to work on next** without needing prior chat context.

4. Enforce **guardrails** so coding agents don’t “cheat” by weakening tests or rewriting specs to get green.

---

## 2. Core Concerns to Respect

The implementation **must** be designed to address these concerns:

1. **Spec is the source of truth, not tasks or code**

   * All behavioral expectations come from **Gherkin scenarios** and structured spec files.
   * Tasks / TODOs are advisory; only spec + tests define "done".

2. **User-Driven Development first, TDD second**

   * User expectations are expressed as Gherkin scenarios.
   * Technical requirements and tests are derived from those scenarios.

3. **No duplicate behavior descriptions**

   * Scenario text (Given/When/Then) must live **only** in `.feature` files.
   * Use cases and requirements **reference** scenarios by path/slug, they do not restate them.

4. **Natural naming, no opaque IDs**

   * Use `area/feature/slug` for scenarios; e.g. `todos/basic/add_todo_with_title`.
   * Use human-readable requirement keys like `store_new_todo`, not `R-123`.

5. **Lots of use cases, no giant markdown files**

   * One small YAML file per use case (e.g. `specs/use-cases/capture_quick_todo.yml`).
   * No single 3000-line `use_cases.md`.

6. **Phasing and extension of features**

   * Support multiple features under the same area (e.g. `todos/basic`, `todos/recurring`).
   * Allow features to be marked with `phase` and `kind` (`core`, `extension`, `experimental`).
   * Keep a simple way to track spec changes over time without bloated docs.

7. **Traceability with low ceremony**

   * It must be easy to trace:

     * Vision → Use cases → Scenarios → Requirements → Tests → Code.
   * Without lots of hand-maintained cross-reference tables.

8. **Agent resilience (stateless understanding)**

   * A new agent must be able to reconstruct current state **only** from the repo:

     * `specs/**`, `tests/**`, and an optional generated status file.

9. **Guardrails against spec/test tampering**

   * Coding agents should not weaken tests or scenarios to get green.
   * Spec changes must be explicit and traceable.

---

## 3. Data Models to Implement

All of this should be implemented in TypeScript types or schemas (e.g. with Zod) so the CLI can validate files.

### 3.1 Vision – `specs/VISION.md`

* Markdown with YAML frontmatter.

**Frontmatter schema:**

```ts
interface VisionFrontmatter {
  id: string;             // "todo_app"
  name: string;           // "Todo System"
  version?: string;
  goals: string[];
  success_metrics?: string[];
  use_cases: string[];    // list of use case ids, e.g. ["capture_quick_todo"]
}
```

Example body can be freeform narrative.

### 3.2 Use Case – `specs/use-cases/<id>.yml`

One file per use case, pure YAML. No Gherkin.

```ts
interface UseCaseSpec {
  id: string;            // "capture_quick_todo"
  name: string;          // "Capture a quick todo"
  summary: string;
  actors?: string[];     // e.g. ["end_user"]
  outcomes?: string[];
  scenarios: string[];   // scenario paths, e.g. ["todos/basic/add_todo_with_title"]
  phase?: number;        // optional: 1, 2, ...
  status?: "planned" | "in_progress" | "done";
}
```

### 3.3 Feature metadata – `specs/features/<area>/<feature>/_feature.yml`

```ts
interface FeatureSpec {
  id: string;                  // "todos/basic"
  area: string;                // "todos"
  name: string;                // "Basic todos"
  summary: string;
  use_cases?: string[];        // use case ids, e.g. ["capture_quick_todo"]
  phase?: number;              // e.g. 1, 2
  kind?: "core" | "extension" | "experimental";
  status?: "planned" | "in_progress" | "done";
}
```

### 3.4 Scenario – `specs/features/<area>/<feature>/<slug>.feature`

* Plain Gherkin.
* One `Scenario` per file.
* Identity of a scenario = `<area>/<feature>/<slug>`.

Example path and content:

```text
specs/features/todos/basic/add_todo_with_title.feature
```

```gherkin
Feature: Basic todo management

  Scenario: Add todo with title
    Given I am on my todo list
    When I add a todo titled "Buy milk"
    Then I see "Buy milk" in the list
    And it is not marked as completed
```

### 3.5 Technical Requirement – `specs/requirements/<key>.yml`

```ts
type RequirementType = "functional" | "non_functional";

interface TechnicalRequirement {
  key: string;                 // "store_new_todo"
  type: RequirementType;
  feature: string;             // "todos/basic"
  use_cases?: string[];        // e.g. ["capture_quick_todo"]
  scenarios: string[];         // scenario slugs within the feature, e.g. ["add_todo_with_title"]
  description: string;
  notes?: string[];
  status?: "draft" | "implemented" | "verified";
}
```

### 3.6 Spec Change Record – `specs/changes/<change_id>.yml`

```ts
interface SpecChange {
  id: string;                  // "todos_duplicates_warning"
  date: string;                // ISO date: "2025-11-23"
  feature: string;             // "todos/basic"
  reason: string;              // short paragraph
  scenarios?: {
    added?: string[];          // full scenario paths
    updated?: string[];
    removed?: string[];
  };
  requirements?: {
    added?: string[];          // requirement keys
    updated?: string[];
    removed?: string[];
  };
}
```

### 3.7 Project Status – `PROJECT_STATUS.yml` (generated)

Preferably generated, not hand-edited.

```ts
interface ScenarioStatus { e2e: "missing" | "failing" | "passing"; }
interface RequirementStatus { tests: "missing" | "failing" | "passing"; }

interface FeatureStatus {
  scenarios: Record<string, ScenarioStatus>;    // slug -> status
  requirements: Record<string, RequirementStatus>; // key -> status
}

interface ProjectStatus {
  active_features: string[];                    // ["todos/basic"]
  features: Record<string, FeatureStatus>;      // feature id -> status
}
```

Example YAML:

```yaml
active_features:
  - todos/basic

features:
  todos/basic:
    scenarios:
      add_todo_with_title:
        e2e: passing
      complete_todo:
        e2e: missing
    requirements:
      store_new_todo:
        tests: passing
      default_completed_false:
        tests: missing
```

---

## 4. Repo Layout Requirements

The coding agent should enforce this layout and add validation to keep it consistent:

```text
specs/
  VISION.md
  use-cases/
    *.yml

  features/
    <area>/
      <feature>/
        _feature.yml
        <scenario_slug>.feature

  requirements/
    <requirement_key>.yml

  changes/
    <change_id>.yml

PROJECT_STATUS.yml          # optional, generated


tests/
  e2e/
    <area>/
      <feature>/
        <scenario_slug>.e2e.test.ts

  unit/   (or integration/)
    <domain>/
      <requirement_key>.test.ts
```

Key invariants:

* Every scenario file under `specs/features/<area>/<feature>/` corresponds to at most one scenario (one Scenario block).
* Every scenario should have a matching E2E test file under `tests/e2e/<area>/<feature>/` with the same `<slug>`.
* Every requirement `feature` + `scenarios` entry must resolve to an existing feature directory and scenario file.

---

## 5. CLI / Tooling Requirements

Implement a small CLI (call it `udd`) to support core workflows.

### 5.1 `udd lint`

Purpose: **validate structure and references**.

Checks:

* Vision frontmatter matches `VisionFrontmatter` schema.
* Every `specs/use-cases/*.yml` matches `UseCaseSpec` schema and each `scenarios` entry points to an existing `.feature` file.
* Every `specs/features/**/_feature.yml` matches `FeatureSpec` schema.
* Every `specs/requirements/*.yml` matches `TechnicalRequirement` schema and each scenario slug resolves to an existing scenario file.
* Each scenario file has exactly one `Scenario` block.
* Each scenario file has (optionally) a corresponding E2E test file; if missing, it gets flagged.

### 5.2 `udd status` and `udd status --json`

Purpose: **summarize current test-based status**.

Behavior:

* Scan all scenario files and E2E test files.
* Run tests (or read a test result cache) to determine:

  * For each scenario: `e2e: missing | failing | passing`.
  * For each requirement: `tests: missing | failing | passing`.
* Print a human-readable summary.
* With `--json`, output the `ProjectStatus` structure.
* Optionally `--write` can dump `PROJECT_STATUS.yml` for humans.

### 5.3 `udd new` helpers (stretch goal)

Not required for v1, but recommended:

* `udd new use-case <id>`: create a new use case YAML stub.
* `udd new feature <area> <feature>`: create `_feature.yml` stub and directories.
* `udd new scenario <area> <feature> <slug>`: create empty `.feature` file.
* `udd new requirement <key>`: create requirement YAML stub.

These commands should:

* Respect naming conventions.
* Prevent name collisions.

---

## 6. Testing / E2E Integration

We want to integrate Gherkin feature files with a test runner in a way that’s:

* Familiar (TypeScript + Vitest is ideal).
* Easy for agents to work with.

### 6.1 Recommended libs

1. **Vitest**

   * Test runner, similar to Jest, integrates well with TypeScript.
   * Good DX for both unit and E2E-like tests.

2. **`@amiceli/vitest-cucumber` or similar Gherkin adapter**

   * Maps `.feature` files to Vitest tests.
   * Lets us keep Gherkin as the behavior spec and execute it directly.

3. **Playwright or similar for browser E2E** (if we’re testing a UI)

   * Headless or headed-mode browser automation.
   * The E2E tests can wrap Playwright helpers:

     * `openTodoPage()`, `addTodo()`, `getTodoState()` etc.

4. **`yaml` npm package**

   * For reading and writing YAML specs (`use-cases`, `requirements`, `changes`, `PROJECT_STATUS.yml`).

5. **Zod (or similar)**

   * To define schemas for `VisionFrontmatter`, `UseCaseSpec`, `FeatureSpec`, `TechnicalRequirement`, `SpecChange`, `ProjectStatus`.
   * Enables strong validation in `udd lint` and `udd status`.

6. **CLI framework (e.g. `oclif` or `commander`)**

   * For a structured `udd` CLI.
   * `oclif` is a good fit if we want a more extensible CLI with subcommands.

### 6.2 How `.feature` becomes a failing E2E test

Implementation expectations:

* E2E test file imports feature:

  * `loadFeature("specs/features/todos/basic/add_todo_with_title.feature")`.
* Uses the Gherkin adapter to map `Scenario` steps to code.
* When steps are unimplemented, the test fails (expected Red phase).
* Once steps are implemented but app doesn’t behave correctly, tests still fail.
* Only when the app behavior matches the scenario do the tests go green.

This enforces:

* UDD: scenario → spec.
* TDD: spec → failing test → implementation → passing test.

---

## 7. Guardrails and Agent Rules (Implementation-Side)

We need to encode **who can edit what** to prevent cheating.

### 7.1 File ownership conventions

* **Spec Agent / Human Spec Owner**:

  * Allowed to edit:

    * `specs/VISION.md`
    * `specs/use-cases/*.yml`
    * `specs/features/**/_feature.yml`
    * `specs/features/**/*.feature`
    * `specs/changes/*.yml`
  * Not allowed to implement code or tests (except maybe test stubs).

* **Implementation Agent / Dev**:

  * Allowed to edit:

    * `specs/requirements/*.yml` (under spec owner direction)
    * `tests/**`
    * `src/**` (or equivalent code dirs)
  * Must **not** edit:

    * Gherkin `.feature` files
    * Use case YAML
    * Vision

### 7.2 Definition of Done (enforced by tooling)

The CLI and checks should enforce:

* A scenario is considered **done** only when:

  * Its `.feature` file exists.
  * Its corresponding E2E test exists.
  * That E2E test passes.

* A feature is **done** only when:

  * All scenarios under `specs/features/<area>/<feature>/` meet the scenario done criteria.
  * All required technical requirements have tests that pass.

The CLI should make it obvious which scenarios/features are not done, regardless of any task lists.

---

## 8. Implementation Priorities

1. **Define TypeScript types + Zod schemas** for all models:

   * VisionFrontmatter
   * UseCaseSpec
   * FeatureSpec
   * TechnicalRequirement
   * SpecChange
   * ProjectStatus

2. **Implement the `udd` CLI** (likely TypeScript + oclif or commander):

   * `udd lint`
   * `udd status` / `udd status --json` / `udd status --write`

3. **Wire up Vitest + Gherkin adapter**:

   * Provide a sample E2E test for one scenario.
   * Document the pattern so agents can replicate it.

4. **Add a couple of example specs** (e.g. `todos/basic`) to validate the system end-to-end.

5. **(Optional but useful) Add a status badge or simple HTML report** that can be generated from `udd status --json`.

---

This is the contract for the coding agent: implement the data models, CLI, and test wiring in a way that satisfies these requirements and respects the concerns above. All further behavior (e.g. additional commands) should be consistent with these models rather than inventing new ad-hoc structures.
