# Update Documentation for SysML-Informed Approach

**Labels:** documentation, phase-3, maintenance

## Overview

Update existing documentation (README, AGENTS.md, CONTRIBUTING.md) to reflect the SysML-informed approach to creating better feature scenarios.

## Changes Already Made ✅

The recent SysML merge already updated:
- ✅ `docs/sysml-informed-discovery.md` - Complete guide created
- ✅ `AGENTS.md` - Added SysML discovery section
- ✅ `specs/VISION.md` - Updated goals

## Remaining Documentation Updates

### 1. README.md

Add section after "How It Works":

```markdown
## Creating Rich Feature Scenarios

UDD uses SysML principles to create better feature scenarios without adding complexity.

### Start with User Needs
- **Who** needs this?
- **What** are they trying to accomplish?
- **Why** does it matter?

### Get Agent Help
```bash
udd discover feature <domain>/<name>
```

See `docs/sysml-informed-discovery.md` for detailed examples.
```

### 2. CONTRIBUTING.md

Add section on writing features with SysML-informed approach.

### 3. docs/getting-started.md

Update feature creation section to use discovery workflow.

### 4. Create Quick Reference Card

**File:** `docs/feature-checklist.md`

Checklist for creating complete features.

## Acceptance Criteria

- [ ] README.md updated with SysML-informed section
- [ ] CONTRIBUTING.md explains feature creation process
- [ ] docs/getting-started.md updated
- [ ] Feature checklist created
- [ ] All docs reference SysML guide
- [ ] Links between docs work

## Benefits

**For New Users:**
- 🎓 Clear guidance on methodology
- 📚 Examples to learn from
- ✅ Checklist so nothing is missed

**For Existing Users:**
- 📖 Updated guidance reflects current approach
- 🔗 Easy cross-references between docs
