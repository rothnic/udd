# Add manual goal-to-scenario mapping section (@Sisyphus-Junior subagent)

**ID**: ses_36f503cc5ffek5pccGWnhkgc1h
**Project ID**: ad761ea6174e58ed763fc75290c3f403ed51079d
**Created**: 2/24/2026, 11:26:03 AM
**Stats**: 1 files changed, +9 -0

---

## USER (11:26:04 AM)

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


