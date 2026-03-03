# Journey: Recover from Drift

**Actor**: Developer, Agent  
**Goal**: Systematically restore UDD traceability through structured recovery workflow  
**Context**: Drift occurs when journeys, scenarios, and tests become inconsistent. This journey provides a practical, iterative recovery process that can be orchestrated by agents with user guidance.

## Overview

This journey implements a **structured recovery workflow** that:
- Detects and catalogs all drift issues
- Creates a prioritized backlog of recovery tasks
- Processes tasks one-at-a-time with verification
- Uses interactive questioning for ambiguous decisions
- Maintains progress across sessions via checkpoints
- Orchestrates parallel work where safe, serial where required

## Steps

### Phase 1: Discovery & Backlog Creation

**1.1. Run comprehensive drift detection**
- Execute `udd doctor --json` to get structured issue list
- Categorize issues by severity (critical/warning/info)
- Identify dependencies between issues
- → `specs/features/udd/recovery/detect_and_categorize.feature`

**1.2. Analyze issue dependencies**
- Determine which issues block others
- Identify safe parallel work streams
- Flag issues requiring user input
- → `specs/features/udd/recovery/analyze_dependencies.feature`

**1.3. Create recovery backlog**
- Generate `.udd/recovery-backlog.yml` with prioritized tasks
- Each task includes: issue, severity, dependencies, estimated effort
- Mark tasks as: auto-fixable, needs-user-input, blocked
- → `specs/features/udd/recovery/create_recovery_backlog.feature`

### Phase 2: Automated Resolution (Parallel Where Safe)

**2.1. Execute safe auto-fixes**
- Process all `autoFixable: true` issues without user input
- Create missing scenario stubs
- Create missing test files
- Update stale timestamps (with verification)
- → `specs/features/udd/recovery/execute_auto_fixes.feature`

**2.2. Verify auto-fixes**
- Run `udd doctor` to confirm fixes resolved issues
- Mark completed tasks in backlog
- Report any failed auto-fixes for manual handling
- → `specs/features/udd/recovery/verify_auto_fixes.feature`

### Phase 3: Interactive Resolution (One-at-a-Time)

**3.1. Select next critical issue**
- Read `.udd/recovery-backlog.yml`
- Pick highest priority unresolved critical issue
- Check dependencies are satisfied
- → `specs/features/udd/recovery/select_next_issue.feature`

**3.2. Analyze issue context**
- Load related files (journey, scenario, test)
- Check git history for recent changes
- Identify decision points requiring user input
- → `specs/features/udd/recovery/analyze_issue_context.feature`

**3.3. Present decision to user**
- Use question tool to present options
- Show context and implications of each choice
- Allow user to: resolve, skip, defer, or get more info
- → `specs/features/udd/recovery/present_user_decision.feature`

**3.4. Execute resolution**
- Apply user's decision
- Update files (journey links, scenarios, tests)
- Create checkpoint for audit trail
- → `specs/features/udd/recovery/execute_resolution.feature`

**3.5. Verify and mark complete**
- Run targeted validation
- Update backlog status to "completed"
- Log resolution for reporting
- → `specs/features/udd/recovery/verify_and_complete.feature`

**3.6. Loop or exit**
- If more critical issues: return to 3.1
- If only warnings remain: ask user if they want to continue
- If user exits: save state for `--resume`
- → `specs/features/udd/recovery/iteration_control.feature`

### Phase 4: Sync & Final Validation

**4.1. Run sync for all modified journeys**
- Execute `udd sync` to regenerate artifacts
- Handle any new drift introduced during recovery
- → `specs/features/udd/recovery/sync_after_recovery.feature`

**4.2. Final validation**
- Run `udd doctor --strict`
- Verify zero critical issues
- Check all backlog tasks resolved
- → `specs/features/udd/recovery/final_validation.feature`

**4.3. Generate recovery report**
- Summary: issues found, fixed, skipped
- Time spent per phase
- Recommendations for prevention
- Archive backlog to `.udd/recovery-history/`
- → `specs/features/udd/recovery/generate_report.feature`

## Recovery Backlog Structure

```yaml
# .udd/recovery-backlog.yml
recovery_session:
  id: "rec-2026-03-02-001"
  started: "2026-03-02T17:00:00Z"
  status: "in_progress" # in_progress | paused | completed
  
issues:
  - id: "crit-001"
    type: "scenario_orphan"
    severity: "critical"
    file: "specs/auth/oauth.feature"
    description: "Scenario has no journey link"
    auto_fixable: false
    needs_user_input: true
    dependencies: []  # Can be done in parallel
    status: "pending" # pending | in_progress | completed | skipped
    
  - id: "warn-003"
    type: "journey_stale"
    severity: "warning"
    file: "product/journeys/user-onboarding.md"
    description: "Journey modified since last sync"
    auto_fixable: true
    needs_user_input: false
    dependencies: []  # Safe to auto-fix
    status: "pending"
    
  - id: "crit-002"
    type: "test_failing"
    severity: "critical"
    file: "tests/e2e/auth/login.e2e.test.ts"
    description: "Test is failing"
    auto_fixable: false
    needs_user_input: true
    dependencies: ["crit-001"]  # Must fix auth scenario first
    status: "blocked"
```

## Agent Orchestration Pattern

### Single Command Entry Point
```bash
udd doctor --fix --orchestrate
```

This command:
1. **Creates backlog** if none exists
2. **Checks for pending work** and resumes
3. **Processes one task** to completion
4. **Reports progress** and next steps
5. **Exits cleanly** (no hanging prompts)

### Iterative Workflow (No Repeated Prompting)

**Agent Flow:**
```
while backlog.has_pending_issues():
    # 1. Select issue
    issue = backlog.next_critical_issue()
    
    # 2. Check if auto-fixable
    if issue.auto_fixable:
        execute_auto_fix(issue)
        verify_and_mark_complete(issue)
        continue
    
    # 3. Requires user input - ask ONE question
    decision = question_tool.present_options(
        context=load_context(issue),
        options=generate_options(issue),
        default="skip"
    )
    
    # 4. Execute and verify
    execute_decision(decision, issue)
    verify_and_mark_complete(issue)
    
    # 5. Report status
    print_progress_summary()
    
    # 6. Continue automatically if more auto-fixable issues
    #    Stop if next issue needs user input
    if not backlog.next_auto_fixable():
        print("Run 'udd doctor --fix --orchestrate' to continue")
        break
```

### Question Tool Usage

**When to use question tool:**
- Scenario orphan: "Delete, link to journey, or mark as draft?"
- Ambiguous reference: "Select correct path from candidates"
- Test failure: "Fix test, mark pending, or skip?"
- Phase mismatch: "Implement now, keep for future phase, or defer?"

**Question format:**
```javascript
{
  header: "Recovery Decision Required",
  question: "Scenario 'specs/auth/oauth.feature' has no journey link. What should we do?",
  options: [
    {
      label: "Link to journey",
      description: "Select which journey this scenario belongs to"
    },
    {
      label: "Delete scenario",
      description: "Remove this orphaned scenario (irreversible)"
    },
    {
      label: "Mark as draft",
      description: "Keep but mark as work-in-progress"
    },
    {
      label: "Skip for now",
      description: "Leave unresolved and continue with other issues"
    }
  ]
}
```

## Parallel vs Serial Work Identification

### Safe for Parallel Processing
- Creating missing scenario stubs (no dependencies)
- Creating missing test files (no dependencies)
- Fixing stale timestamps in different domains
- Updating manifests

### Must Be Serial
- Orphan scenarios that might link to journeys being created
- Test failures that depend on scenario fixes
- Phase mismatches that affect multiple features
- Checkpoint resolutions requiring user decisions

### Dependency Graph
The backlog creation phase builds a dependency graph:
```yaml
tasks:
  - id: "create-scenarios"
    parallel_safe: true
    dependencies: []
    
  - id: "link-orphans"
    parallel_safe: false
    dependencies: ["create-scenarios"]
    
  - id: "sync-all"
    parallel_safe: false
    dependencies: ["link-orphans"]
```

## Resumption Strategy

### Session Persistence
```yaml
# .udd/recovery-session.yml
session:
  id: "rec-2026-03-02-001"
  created: "2026-03-02T17:00:00Z"
  last_activity: "2026-03-02T17:30:00Z"
  current_phase: "interactive_resolution"
  current_issue: "crit-003"
  completed_count: 5
  total_count: 20
  
backlog: # Reference to recovery-backlog.yml
  file: ".udd/recovery-backlog.yml"
  
checkpoints:
  - issue_id: "crit-001"
    decision: "link_to_journey"
    selected_journey: "user-authentication"
    timestamp: "2026-03-02T17:15:00Z"
```

### Resume Command
```bash
udd doctor --fix --orchestrate --resume
# Alternative:
udd recovery resume
```

## Success Criteria

- [ ] All critical issues resolved or consciously skipped
- [ ] Recovery backlog shows 100% completion (or documented skips)
- [ ] `udd doctor --strict` passes with exit code 0
- [ ] No orphaned scenarios without decisions
- [ ] All checkpoints documented in `.udd/checkpoints.yml`
- [ ] Recovery report generated and archived
- [ ] Agent can run `udd doctor --fix --orchestrate` without getting stuck

## Prevention Integration

Link to ongoing maintenance:
- `validate-specs` journey - catch drift early
- `monitor-test-health` journey - ongoing health visibility
- `traceability-compliance` journey - periodic audits

## Related

- `docs/process/recovery-workflow.md` - Detailed recovery patterns
- `traceability-compliance` journey - Ongoing compliance
- `validate-phase-consistency` journey - Phase drift detection
- `prevent-regression` journey - Sync and dirty marking
