# Create use-case YAML template file (@Sisyphus-Junior subagent)

**ID**: ses_36e9f42f6ffeATCTmSckU5wrcy
**Project ID**: ad761ea6174e58ed763fc75290c3f403ed51079d
**Created**: 2/24/2026, 2:39:22 PM
**Stats**: 1 files changed, +60 -0

---

## USER (2:39:22 PM)

id: "<id_or_key>" # unique use-case id, e.g. capture_task
name: "<Short Name>" # human readable name
summary: "<One-line summary of the use case>"
actor: "<primary_actor>" # e.g. team_member, admin, end_user

# Goals: list of measurable goals for this use case
goals:
  - "<goal-1>"
  - "<goal-2>"

# Scenarios: canonical scenario slugs that exercise the use case
scenarios:
  - "<scenario_slug_1>"
  - "<scenario_slug_2>"

# Manual mapping from goals to scenario slugs (optional)
manual_mapping:
  "<goal-1>":
    - "<scenario_slug_1>"

# Coverage analysis: automated or manual summary
coverage_check:
  # Map goal -> has_scenarios boolean
  "<goal-1>":
    has_scenarios: false
  summary: "not_all_goals_covered" # one of: all_covered, partial, none

# Coverage gaps (explicitly documented)
coverage_gaps:
  - goal: "<goal-with-gap>"
    status: "none" # none, partial, planned
    note: "<short note why gap exists or plan>"

# Adequacy / review metadata
adequacy_review:
  question: "Do scenarios adequately cover the use case?"
  verdict: "<yes|partial|no>"
  reviewer: "<reviewer_name_or_id>" # optional
  date: "<YYYY-MM-DD>" # optional
  reason: "<short reason for verdict>"

# Traceability / metadata useful for automation
metadata:
  phase: <number> # numeric phase, optional
  related_features: [] # list of feature ids
  created: "<YYYY-MM-DD>"
  updated: "<YYYY-MM-DD>"

# Optional: explicit outcomes structure compatible with src/types.ts UseCaseSpec
outcomes:
  - description: "<outcome description>"
    scenarios:
      - "<scenario_slug_1>"

# Adequacy review history (free form notes)
review_notes:
  - date: "<YYYY-MM-DD>"
    note: "<brief note about review or decision>"

# End of template


