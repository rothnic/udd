# Session ses_374797a8fffeStKyVWB67LU1KU

## user (2026-02-23T17:23:05.790Z)



---

[SYSTEM DIRECTIVE: OH-MY-OPENCODE - PROMETHEUS READ-ONLY]

You are being invoked by Prometheus (Plan Builder), a READ-ONLY planning agent.

**CRITICAL CONSTRAINTS:**
- DO NOT modify any files (no Write, Edit, or any file mutations)
- DO NOT execute commands that change system state
- DO NOT create, delete, or rename files
- ONLY provide analysis, recommendations, and information

**YOUR ROLE**: Provide consultation, research, and analysis to assist with planning.
Return your findings and recommendations. The actual implementation will be handled separately after planning is complete.

---

I need to research spec-kitty (a specification management tool) and understand their approach to:

1. **Concept hierarchy**:
   - How do they define features vs specs vs tasks?
   - What's the relationship between these concepts?
   - How is traceability maintained?

2. **Workflow**:
   - How does a user go from high-level goals to implementation?
   - What are the layers of abstraction?
   - How do they handle phasing/prioritization?

3. **Documentation structure**:
   - What templates do they use?
   - What metadata is required at each level?
   - How do they verify completeness?

4. **Testing approach**:
   - How do they connect specs to tests?
   - What's the relationship between user-facing tests and technical tests?

Please search GitHub, documentation, blog posts about spec-kitty and similar specification management tools. Provide concrete examples of their file structure and workflow.
---

## assistant (2026-02-23T17:23:05.802Z)

**search_context7_1mcp_resolve-library-id:**

```
Monthly quota exceeded. Create a free API key at https://context7.com/dashboard for more requests.
```
---

## assistant (2026-02-23T17:23:13.861Z)

**google_search:**

```
Error: Not authenticated with Antigravity. Please run `opencode auth login` to authenticate.
```
---

## assistant (2026-02-23T17:23:19.595Z)

**search_searxng_1mcp_searxng_web_search** (input): {"query":"spec-kitty GitHub 2026","language":"en","pageno":1}

**search_searxng_1mcp_searxng_web_search** (input): {"query":"\"spec kitty\" specification management 2026","language":"en","pageno":1}

**search_searxng_1mcp_searxng_web_search** (input): {"query":"\"spec-kitty\" \"spec kitty\" 2026","language":"en","pageno":1}
---

## assistant (2026-02-23T17:23:29.422Z)

**search_grep_1mcp_searchGitHub:**

```
Repository: Priivacy-ai/spec-kitty
Path: src/specify_cli/dashboard/static/dashboard/dashboard.js
URL: https://github.com/Priivacy-ai/spec-kitty/blob/main/src/specify_cli/dashboard/static/dashboard/dashboard.js
License: MIT

Snippets:
--- Snippet 1 (Line 607) ---
        .then(data => {
            if (data.files && data.files.length > 0) {
                renderContractsList(data.files);
            } else {
                document.getElementById('contracts-content').innerHTML =
               ...
```

**search_grep_1mcp_searchGitHub:**

```
Repository: Priivacy-ai/spec-kitty
Path: kitty-specs/014-comprehensive-end-user-documentation/tasks/WP10-validation.md
URL: https://github.com/Priivacy-ai/spec-kitty/blob/main/kitty-specs/014-comprehensive-end-user-documentation/tasks/WP10-validation.md
License: MIT

Snippets:
--- Snippet 1 (Line 165) ---
### Subtask T045 – Review Consistency
- **Purpose**: Ensure consistent tone, formatting, terminology
- **Steps**:
  1. **Terminology check**:
     - "Work Package" vs "WP" (be consistent)
     ...
```

**search_grep_1mcp_searchGitHub:**

```
Repository: Priivacy-ai/spec-kitty
Path: kitty-specs/025-cli-event-log-integration/research.md
URL: https://github.com/Priivacy-ai/spec-kitty/blob/main/kitty-specs/025-cli-event-log-integration/research.md
License: MIT

Snippets:
--- Snippet 1 (Line 18) ---
- ✅ Snapshotting deferred until WPs exceed 1000 events (performance optimization)
- ✅ LWW for entity-level conflict resolution (Linear, Figma case studies)
- ✅ OT/CRDTs overkill for structured workflow data (not collaborative text editing)
- ...
```
---

## assistant (2026-02-23T17:23:38.021Z)

**webfetch:**

```
{
  "sha": "653e0fa1e5b763f5baeceac13c497283629d60a8",
  "node_id": "C_kwDOP_PbPdoAKDY1M2UwZmExZTViNzYzZjViYWVjZWFjMTNjNDk3MjgzNjI5ZDYwYTg",
  "commit": {
    "author": {
      "name": "Robert Douglass",
      "email": "rob@robshouse.net",
      "date": "2026-02-22T15:59:27Z"
    },
    "committer": {
      "name": "GitHub",
      "email": "noreply@github.com",
      "date": "2026-02-22T15:59:27Z"
    },
    "message": "Merge pull request #149 from Priivacy-ai/codex/main-1x-rc\n\nchore(release):...
```
---

## assistant (2026-02-23T17:23:50.689Z)

**webfetch:**

```
<div align="center">
    <img src="https://github.com/Priivacy-ai/spec-kitty/raw/main/media/logo_small.webp" alt="Spec Kitty Logo"/>
    <h1>Spec Kitty</h1>
    <h2>Spec-Driven Development for AI coding agents</h2>
</div>

Spec Kitty is an open-source CLI workflow for **spec-driven development** with AI coding agents.
It helps teams turn product intent into implementation with a repeatable path:
`spec` -> `plan` -> `tasks` -> `implement` -> `review` -> `merge`.

### Why teams use it

AI coding w...
```
---

## assistant (2026-02-23T17:24:06.899Z)

**search_grep_1mcp_searchGitHub:**

```
Repository: dortania/OpenCore-Legacy-Patcher
Path: opencore_legacy_patcher/datasets/example_data.py
URL: https://github.com/dortania/OpenCore-Legacy-Patcher/blob/main/opencore_legacy_patcher/datasets/example_data.py
License: Unknown

Snippets:
--- Snippet 1 (Line 57) ---
        real_model='MacBookPro11,1',
        real_board_id='Mac-189A3D4F975D5FFC',
        reported_model='MacBookPro11,1',
        reported_board_id='Mac-189A3D4F975D5FFC',
        gpus=[
            device_probe.Intel(vendor_i...
```
---

## assistant (2026-02-23T17:24:32.524Z)

**search_grep_1mcp_searchGitHub:**

```
Repository: Priivacy-ai/spec-kitty
Path: README.md
URL: https://github.com/Priivacy-ai/spec-kitty/blob/main/README.md
License: MIT

Snippets:
--- Snippet 1 (Line 269) ---
| **0.7.3** | Update scripts for worktree feature numbering |
| **0.6.7** | Ensure software-dev and research missions present |
| **0.6.5** | Rename commands/ → command-templates/ |
| **0.5.0** | Install encoding validation git hooks |
| **0.4.8** | Add all 12 AI agent directories to .gitignore |
| **0.2.0** | Rename .specify/ ...
```
---

## assistant (2026-02-23T17:24:44.689Z)

**search_grep_1mcp_searchGitHub:**

```
Repository: Priivacy-ai/spec-kitty
Path: src/specify_cli/upgrade/migrations/m_0_9_1_complete_lane_migration.py
URL: https://github.com/Priivacy-ai/spec-kitty/blob/main/src/specify_cli/upgrade/migrations/m_0_9_1_complete_lane_migration.py
License: MIT

Snippets:
--- Snippet 1 (Line 34) ---
    deprecated scripts like tasks-move-to-lane.sh.

    Part 3: Frontmatter Normalization (CRITICAL)
    Normalize all YAML frontmatter to absolute consistency using ruamel.yaml.
    This prevents issues where:...
```
---

## assistant (2026-02-23T17:24:50.235Z)

Request classification: TYPE D — comprehensive research (deep-dive across docs + repo). I will summarize findings with concrete evidence (GitHub permalinks to the spec-kitty repo at the current commit) and short explanatory notes. All claims below include a permalink and an actual excerpt from the repository as evidence.

Important: I used the current 2026 code/docs (commit 653e0fa1e5b763f5baeceac13c497283629d60a8). Permalinks below point to that commit so you can see the exact lines I cite.

1) Concept hierarchy — features vs specs vs tasks, relationships, traceability

Claim: Spec Kitty treats a "feature" as the top-level unit of work and stores canonical artifacts for that feature in a feature directory under kitty-specs/<NNN>-<slug>/. Each feature contains spec.md (requirements / user stories), plan.md (technical plan / architecture), tasks.md and individual WP (work package) files (WPxx). Traceability is preserved by keeping these artifacts in one directory and linking workpackages to spec/plan via frontmatter and explicit references.

Evidence (spec structure & lifecycle) (repo README):
https://github.com/Priivacy-ai/spec-kitty/blob/653e0fa1e5b763f5baeceac13c497283629d60a8/README.md
```text
Spec-driven artifacts | Generates and maintains `spec.md`, `plan.md`, and `tasks.md` in `kitty-specs/<feature>/`
...
Spec -> Plan -> Tasks -> Implement -> Review -> Merge
...
Structure:
- Specification: `/kitty-specs/###-feature-name/spec.md`
- Plan: `/kitty-specs/###-feature-name/plan.md`
- Tasks: `/kitty-specs/###-feature-name/tasks.md`
- Implementation: `.worktrees/###-feature-name/`
```

Explanation: The README documents the canonical artifact set per feature (spec, plan, tasks) and explicitly shows the repo layout convention. That layout centralizes artifacts per feature, simplifying traceability.

Evidence (WP file format & frontmatter fields used for traceability):
https://github.com/Priivacy-ai/spec-kitty/blob/653e0fa1e5b763f5baeceac13c497283629d60a8/src/specify_cli/core/worktree.py
```python
All WP files are stored flat in `tasks/`. The lane (planned, doing, for_review, done) is stored in the YAML frontmatter `lane:` field.

Work Package File Format

Each WP file **MUST** use YAML frontmatter:

---
work_package_id: "WP01"
title: "Work Package Title"
lane: "planned"
subtasks:
  - "T001"
  - "T002"
phase: "Phase 1 - Setup"
assignee: ""
```

Explanation: Work packages are machine-readable via frontmatter (work_package_id, lane, subtasks, phase, assignee). That frontmatter is the primary linkage mechanism between the task artifact and the system’s workflow/acceptance checks.

2) Workflow — high-level goals → implementation, abstraction layers, phasing/prioritization

Claim: The user flow is explicitly modeled as a 6-step lifecycle (specify → plan → tasks → implement → review → merge). Spec Kitty supports a "mission" abstraction to configure workflows (mission = domain adapter), and implements "work packages" (WPxx) which are the execution units. Prioritization and phasing appear as metadata on work packages (priority, phase) and lane values control state.

Evidence (lifecycle & commands) — README workflow and command order:
https://github.com/Priivacy-ai/spec-kitty/blob/653e0fa1e5b763f5baeceac13c497283629d60a8/README.md
```text
From Idea to Production in 6 Automated Steps

spec -> plan -> tasks -> implement -> review -> merge

Complete lifecycle:
1 /spec-kitty.specify  → Create spec (in main repo)
2 /spec-kitty.plan     → Define technical approach (in main repo)
3 /spec-kitty.tasks    → Generate work packages (in main repo)
4 spec-kitty implement → Create workspace for WP01 (first worktree)
5 /spec-kitty.review   → Review completed work
6 /spec-kitty.accept   → Validate feature ready
7 /spec-kitty.merge    → Merge to main + cleanup
```

Evidence (mission abstraction):
https://github.com/Priivacy-ai/spec-kitty/blob/653e0fa1e5b763f5baeceac13c497283629d60a8/README.md
```text
Mission
Definition: A domain adapter that configures Spec Kitty (workflows, templates, validation). Missions are project-wide; all features in a project share the same active mission.

What missions define:
- Workflow phases (e.g., design → implement vs. question → gather findings)
- Templates (spec, plan, tasks, prompts)
- Validation rules (tests pass vs. citations documented)
- Path conventions
```

Evidence (workpackage priority, phasing captured in tasks.md example):
https://github.com/Priivacy-ai/spec-kitty/blob/653e0fa1e5b763f5baeceac13c497283629d60a8/kitty-specs/002-lightweight-pypi-release/tasks.md
```text
Work Packages: Lightweight PyPI Release Workflow

Inputs: Design artifacts in `/kitty-specs/002-lightweight-pypi-release/`
Prerequisites: plan.md (required), spec.md, research.md, data-model.md, contracts/, quickstart.md

Organization: Fine-grained subtasks (`Txxx`) roll into work packages (`WPxx`). Each work package is independently deliverable and testable.

Work Package WP01: Release Validation Tooling (Priority: P0) 🎯 MVP

Goal: Ship a deterministic CLI (`scripts/release/validate_release.py`) ...
Independent Test: `python -m pytest tests/release/test_validate_release.py`
```

Explanation: Tasks include priority and explicit testability. Missions provide the high-level workflow configuration. Work packages are the execution-sized units and include phase/priority metadata.

3) Documentation structure — templates, required metadata, completeness verification

Claim: Spec Kitty uses templates for all artifacts (source templates live under src/specify_cli/missions/*/command-templates/). The CLI generates/maintains spec.md, plan.md, tasks.md, and WP prompt files within the feature directory. Completeness is checked by the accept command and by frontmatter validations; there are also upgrade migrations that enforce consistent frontmatter.

Evidence (source templates location & instruction to edit templates):
https://github.com/Priivacy-ai/spec-kitty/blob/653e0fa1e5b763f5baeceac13c497283629d60a8/CLAUDE.md
```text
| SOURCE templates | `src/specify_cli/missions/*/command-templates/` | ✅ EDIT THESE |
The directories like `.claude/commands/` are GENERATED COPIES that get deployed to projects that USE spec-kitty. They are NOT source code.
```

Evidence (tasks template with absolute-path expectations and frontmatter guidance):
https://github.com/Priivacy-ai/spec-kitty/blob/653e0fa1e5b763f5baeceac13c497283629d60a8/src/specify_cli/templates/command-templates/tasks.md
```text
1. Setup: Run `spec-kitty agent feature check-prerequisites --json --paths-only --include-tasks` ... command returns JSON with `FEATURE_DIR` as an ABSOLUTE path...
YOU MUST USE THIS PATH for ALL subsequent file operations. Example:
FEATURE_DIR = "/Users/.../kitty-specs/001-a-simple-hello"
tasks.md location: FEATURE_DIR + "/tasks.md"
prompt location: FEATURE_DIR + "/tasks/WP01-slug.md"
```

Evidence (accept/validation commands & options — metadata/checklist/verifications):
https://github.com/Priivacy-ai/spec-kitty/blob/653e0fa1e5b763f5baeceac13c497283629d60a8/README.md
```text
spec-kitty accept
What this does:
- Verifies all WPs have `lane: "done"`
- Checks metadata and activity logs
- Confirms no `NEEDS CLARIFICATION` markers remain
- Records acceptance timestamp
Accept options: --test <command> (run validation commands), --mode (auto/pr/local/checklist), --lenient
```

Explanation: Templates are single-source (edit in src/.../command-templates). The system enforces absolute paths and frontmatter consistency. The accept command runs explicit checks (lanes, metadata, activity logs) and can run test commands specified by the user to verify artifact completeness.

4) Testing approach — connection from specs to tests and the relation of user-facing vs technical tests

Claim: Spec Kitty connects specs to executable tests by (a) encouraging/recording test commands in feature/task artifacts, (b) providing acceptance hooks that run tests (spec-kitty accept supports --test), and (c) placing tests in repo tests/ directories referenced as "Independent Test" in the WP description. There is a distinction: “user-facing” tests/checklists (acceptance-level checks) vs technical tests (unit/integration tests executed by test runners). Work packages can document an "Independent Test" which maps to a command (pytest / npm / lint) that acceptance will run.

Evidence (tasks.md example with Independent Test pointing to pytest):
https://github.com/Priivacy-ai/spec-kitty/blob/653e0fa1e5b763f5baeceac13c497283629d60a8/kitty-specs/002-lightweight-pypi-release/tasks.md
```text
Work Package WP01: Release Validation Tooling (Priority: P0) 🎯 MVP

Goal: Ship a deterministic CLI (`scripts/release/validate_release.py`) ...
Independent Test: `python -m pytest tests/release/test_validate_release.py` passes and `python scripts/release/validate_release.py --tag vX.Y.Z --changelog CHANGELOG.md` exits 0 on a prepared release branch.
```

Evidence (accept command options and test-running support):
https://github.com/Priivacy-ai/spec-kitty/blob/653e0fa1e5b763f5baeceac13c497283629d60a8/README.md
```text
spec-kitty accept --test "pytest tests/" --test "npm run lint"
--mode checklist / --json / --lenient
```

Evidence (integration with WP frontmatter and lane state used by acceptance code):
https://github.com/Priivacy-ai/spec-kitty/blob/653e0fa1e5b763f5baeceac13c497283629d60a8/src/specify_cli/core/acceptance_core.py
```python
@dataclass
class WorkPackageState:
    work_package_id: str
    lane: str
    title: str
    path: str
    has_lane_entry: bool
    latest_lane: Optional[str]
    metadata: Dict[str, Optional[str]] = field(default_factory=dict)
```

Explanation: Each WP can and should record what tests validate it. Acceptance runs can execute those test commands. The repo explicitly documents "Independent Test" in WP descriptions and offers CLI flags to run tests at acceptance time. That separates user-facing acceptance criteria (pass checklist, document links, no NEEDS CLARIFICATION) from technical tests (unit/integration/test runner commands).

5) Worktree & parallel implementation model (how code is implemented / parallelism / isolation)

Claim: Implementation is done in isolated git worktrees — one worktree per work package — to reduce branch conflict. The main repo stores canonical artifacts (kitty-specs) while implementations occur in .worktrees/NNN-... and symlink project constitution for consistency.

Evidence (worktree model & symlink sharing):
https://github.com/Priivacy-ai/spec-kitty/blob/653e0fa1e5b763f5baeceac13c497283629d60a8/README.md
```text
Parallel implementation model | Creates isolated git worktrees under `.worktrees/` for work package execution
Worktree Constitution Sharing:
.worktrees/001-feature-WP01/.kittify/memory -> ../../../../.kittify/memory
This ensures all work packages follow the same project principles.
```

Evidence (merge command description & workspace-per-WP model):
https://github.com/Priivacy-ai/spec-kitty/blob/653e0fa1e5b763f5baeceac13c497283629d60a8/src/specify_cli/missions/software-dev/command-templates/merge.md
```text
/ spec-kitty.merge - Merge Feature to Main
CRITICAL: Workspace-per-WP Model (0.11.0)
Purpose: Merge ALL completed work packages for a feature into main branch.
...
If you are on `main` and need to merge a workspace-per-WP feature, run:
spec-kitty merge --feature <feature-slug>
```

Explanation: Worktrees provide isolation for agent-driven implementations and reduce the need to switch branches. Merge flows are provided to reconcile completed WPs back into main.

6) Migrations and enforcement of structure (how they keep docs consistent)

Claim: The project includes migrations that normalize lanes to frontmatter-only and enforce frontmatter consistency; these migrations demonstrate that the system treats frontmatter as the canonical state and that tooling will correct historical variations.

Evidence (migration doc for frontmatter-only lanes):
https://github.com/Priivacy-ai/spec-kitty/blob/653e0fa1e5b763f5baeceac13c497283629d60a8/src/specify_cli/upgrade/migrations/m_0_9_0_frontmatter_only_lanes.py
```python
class FrontmatterOnlyLanesMigration(BaseMigration):
    """Migrate from directory-based to frontmatter-only lane management.

    As of v0.9.0, task lanes are determined solely by the `lane:` field
    in the YAML frontmatter of work package files. The directory structure
    (tasks/planned/, tasks/doing/, etc.) is flattened to a single tasks/
    directory.
    ...
    1. Moves WP files from tasks/{lane}/ to tasks/
    2. Ensures the `lane:` field is set from the source directory
    3. Removes empty lane subdirectories
    4. Processes main kitty-specs/ and all .worktrees/
    """
```

Evidence (migration that normalizes frontmatter formats):
https://github.com/Priivacy-ai/spec-kitty/blob/653e0fa1e5b763f5baeceac13c497283629d60a8/src/specify_cli/upgrade/migrations/m_0_9_1_complete_lane_migration.py
```text
Normalize all YAML frontmatter to absolute consistency using ruamel.yaml.
This prevents issues where:
- Some files have `lane: "for_review"` (quoted)
- Some files have `lane: for_review` (unquoted)
This migration:
1. Finds ALL remaining files in lane subdirectories
2. Moves them to the flat tasks/ directory
3. Ensures lane: field in frontmatter for .md files
4. Removes any remaining lane subdirectories
...
```

Explanation: The migration code shows the project enforces standard frontmatter/metadata formats and updates on-disk structure to keep tooling reliable.

7) Concrete examples (file paths / sample WP frontmatter / sample commands)

- Canonical feature directory and artifacts:
  Evidence: README + example paths
  https://github.com/Priivacy-ai/spec-kitty/blob/653e0fa1e5b763f5baeceac13c497283629d60a8/README.md

- Example WP file (from tests showing frontmatter):
  Evidence (test-create WP snippet showing frontmatter):
  https://github.com/Priivacy-ai/spec-kitty/blob/653e0fa1e5b763f5baeceac13c497283629d60a8/tests/integration/test_agent_command_wrappers.py
  ```python
  wp_file.write_text(
      "---\n"
      "work_package_id: WP02\n"
      "title: Build API\n"
      "dependencies: [WP01]\n"
      "lane: planned\n"
      "---\n"
      "# Build API\n"
      "Task description\n",
      encoding="utf-8"
  )
  ```

- Example tasks.md snippet showing "Independent Test" mapping to pytest:
  Evidence:
  https://github.com/Priivacy-ai/spec-kitty/blob/653e0fa1e5b763f5baeceac13c497283629d60a8/kitty-specs/002-lightweight-pypi-release/tasks.md
  (excerpt shown earlier)

8) Summary of how spec → test traceability works in practice

- Author writes spec (/spec-kitty.specify) that creates spec.md.
- Plan (/spec-kitty.plan) documents architecture and produces plan.md and contracts.
- Tasks (/spec-kitty.tasks) creates tasks.md and individual WP files; WP frontmatter includes work_package_id, dependencies, lane, phase, priority and may document test commands (“Independent Test”).
- Implementation (/spec-kitty.implement) runs in a worktree and when a WP moves to for_review the system may (a) run predefined test commands, (b) record activity logs and (c) gate acceptance.
- Acceptance (/spec-kitty.accept) checks all WPs in feature are lane: done, runs user-specified tests (via --test), and records acceptance metadata — closing the trace from spec → plan → task → tests → merge.

Evidence summary links (commit pinned):
- README (lifecycle, artifact layout, worktrees, commands): https://github.com/Priivacy-ai/spec-kitty/blob/653e0fa1e5b763f5baeceac13c497283629d60a8/README.md
- Tasks template & absolute-path guidance: https://github.com/Priivacy-ai/spec-kitty/blob/653e0fa1e5b763f5baeceac13c497283629d60a8/src/specify_cli/templates/command-templates/tasks.md
- WP frontmatter / lane enforcement (worktree/core): https://github.com/Priivacy-ai/spec-kitty/blob/653e0fa1e5b763f5baeceac13c497283629d60a8/src/specify_cli/core/worktree.py
- Frontmatter-only lanes migration (enforcement): https://github.com/Priivacy-ai/spec-kitty/blob/653e0fa1e5b763f5baeceac13c497283629d60a8/src/specify_cli/upgrade/migrations/m_0_9_0_frontmatter_only_lanes.py
- Migration normalizing frontmatter formats: https://github.com/Priivacy-ai/spec-kitty/blob/653e0fa1e5b763f5baeceac13c497283629d60a8/src/specify_cli/upgrade/migrations/m_0_9_1_complete_lane_migration.py
- Example WP in tests: https://github.com/Priivacy-ai/spec-kitty/blob/653e0fa1e5b763f5baeceac13c497283629d60a8/tests/integration/test_agent_command_wrappers.py
- Example tasks and Independent Test: https://github.com/Priivacy-ai/spec-kitty/blob/653e0fa1e5b763f5baeceac13c497283629d60a8/kitty-specs/002-lightweight-pypi-release/tasks.md
- Merge command / workspace-per-WP model: https://github.com/Priivacy-ai/spec-kitty/blob/653e0fa1e5b763f5baeceac13c497283629d60a8/src/specify_cli/missions/software-dev/command-templates/merge.md

Practical takeaways / recommendations for adoption
- Adopt the same artifact layout: keep spec.md, plan.md, tasks.md and WP files inside a single feature directory to keep requirements traceable and machine-readable.
- Use frontmatter fields (work_package_id, lane, dependencies, phase, priority) as the canonical metadata for automation and for mapping to test runners.
- Record the exact test commands (pytest, npm, lint) in the WP artifact (or tasks.md) so acceptance flows can run them deterministically.
- Use worktrees or equivalent isolated workspaces for parallel implementation to reduce branch conflicts; ensure project constitution (shared policy/quality docs) is symlinked into each workspace.
- Rely on tooling/migrations to enforce frontmatter consistency; keep templates under src/…/command-templates/ to maintain a single source of truth.

If you want, next I can:
- Extract a minimal example feature directory (spec.md, plan.md, tasks.md, WP01.md) from the repo and produce a small checklist mapping fields → acceptance checks (no file writes; only planning output).
- Or produce a short spec template and a matching test-run mapping that you can drop into an existing project.

Which follow-up would you prefer?