# Analysis Summary: UDD Requirements Model & SysML Alignment

**Date:** 2026-01-04  
**Issue:** Analyze full conversation regarding UDD, SysML, and user journeys  
**Branch:** `copilot/analyze-user-journeys-issues`

## Problem Statement Addressed

The problem statement requested analysis of concerns related to:
1. UDD requirements model
2. SysML and its proper characterization
3. User journeys driving requirements
4. Setting foundation for system-level functional requirements

## Key Finding: SysML is NOT Always "White Box"

### The Misconception

The backlog issues (LEAN-REQUIREMENTS-ISSUES.md) proposed a "black box only" approach:
- Use cases limited to ~30 lines
- External actors only
- No internal component modeling

This was **too restrictive** and based on a misunderstanding of SysML.

### The Reality

SysML supports **three levels of abstraction**:

1. **Black Box** - External behavior (what the system does)
2. **Grey Box** - Functional analysis (how functions collaborate) ⭐
3. **White Box** - Implementation (how it's built)

**Grey box is NOT white box.** It specifies:
- ✅ Functional workflows
- ✅ Component interactions
- ✅ Data flows between functions
- ❌ NOT technology choices
- ❌ NOT implementation architecture
- ❌ NOT code structure

## Analysis Conducted

### 1. Research Document Created
**Location:** `specs/research/requirements-model-analysis/README.md`

**Contents:**
- Problem definition and context
- Three alternatives evaluated (black box only, grey box, hybrid)
- Weighted evaluation (Option B: Grey Box scored 92/100)
- Detailed findings on SysML principles
- Recommended implementation approach
- Action items and follow-up work

### 2. Comprehensive Guide Created
**Location:** `docs/functional-requirements.md`

**Contents:**
- Explanation of black/grey/white box abstraction levels
- When and how to use grey-box functional analysis
- Complete examples (simple and complex use cases)
- Do's and don'ts for writing functional workflows
- Integration with UDD workflow
- Validation guidelines

### 3. Documentation Updated

#### VISION.md
- Added explicit goals for grey-box functional analysis
- Added goal to bridge user journeys to system-level functional requirements

#### AGENTS.md
- Added section on requirements levels
- Guidance on when to use grey-box analysis
- Rules for functional workflow specifications
- Clarification that grey-box ≠ white-box

#### LEAN-REQUIREMENTS-ISSUES.md
- Added critical findings section
- Documented that issues #02 and #04 need revision
- Referenced analysis document

#### specs/research/README.md
- Added new research entry for requirements model analysis

### 4. Example Use Case Enhanced

**File:** `specs/use-cases/orchestrated_iteration.yml`

Enhanced with `functional_workflow` showing:
- Four workflow steps (initialize, delegate, monitor, evaluate)
- Functional components for each step
- Interactions between components
- No implementation details (technology-agnostic)

## All Concerns Addressed

### ✅ UDD Requirements Model
- Comprehensive analysis in research document
- Clear articulation of three abstraction levels
- Integration with existing UDD workflow

### ✅ SysML Proper Characterization
- Documented that SysML includes grey-box functional analysis
- Explained difference between functional workflows and implementation
- Aligned UDD with SysML systems engineering principles

### ✅ User Journeys Driving Requirements
- Updated VISION.md to make this explicit goal
- Documented traceability: Journeys → Use Cases (grey-box) → Scenarios (black-box) → Tests → Code
- Showed how grey-box bridges intent to implementation

### ✅ System-Level Functional Requirements
- Grey-box functional workflows enable this
- Component interaction modeling provides system-level view
- Foundation set for exercising user needs at functional level

## Backlog Issues Needing Revision

### Issue #02: Simplify Use Case Schema
**Current:** "black box, ~30 lines"
**Should be:** "Support both black-box (simple) and grey-box (with optional functional workflows)"

### Issue #04: Update Actor Model
**Current:** "External actors only, remove internal components"
**Should be:** "Distinguish external actors from internal functional components. Both needed for complete requirements model."

### Issue #09: Create Core Documentation
**Enhancement:** Should include grey-box functional analysis guidance (now available in `docs/functional-requirements.md`)

## Implementation Roadmap

### Phase 1: Schema Enhancement (Phase 3)
- [ ] Update use case schema to support optional `functional_workflow` field
- [ ] Add Zod validation for functional workflows
- [ ] Update templates with examples

### Phase 2: Tooling Support (Phase 3)
- [ ] `udd query use-case <id>` - Show functional workflows
- [ ] `udd lint` - Validate functional workflows
- [ ] `udd new use-case` - Template with optional workflow section

### Phase 3: Intelligence Features (Phase 4)
- [ ] `udd analyze functional-coverage` - Coverage metrics
- [ ] `udd suggest functional-workflow` - AI-assisted decomposition
- [ ] Enhanced completeness checking

## Key Principles Established

1. **Three Levels of Abstraction**
   - Black box: External behavior (BDD scenarios)
   - Grey box: Functional workflows (use cases)
   - White box: Implementation (code)

2. **Grey Box Guidelines**
   - Specify functional component interactions
   - Remain implementation-agnostic
   - Bridge user journeys to behavior specs
   - Optional for simple use cases, valuable for complex ones

3. **Separation of Concerns**
   - Requirements (WHAT & functional HOW) ≠ Architecture (implementation HOW)
   - Functional analysis ≠ Architectural design
   - System-level view ≠ Code-level view

4. **Traceability Chain**
   ```
   User Journeys (intent)
       ↓
   Use Cases with Functional Workflows (functional requirements)
       ↓
   BDD Scenarios (behavioral specifications)
       ↓
   E2E Tests (verification)
       ↓
   Code (implementation)
   ```

## Files Created/Modified

### Created
- `specs/research/requirements-model-analysis/README.md` (13K)
- `docs/functional-requirements.md` (11K)

### Modified
- `specs/VISION.md` - Added grey-box goals
- `AGENTS.md` - Added requirements levels guidance
- `LEAN-REQUIREMENTS-ISSUES.md` - Added critical findings
- `specs/research/README.md` - Added research entry
- `specs/use-cases/orchestrated_iteration.yml` - Added functional workflow example

## Validation

All concerns from the problem statement have been addressed:

✅ **"sysml being called white box isn't always correct"**
   - Documented thoroughly that SysML includes grey-box functional analysis
   - Explained three levels of abstraction

✅ **"sysml does desire functional analysis that is kind of grey box"**
   - Created comprehensive guide on grey-box functional workflows
   - Provided examples and guidelines

✅ **"specify functional workflows to identify how functional sub components work together"**
   - Added `functional_workflow` schema design
   - Enhanced use case example
   - Documented interaction modeling

✅ **"without specifying the exact implementation architecture"**
   - Clear guidelines on what is/isn't grey-box
   - Do's and don'ts section
   - Validation guidelines

✅ **"set a foundation in place to fully exercise the user needs and functional requirements at a system level"**
   - Updated VISION.md with explicit goals
   - Created traceability chain
   - Established principles for system-level functional analysis

## Next Steps

1. **Review** this analysis and documentation
2. **Approve** grey-box functional analysis approach
3. **Revise** issues #02 and #04 in the backlog
4. **Implement** schema changes to support `functional_workflow`
5. **Enhance** remaining use cases where beneficial
6. **Build** tooling support for functional workflows

## References

- Research Document: `specs/research/requirements-model-analysis/README.md`
- Implementation Guide: `docs/functional-requirements.md`
- Example Use Case: `specs/use-cases/orchestrated_iteration.yml`
- Updated Vision: `specs/VISION.md`
- Agent Guidance: `AGENTS.md`

---

**Conclusion:** UDD now has a solid foundation for supporting grey-box functional analysis aligned with SysML principles, enabling user journeys to drive system-level functional requirements while maintaining clear separation between requirements and implementation architecture.
