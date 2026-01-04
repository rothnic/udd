# GitHub Issues - Ready to Create

## Files in This Directory

This directory contains 5 simplified GitHub issue files for UDD enhancements:

1. **01-sysml-informed-feature-scenarios.md** - Use SysML Principles to Enhance Feature Scenarios
2. **02-query-commands-for-agents.md** - Add Query Commands for Agent Access
3. **03-enhance-discovery-workflow.md** - Enhance Feature Discovery Workflow
4. **04-feature-template.md** - Add Feature Template with SysML Context
5. **05-update-documentation.md** - Update Documentation

## How to Create the Issues

### Option 1: Run the Script (Easiest)

```bash
cd .github/issues
bash create-issues-simple.sh
```

This will create all 5 issues automatically.

### Option 2: Manual via GitHub CLI

```bash
cd .github/issues

gh issue create --repo rothnic/udd \
  --title "Use SysML Principles to Enhance Feature Scenarios" \
  --body-file 01-sysml-informed-feature-scenarios.md \
  --label "enhancement,phase-3,documentation,methodology"

gh issue create --repo rothnic/udd \
  --title "Add Query Commands for Agent Access to Requirements" \
  --body-file 02-query-commands-for-agents.md \
  --label "enhancement,phase-3,agent-tools,json-api"

gh issue create --repo rothnic/udd \
  --title "Enhance Feature Discovery Workflow" \
  --body-file 03-enhance-discovery-workflow.md \
  --label "enhancement,phase-3,workflow,agent-tools"

gh issue create --repo rothnic/udd \
  --title "Add Feature Template with SysML Context" \
  --body-file 04-feature-template.md \
  --label "enhancement,phase-3,templates,documentation"

gh issue create --repo rothnic/udd \
  --title "Update Documentation for SysML-Informed Approach" \
  --body-file 05-update-documentation.md \
  --label "documentation,phase-3,maintenance"
```

### Option 3: Via GitHub Web UI

For each issue file:

1. Go to https://github.com/rothnic/udd/issues/new
2. Copy the title (first line without `#`)
3. Copy the entire content as body
4. Add labels from the `**Labels:**` line
5. Click "Submit new issue"

## About These Issues

These 5 issues represent a simplified approach to enhancing UDD with SysML principles:

- **Focus:** Use SysML thinking to create better feature scenarios
- **Philosophy:** Enhance existing artifacts, don't add new layers
- **Timeline:** 2-3 weeks (vs 8-10 weeks for original 12-issue plan)
- **Outcome:** Better requirements without added complexity
