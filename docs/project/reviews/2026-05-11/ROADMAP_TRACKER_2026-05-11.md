# Goal Gap Roadmap Tracker (2026-05-11)

This tracker converts the prioritized recommendations from `docs/project/reviews/2026-05-11/GOAL_GAP_ASSESSMENT_2026-05-11.md` into explicitly owned, stateful work items.

## Status Legend

- `todo`: planned and not started
- `in_progress`: actively being implemented
- `blocked`: cannot proceed until dependency/decision is resolved
- `done`: completed and merged

## Work Items

| ID | Priority | Item | Status | Owner | Depends On | Exit Criteria |
| --- | --- | --- | --- | --- | --- | --- |
| GG-01 | P0 | Define/enforce canonical traceability graph (objective → use case → scenario → e2e test) | done | engineering | none | `udd lint` fails on broken trace links and unlinked scenarios |
| GG-02 | P0 | Add objective-aware status rollups | todo | engineering | GG-01 | `udd status --json` includes objective health/progress |
| GG-03 | P1 | Unify spec structure or codify dual-mode operation | todo | product+engineering | GG-01 | Canonical mode documented and lint-enforced |
| GG-04 | P1 | Tighten developer/runtime onboarding | in_progress | engineering | none | Documented command path works in CI + local bootstrap |
| GG-05 | P1 | Clarify command generation contracts | todo | docs | GG-03 | Commands have explicit generated outputs and examples |
| GG-06 | P2 | Add management-facing reports | todo | engineering | GG-02 | Machine-readable and markdown planning reports available |

## Update Process

1. Update `Status`, `Owner`, and `Depends On` as work changes.
2. Add links to implementing PRs beside the relevant row when available.
3. Keep this file in sync with status output changes to preserve planning visibility.


## Machine-Readable State

- Canonical roadmap state is tracked in `docs/project/reviews/2026-05-11/ROADMAP_TRACKER_2026-05-11.yml`.
- Keep the YAML and this markdown table synchronized in the same commit whenever status changes.
