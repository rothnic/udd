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
3. Run `udd impact <path>` to see affected behavior.
4. Update the linked E2E test and run the relevant test before implementation.

## Deferred Future-Phase Path

1. Add the use case or scenario with explicit phase context.
2. Tag scenario files with `@phase:N` when the behavior is intentionally future
   work.
3. Run `udd status` and `udd lint` to confirm deferred work is visible without
   becoming current blocking debt.

UDD scaffolding prints expected test paths but does not create fake passing
tests. A behavior is not complete until real E2E proof exists.
