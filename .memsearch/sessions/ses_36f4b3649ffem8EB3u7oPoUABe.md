# Update use case with scenario references list (@Sisyphus-Junior subagent)

**ID**: ses_36f4b3649ffem8EB3u7oPoUABe
**Project ID**: ad761ea6174e58ed763fc75290c3f403ed51079d
**Created**: 2/24/2026, 11:31:33 AM
**Stats**: 1 files changed, +5 -1

---

## USER (11:31:33 AM)

id: capture_task
name: Capture Task
summary: Record tasks with minimal friction
actor: team_member
goals:
  - Capture in <30s
  - Works from any context
scenarios:
  - mobile_widget
  - voice_input
  - desktop_shortcut
  - offline_sync

# Manual mapping from goals to scenario slugs
manual_mapping:
  "Capture in <30s":
    - mobile_widget
    - voice_input
    - desktop_shortcut
  "Works offline":
    - offline_sync  # Deferred to Phase 2

# Explicit coverage gaps discovered during planning
coverage_gaps:
  - goal: "Works offline"
    status: "none"
    note: "Deferred to Phase 2"


