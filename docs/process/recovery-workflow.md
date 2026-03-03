# Recovery Workflow

Documentation for handling drift in UDD projects. Use this guide when the `udd doctor` command detects inconsistencies between journeys, scenarios, and tests.

---

## Overview

**Drift** occurs when the relationships between journeys, feature files, and tests become inconsistent. This happens when:

- You edit a journey file without syncing
- Scenarios are renamed or moved
- Test files get out of sync with their scenarios
- References point to nonexistent files

Recovery restores consistency so the UDD workflow functions correctly. The recovery process is designed to be safe, transparent, and reversible.

### Why Recovery Matters

Drift breaks the traceability that makes UDD effective. When drift accumulates:

- Tests may pass while scenarios are incomplete
- Journeys may reference scenarios that no longer exist
- New team members cannot understand the intended flow
- Automated tools make incorrect assumptions

Regular recovery keeps the project healthy and maintainable.

---

## Detection

Run `udd doctor` to check for drift. This command scans the project for inconsistencies and produces a report.

### Basic Status Check

```bash
udd doctor
```

Output shows issues grouped by severity:

```
UDD Doctor Report
=================

CRITICAL (2)
------------
✗ Journey 'export_data' references missing scenario: specs/export/csv.feature
✗ Test file tests/items/create.e2e.test.ts has no matching scenario

WARNING (1)
-----------
⚠ Journey 'onboarding' has stale sync timestamp (3 days old)

INFO (1)
--------
ℹ Found 12 scenarios not linked by any journey

Run 'udd doctor --fix' to start recovery
```

### Structured Output

For scripts and CI pipelines:

```bash
udd doctor --json
```

Returns machine-readable output:

```json
{
  "status": "needs_recovery",
  "critical": 2,
  "warning": 1,
  "info": 1,
  "issues": [
    {
      "severity": "critical",
      "type": "missing_scenario",
      "journey": "export_data",
      "reference": "specs/export/csv.feature"
    }
  ]
}
```

---

## Severity Levels

Issues are classified by impact on the UDD workflow.

### Critical

**Impact:** Blocks sync and breaks traceability

Examples:
- Journey references nonexistent scenario file
- Test exists without corresponding scenario
- Scenario file is corrupted or unparsable
- Required metadata is missing

**Action Required:** Must fix before continuing development

### Warning

**Impact:** May cause confusion or incomplete behavior

Examples:
- Journey not synced for over 7 days
- Scenario linked by multiple journeys (possible duplication)
- Test coverage gap in a journey
- Orphan scenario with no journey link

**Action Required:** Should fix during next sprint

### Info

**Impact:** Does not affect functionality, good to know

Examples:
- Unlinked scenarios (may be intentional)
- Optional metadata missing
- Stale checkpoints from resolved issues

**Action Required:** Review periodically, no urgency

---

## Auto-Remediation

Some issues can be fixed automatically without user input. The `--auto` flag attempts safe fixes first.

### What Can Be Auto-Fixed

| Issue | Fix Applied |
|-------|-------------|
| Stale sync timestamp | Update to current time after verification |
| Missing metadata defaults | Add standard placeholder values |
| Orphan test files (confirmed obsolete) | Move to `.udd/attic/` |
| Duplicate checkpoint entries | Clean up redundant records |
| Broken internal links (unambiguous) | Update to correct path |

### Running Auto-Fix

```bash
udd doctor --fix --auto
```

Output shows what was fixed:

```
Auto-Fix Results
================
✓ Fixed: Updated stale sync timestamp for 'onboarding'
✓ Fixed: Removed 3 duplicate checkpoint entries
✓ Fixed: Moved obsolete test to .udd/attic/

3 issues auto-resolved
1 issue requires checkpoint review
Run 'udd doctor --fix' for remaining issues
```

### Safety Limits

Auto-fix never:
- Deletes scenarios with content
- Modifies journey files
- Changes test logic
- Resolves ambiguous references

These require checkpoint review to prevent data loss.

---

## Checkpoint-Based Recovery

When issues require judgment or may have multiple valid resolutions, UDD creates a checkpoint. Checkpoints preserve the current state and guide you through the decision.

### Checkpoint Types

**scenario_path_ambiguous**

The scenario reference in a journey could point to multiple files. This happens when files are moved or renamed.

Example:
```yaml
checkpoint:
  type: scenario_path_ambiguous
  journey: export_data
  reference: specs/export/csv.feature
  candidates:
    - specs/export/csv_export.feature
    - specs/reports/csv.feature
  context: "File was moved during refactor, unclear which is correct"
```

Resolution options:
- Select correct path from candidates
- Update journey to new location
- Mark as deleted if scenario was removed

**multiple_use_case_links**

A scenario is referenced by multiple journeys. This may indicate duplication or a shared component.

Example:
```yaml
checkpoint:
  type: multiple_use_case_links
  scenario: specs/auth/login.feature
  journeys:
    - user_onboarding
    - admin_login
  context: "Scenario shared across journeys"
```

Resolution options:
- Keep shared (intentional reuse)
- Duplicate scenario for each journey
- Extract to shared library scenario

**delete_orphan_confirmation**

A scenario has no journey links. This may be intentional (in development) or may be leftover from deletion.

Example:
```yaml
checkpoint:
  type: delete_orphan_confirmation
  scenario: specs/legacy/import.feature
  last_modified: "2024-01-15"
  context: "No journey references this scenario"
```

Resolution options:
- Link to appropriate journey
- Delete if truly obsolete
- Mark as draft for future use

**phase_mismatch**

A scenario or test has a phase tag that does not match the current project phase.

Example:
```yaml
checkpoint:
  type: phase_mismatch
  scenario: specs/payments/stripe.feature
  scenario_phase: 3
  current_phase: 2
  context: "Scenario tagged for future phase"
```

Resolution options:
- Keep as-is (future work)
- Remove phase tag (implement now)
- Move to backlog folder

### Checkpoint Workflow

1. Run interactive fix:
   ```bash
   udd doctor --fix
   ```

2. Review each checkpoint:
   ```
   Checkpoint 1 of 3: scenario_path_ambiguous
   
   Journey 'export_data' references:
     specs/export/csv.feature
   
   This file does not exist. Possible matches:
     [1] specs/export/csv_export.feature
     [2] specs/reports/csv.feature
     [3] None of these - mark as deleted
   
   Select option (1-3):
   ```

3. Checkpoint is recorded in `.udd/checkpoints.yml` with your decision for audit trail

4. Continue to next checkpoint or exit to finish later

### Resuming Interrupted Recovery

Checkpoints persist across sessions. To resume:

```bash
udd doctor --fix --resume
```

This continues from the first unresolved checkpoint.

---

## Common Scenarios

### Scenario 1: Stale Journey After Editing

**Symptom:**
```
WARNING: Journey 'user_onboarding' has stale sync timestamp (5 days old)
```

**Cause:**
You edited `product/journeys/user_onboarding.md` but did not run `udd sync`.

**Recovery:**
```bash
# Check what changed
udd doctor

# Option 1: If changes are intentional, sync normally
udd sync

# Option 2: If you want to review changes first
udd sync --dry-run

# Option 3: If you made experimental changes you want to discard
udd sync --reset
```

**Prevention:**
- Run `udd sync` after every journey edit
- Enable git hooks to remind you: `udd hooks install`

### Scenario 2: Missing Test for New Scenario

**Symptom:**
```
CRITICAL: Scenario 'specs/items/bulk_create.feature' has no test file
```

**Cause:**
You created a scenario file but the corresponding test was not generated.

**Recovery:**
```bash
# Generate missing test
udd sync

# Or create manually if you need custom test structure
udd new test items/bulk_create
```

**Prevention:**
- Use `udd new scenario` instead of creating files manually
- Run `udd sync` after adding scenarios

### Scenario 3: Broken Reference to Moved File

**Symptom:**
```
CRITICAL: Journey 'reporting' references missing scenario: specs/reports/pdf.feature
```

**Cause:**
You moved or renamed a scenario file. The journey still points to the old location.

**Recovery:**
```bash
udd doctor --fix

# Interactive prompt shows:
# File not found: specs/reports/pdf.feature
# Did you mean:
#   [1] specs/exports/pdf.feature
#   [2] specs/reports/pdf_export.feature
# Select the correct path or mark as deleted
```

**Prevention:**
- Use `udd move` command instead of `mv`:
  ```bash
  udd move specs/reports/pdf.feature specs/exports/pdf.feature
  ```
- This updates all references automatically

### Scenario 4: Phase Mismatch

**Symptom:**
```
WARNING: 3 scenarios tagged for phase 3, current phase is 2
```

**Cause:**
Scenarios have `@phase:3` tags but the project is still in phase 2.

**Recovery:**
```bash
udd doctor --fix

# For each scenario, choose:
# - Keep: Scenario stays as future work
# - Implement: Remove phase tag, implement now
# - Defer: Move to specs/backlog/
```

**Prevention:**
- Review phase tags during sprint planning
- Use `udd roadmap --phase 2` to see only current phase work

### Scenario 5: Duplicate Scenario Links

**Symptom:**
```
WARNING: Scenario 'login' is referenced by 2 journeys
```

**Cause:**
Two journeys link to the same scenario. This may be intentional (shared login) or accidental (copy-paste error).

**Recovery:**
```bash
udd doctor --fix

# Decide per scenario:
# - Shared: Keep both links (intentional reuse)
# - Split: Create separate scenarios for each journey
# - Consolidate: Merge journeys if they are actually the same
```

**Prevention:**
- Use domain grouping to avoid cross-journey references
- Document shared scenarios in journey files

---

## Prevention

Minimize drift with these practices:

### Daily Workflow

1. **Start with status:**
   ```bash
   udd doctor
   ```

2. **Sync after every journey change:**
   ```bash
   udd sync
   ```

3. **Check before commits:**
   ```bash
   udd doctor --strict || echo "Fix drift before committing"
   ```

### CI Integration

Add to your CI pipeline:

```yaml
# .github/workflows/udd-check.yml
name: UDD Consistency Check
on: [push, pull_request]
jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm install -g udd-cli
      - run: udd doctor --strict
```

The `--strict` flag fails if any critical or warning issues exist.

### Git Hooks

Install pre-commit hook:

```bash
udd hooks install
```

This warns you when:
- Journey files are modified but not synced
- Drift exists when committing
- New scenarios lack tests

### Team Practices

- **Review drift in standups:** Check `udd doctor` output weekly
- **Assign recovery owner:** Rotate who handles checkpoint review
- **Document intentional orphans:** Some scenarios may legitimately have no journey link (drafts, shared library)

---

## Command Reference

### udd doctor

Check project health and detect drift.

```bash
udd doctor [options]
```

Options:
- `--json` - Output machine-readable JSON
- `--strict` - Exit with error if issues found
- `--fix` - Enter interactive recovery mode
- `--fix --auto` - Apply safe fixes automatically
- `--resume` - Continue from previous checkpoint

Examples:
```bash
udd doctor                          # Standard check
udd doctor --json > drift.json     # Save for processing
udd doctor --strict || exit 1      # CI gate
```

### udd sync

Synchronize journeys to scenarios and tests.

```bash
udd sync [options]
```

Options:
- `--dry-run` - Show what would change without applying
- `--strict` - Fail if drift detected
- `--reset` - Discard journey changes, regenerate from scenarios

Examples:
```bash
udd sync                           # Normal sync
udd sync --strict                  # Sync only if clean
```

### udd move

Move or rename scenarios while updating references.

```bash
udd move <source> <destination>
```

Examples:
```bash
udd move specs/old/name.feature specs/new/name.feature
```

### udd status

Quick overview of project state.

```bash
udd status
```

Shows:
- Number of journeys, scenarios, tests
- Sync status
- Current phase
- Pending checkpoints

---

## Decision Trees

### When You See Drift

```
Run: udd doctor

Issues found?
├── No → Continue development
└── Yes → Check severity
    ├── Critical → Must fix now
    │   └── Run: udd doctor --fix
    ├── Warning → Fix this sprint
    │   └── Run: udd doctor --fix --auto
    └── Info → Review in planning
        └── Run: udd doctor (review output)
```

### During Recovery

```
Checkpoint encountered?
├── scenario_path_ambiguous
│   ├── Have you moved files recently?
│   │   ├── Yes → Select new path
│   │   └── No → Mark as deleted
│   └── Select from candidates
├── multiple_use_case_links
│   ├── Is this intentional sharing?
│   │   ├── Yes → Keep shared
│   │   └── No → Duplicate or consolidate
│   └── Document decision
├── delete_orphan_confirmation
│   ├── Is this work in progress?
│   │   ├── Yes → Link to journey or mark draft
│   │   └── No → Delete
│   └── Check last modified date
└── phase_mismatch
    ├── Is this future work?
    │   ├── Yes → Keep as-is
    │   └── No → Remove phase tag
    └── Review with product owner
```

---

## Troubleshooting

### Recovery loop: same issues after fixing

Check if:
- Files are read-only (fix permissions)
- Multiple UDD versions installed (check `which udd`)
- `.udd/` directory is in `.gitignore` (should be committed)

### Checkpoint file corrupted

```bash
# Reset checkpoints to last good state
git checkout .udd/checkpoints.yml

# Or clear all checkpoints and start fresh
rm .udd/checkpoints.yml
udd doctor --fix
```

### Cannot resolve ambiguous paths

When multiple candidates seem equally valid:

1. Check git history: `git log --all --full-history -- specs/export/csv.feature`
2. Look at journey context to understand intent
3. Ask the author if available
4. Choose the most specific path (deeper in folder hierarchy usually means more recent)

---

## Summary

Recovery is a normal part of the UDD workflow, not a failure. Regular recovery:

- Keeps traceability intact
- Prevents technical debt accumulation
- Makes onboarding easier
- Enables reliable automation

Run `udd doctor` frequently. Address critical issues immediately. Schedule warning cleanup in each sprint. Document your decisions in checkpoints for team visibility.

For questions or edge cases not covered here, check:
- `udd doctor --help` for current options
- `.udd/checkpoints.yml` for checkpoint history
- Project-specific AGENTS.md for local conventions
