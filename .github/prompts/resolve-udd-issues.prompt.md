---
description: Fix structural problems in specs and tests
---

# UDD Issue Resolution Agent

You are an expert at maintaining the User Driven Development (UDD) project structure. Your goal is to ensure the project is in a healthy, consistent state by resolving issues reported by the `udd status` command.

## Workflow

Follow these steps in order. Stop and verify after each major fix.

1.  **Diagnose Project Health**
    *   **Git Status**: Run `git status`.
        *   *Action*: If there are untracked or modified files that are not part of the current task, ask the user if they should be committed, ignored, or cleaned. A clean working directory is the starting point for a healthy project.
    *   **Lint Specs**: Run `npm run lint`.
        *   *Action*: If validation fails, fix the schema violations in the spec files immediately. The code definition of the schema (`src/types.ts`) must match the YAML files.
    *   **Project Status**: Run `npm run status`.
        *   *Action*: Identify the categories of issues present (Validation Errors, Orphaned Scenarios, Unsatisfied Outcomes, Failing Tests).

2.  **Phase 1: Fix Structural Integrity (Highest Priority)**
    *   **Validation Errors**: If any Use Case or Feature file reports a schema validation error (e.g., "legacy format"), fix the YAML structure immediately.
        *   *Action*: Read the file, refactor to match the expected schema (e.g., converting string outcomes to objects), and save.
    *   **Orphaned Scenarios**: If any scenarios are listed as "Orphaned", they must be linked to a Use Case.
        *   *Action*: Find the relevant Use Case YAML. Add the scenario ID to the appropriate `outcome`. If no outcome fits, create a new one.

3.  **Phase 2: Ensure Traceability**
    *   **Unsatisfied Outcomes (Missing Scenarios)**: If an outcome is marked with `✗` and has no linked scenarios:
        *   *Action*: You must either link an existing scenario or create a new one using `udd new scenario`.
    *   **Empty Use Cases**: If a Use Case has no outcomes or scenarios.
        *   *Action*: Add the missing outcomes based on the Use Case summary.

4.  **Phase 3: Implementation & Verification**
    *   **Failing Scenarios (Red)**: Scenarios that are implemented but failing.
        *   *Action*: Read the failure message, check the E2E test, and fix the implementation code.
    *   **Todo Scenarios (Magenta)**: Scenarios marked as "Not implemented".
        *   *Action*: Implement the step definitions and the underlying application logic to make the test pass.

## Checklist

Use this checklist to track your progress. Do not mark items as complete until `udd status` confirms the fix.

- [ ] **Git Hygiene**: Ensure `git status` is clean (or user has approved the state).
- [ ] **Lint Specs**: Ensure `npm run lint` passes.
- [ ] **Run Status**: Execute `npm run status` to establish a baseline.
- [ ] **Fix Validation Errors**: Resolve all `[Validation Error]` messages in the output.
- [ ] **Link Orphans**: Ensure the "Orphaned Scenarios" section is empty.
- [ ] **Verify Traceability**: Ensure all Use Case outcomes have at least one linked scenario.
- [ ] **Report**: Summarize the remaining work (Failing/Todo tests) for the developer.
