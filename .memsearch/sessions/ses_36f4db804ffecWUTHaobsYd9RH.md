# Document explicit coverage gap in use-case yaml (@Sisyphus-Junior subagent)

**ID**: ses_36f4db804ffecWUTHaobsYd9RH
**Project ID**: ad761ea6174e58ed763fc75290c3f403ed51079d
**Created**: 2/24/2026, 11:28:48 AM
**Stats**: 1 files changed, +6 -0

---

## USER (11:28:49 AM)

id: capture_task
name: Capture Task
summary: Record tasks with minimal friction
actor: team_member
goals:
  - Capture in <30s
  - Works from any context
scenarios: []  # Will fill in after creating scenarios

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


