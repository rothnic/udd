# Source-of-Truth Authoring Workbench

UDD authoring starts from the canonical chain:

```text
Objective -> Use Case -> Scenario -> E2E Test
```

Journey and SysML-informed notes are optional discovery context. They can help
explain alternatives considered, actors, and edge cases, but they are not a
second requirements layer.

## New Feature Path

1. Create or identify the roadmap objective or capability.
2. Run `udd new use-case <id> --name "<name>" --summary "<outcome>"`.
3. Link the use case from `specs/roadmap.yml` or `specs/VISION.md`.
4. Run `udd new scenario <area> <feature> <slug> --use-case <id>`.
5. Implement the printed E2E test obligation with user-observable assertions.

## Changed Behavior Path

1. Update the existing use-case outcome first.
2. Update or add exactly one focused scenario file under `specs/features/**`.
3. Run `udd impact <path> --json` to see affected objectives, use cases,
   scenarios, tests, regression markers, and recommended verification commands.
4. Update the linked E2E test and run the recommended command before
   implementation.

## Deferred Future-Phase Path

1. Add the use case or scenario with explicit phase context.
2. Tag scenario files with `@phase:N` when the behavior is intentionally future
   work.
3. Run `udd status` and `udd lint` to confirm deferred work is visible without
   becoming current blocking debt.

UDD scaffolding prints expected test paths but does not create fake passing
tests. A behavior is not complete until real E2E proof exists.

## Migration Notes

Current source-of-truth linkage coverage is 18 of 19 use cases. The one
exception is `specs/use-cases/strategic_program_execution.yml`, which is a
program-level proof use case created to verify Goals 007-012 rather than a
normal product capability. Keep it as a documented exception until the roadmap
grows a dedicated program governance capability or the strategic-program proof
is retired.

For existing artifacts that do not fit the normal authoring path, prefer one of
these decisions before editing behavior:

1. Link the use case to a roadmap capability when it represents current product
   behavior.
2. Mark the use case or scenario as future-phase work when it is planned but not
   current scope.
3. Record a migration exception with the exact file path and the reason it is
   not linked yet.
