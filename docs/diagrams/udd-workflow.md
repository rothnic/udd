# UDD Workflow Diagram

> **Purpose**: This document describes the UDD process flow for diagram generation.
> Pass this to an AI image generation tool to create visual diagrams.

## Diagram 1: UDD File Structure & Relationships

```
PROMPT FOR DIAGRAM GENERATION:

Create a technical architecture diagram showing the UDD (User Driven Development) 
file structure and how components relate to each other.

LAYOUT: Left-to-right flow with three main columns

COLUMN 1 - "Specification Layer" (Blue theme):
┌─────────────────────────────────────┐
│  specs/                             │
│  ├── VISION.md                      │
│  │   └── current_phase, phases      │
│  ├── use-cases/                     │
│  │   └── *.yml (id, outcomes)       │
│  ├── features/                      │
│  │   └── <area>/<feature>/          │
│  │       ├── _feature.yml           │
│  │       └── *.feature (Gherkin)    │
│  └── research/                      │
│      └── <id>/README.md             │
└─────────────────────────────────────┘

COLUMN 2 - "Test Layer" (Green theme):
┌─────────────────────────────────────┐
│  tests/                             │
│  └── e2e/                           │
│      └── <area>/<feature>/          │
│          └── *.e2e.test.ts          │
│                                     │
│  .udd/                              │
│  └── results.json (test outcomes)   │
└─────────────────────────────────────┘

COLUMN 3 - "Implementation Layer" (Orange theme):
┌─────────────────────────────────────┐
│  src/                               │
│  ├── commands/ (CLI handlers)       │
│  ├── lib/ (business logic)          │
│  └── types.ts (schemas)             │
│                                     │
│  bin/                               │
│  └── udd.ts (CLI entry point)       │
└─────────────────────────────────────┘

ARROWS (show relationships):
1. use-cases/*.yml --"references"--> features/*/*.feature
2. *.feature --"1:1 mapping"--> *.e2e.test.ts (dashed line, same slug)
3. *.e2e.test.ts --"generates"--> results.json
4. results.json --"read by"--> src/lib/status.ts
5. VISION.md --"defines phase for"--> all *.feature files
6. @phase:N tag in .feature --"defers to"--> future phases

VISUAL STYLE:
- Clean, minimalist boxes with rounded corners
- Subtle shadows for depth
- Color-coded by layer (blue/green/orange)
- Small file icons next to file types
- Directional arrows with labels
- Legend at bottom explaining colors and arrow types
```

## Diagram 2: UDD Development Cycle

```
PROMPT FOR DIAGRAM GENERATION:

Create a circular workflow diagram showing the UDD development cycle.
The cycle should emphasize "Spec is Truth" as the core principle.

CENTER: Large circle with "Spec is Truth" text

OUTER RING: 6 steps flowing clockwise

STEP 1 (Top, Blue):
"Define Use Case"
specs/use-cases/*.yml
Icon: Document with checklist

STEP 2 (Upper Right, Blue):
"Write Feature Spec"
specs/features/<area>/<feature>/_feature.yml
Icon: Blueprint

STEP 3 (Right, Blue):
"Write Scenario"
*.feature (Gherkin)
Icon: Script/scenario

STEP 4 (Lower Right, Red):
"Create Failing Test"
tests/e2e/**/*.e2e.test.ts
Icon: Red X / failing test

STEP 5 (Bottom, Green):
"Implement Code"
src/**/*.ts
Icon: Code brackets

STEP 6 (Left, Green):
"Test Passes"
npm test → results.json
Icon: Green checkmark

ARROWS: Clockwise flow between all steps

ESCAPE PATHS (dashed lines):
- From Step 3 to "Defer (@phase:N)" → returns to Step 1 for next item
- From Step 6 to "Commit & Repeat" → returns to Step 1

VISUAL STYLE:
- Circular layout with clear flow direction
- Red/Green color coding for TDD (red=failing, green=passing)
- Blue for specification steps
- Center principle prominently displayed
- Small icons for each step
- Phase gate indicators between major transitions
```

## Diagram 3: Agent Orchestration Flow

```
PROMPT FOR DIAGRAM GENERATION:

Create a flowchart showing how an AI agent (OpenCode/Copilot) interacts 
with the UDD system for autonomous iteration.

START: "Agent Receives Task"

DECISION DIAMOND 1: "Run udd status"
├── If "Complete" → END: "Report Success"
├── If "Error" → END: "Report Error & Stop"
└── If "Work Needed" → Continue

PROCESS BOX: "Analyze Status Output"
- Check: failing tests?
- Check: unsatisfied outcomes?
- Check: orphaned scenarios?
- Check: git dirty?

DECISION DIAMOND 2: "What needs attention?"
├── "Git Dirty" → ACTION: "Commit changes" → Loop back
├── "Failing Test" → ACTION: "Fix test/implementation" → Loop back
├── "Missing Test" → ACTION: "Create test for scenario" → Loop back
├── "Missing Scenario" → ACTION: "Refuse - ask user for spec" → PAUSE
└── "All Good" → Loop back to status check

LOOP INDICATOR: Arrow from actions back to "Run udd status"

SAFEGUARDS BOX (on side):
- Max iterations limit
- Pause on ambiguity
- Never modify specs without approval

VISUAL STYLE:
- Standard flowchart symbols
- Color coding: Blue (checks), Green (actions), Red (stops), Yellow (pauses)
- Clear loop visualization
- Safeguards in separate callout box
- Agent icon at start
```

## Diagram 4: Status Command Data Flow

```
PROMPT FOR DIAGRAM GENERATION:

Create a data flow diagram showing how `udd status` gathers and displays information.

INPUT SOURCES (left side, as database cylinders):
1. specs/VISION.md → current_phase, phases
2. specs/use-cases/*.yml → outcomes, scenario links
3. specs/features/**/*.feature → scenarios, @phase:N tags
4. specs/features/**/_feature.yml → feature metadata
5. .udd/results.json → test pass/fail status
6. git status → branch, dirty state

PROCESSING (center, as process box):
┌─────────────────────────────────────┐
│  src/lib/status.ts                  │
│  getProjectStatus()                 │
│                                     │
│  Correlates:                        │
│  - Scenarios ↔ Test results         │
│  - Outcomes ↔ Scenario status       │
│  - Phase tags ↔ Current phase       │
│  - Features ↔ Use cases             │
└─────────────────────────────────────┘

OUTPUT (right side):
┌─────────────────────────────────────┐
│  ProjectStatus JSON                 │
│  {                                  │
│    git: { branch, clean, ... }      │
│    current_phase: number            │
│    phases: Record<string, string>   │
│    features: { scenarios, ... }     │
│    use_cases: { outcomes, ... }     │
│    orphaned_scenarios: string[]     │
│  }                                  │
└─────────────────────────────────────┘

OUTPUT FORMATS (branching from JSON):
├── --json flag → Raw JSON to stdout
└── Default → Formatted CLI output with colors/icons

VISUAL STYLE:
- Data flow arrows showing direction
- Database cylinder icons for file sources
- Process box for transformation
- Document icons for outputs
- Color matches file types (blue=specs, green=tests, orange=src)
```

---

## Usage

1. Copy the relevant "PROMPT FOR DIAGRAM GENERATION" section
2. Pass to an AI image generation tool (DALL-E, Midjourney, etc.)
3. For technical diagrams, consider tools like:
   - Mermaid.js (can convert text to diagrams)
   - PlantUML
   - Excalidraw with AI assistance
   - Whimsical AI

## Updating This Document

When the UDD process changes:
1. Update the relevant diagram description
2. Regenerate the diagram image
3. Store generated images in `docs/diagrams/images/`
