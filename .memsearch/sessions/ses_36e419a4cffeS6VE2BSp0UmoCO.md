# Create requirement YAML template file (@Sisyphus-Junior subagent)

**ID**: ses_36e419a4cffeS6VE2BSp0UmoCO
**Project ID**: ad761ea6174e58ed763fc75290c3f403ed51079d
**Created**: 2/24/2026, 4:21:40 PM
**Stats**: 1 files changed, +20 -0

---

## USER (4:21:40 PM)

# Technical requirement template matching TechnicalRequirementSchema
# Fields: key, type (functional|non_functional), feature, scenarios, description
# Optional: use_cases, notes

key: "<your_requirement_key>"
type: "non_functional" # functional | non_functional
feature: "area/feature_name" # relative feature namespace
scenarios:
  - "scenario_slug_1"
  - "scenario_slug_2"
description: |
  Short, precise statement of the requirement. Include measurable targets when applicable.

# Optional linkage to related use case files (paths)
use_cases:
  - "specs/use-cases/example_use_case.yml"

# Optional freeform notes array
notes:
  - "Optional note about scope, exclusions, or measurement boundaries."


