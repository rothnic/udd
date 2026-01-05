#!/bin/bash
# Simple script to create all 5 GitHub issues
# Run this with: bash create-issues-simple.sh

REPO="rothnic/udd"

echo "Creating 5 GitHub issues for UDD SysML-informed enhancements..."
echo

# Issue 1
echo "Creating Issue #1: Use SysML Principles to Enhance Feature Scenarios"
gh issue create \
  --repo "$REPO" \
  --title "Use SysML Principles to Enhance Feature Scenarios" \
  --body-file 01-sysml-informed-feature-scenarios.md \
  --label "enhancement"

# Issue 2
echo "Creating Issue #2: Add Query Commands for Agent Access to Requirements"
gh issue create \
  --repo "$REPO" \
  --title "Add Query Commands for Agent Access to Requirements" \
  --body-file 02-query-commands-for-agents.md \
  --label "enhancement"

# Issue 3
echo "Creating Issue #3: Enhance Feature Discovery Workflow"
gh issue create \
  --repo "$REPO" \
  --title "Enhance Feature Discovery Workflow" \
  --body-file 03-enhance-discovery-workflow.md \
  --label "enhancement"

# Issue 4
echo "Creating Issue #4: Add Feature Template with SysML Context"
gh issue create \
  --repo "$REPO" \
  --title "Add Feature Template with SysML Context" \
  --body-file 04-feature-template.md \
  --label "enhancement"

# Issue 5
echo "Creating Issue #5: Update Documentation for SysML-Informed Approach"
gh issue create \
  --repo "$REPO" \
  --title "Update Documentation for SysML-Informed Approach" \
  --body-file 05-update-documentation.md \
  --label "documentation"

echo
echo "✓ All 5 issues created successfully!"
