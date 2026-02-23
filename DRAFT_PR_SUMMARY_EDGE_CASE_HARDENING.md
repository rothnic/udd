## Summary of Edge Case Hardening Work (Draft PR)

This draft summarizes the edge-case-hardening work completed against the udd CLI and supporting agents.

What changed
- Added shared CLI error utilities and test helpers
- Hardened init/sync/status commands for partial/corrupted state
- Implemented `udd status --doctor` with 8 focused diagnostics
- Added comprehensive E2E tests and feature files to cover corrupted manifests, unreadable journeys, orphan detection, and partial state
- Added validator improvements to detect orphaned scenarios at lint time

Files of interest
- src/lib/cli-error.ts — shared error helpers
- src/commands/status.ts — doctor mode + recommendations
- src/commands/sync.ts — manifest validation and stale refs
- src/lib/validator.ts — improved validation & orphan detection
- specs/features/udd/cli/*_edge_cases.feature — new edge-case scenarios
- specs/use-cases/edge_case_hardening.yml — new use case linking edge scenarios

Verification performed
- npx tsc --noEmit ✓
- ./bin/udd lint ✓ (no structural errors; orphaned scenarios previously reported are now linked)
- npx vitest run ✓ (all tests passing in previous run)

Next steps (proposed)
- Push these commits and open PR against origin/master
- Request review focusing on: validator changes (orphan detection) and doctor-mode messaging
- Optionally separate the validator orphan-detection into a non-blocking warning if teams prefer not to fail lint on orphans

---
Please review and tell me if you want this split into smaller commits or a different PR title/body.
