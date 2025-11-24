---
id: "udd_tool"
name: "User Driven Development Tool"
version: "0.0.1"
current_phase: 1
phases:
  1: "Core CLI & Validation"
  2: "Agent Intelligence & WIP Management"
  3: "Advanced Workflows"
goals:
  - "Make user-facing scenarios the single source of truth"
  - "Keep everything simple, discoverable, and deterministic"
  - "Enforce guardrails against spec/test tampering"
use_cases:
  - "validate_specs"
  - "check_status"
---

# Vision

The UDD tool provides a CLI to manage the lifecycle of features in a User Driven Development process. It ensures that specs are the source of truth and that features are only considered done when their E2E tests pass.

## References

*   [Custom Agent File Structure](https://code.visualstudio.com/docs/copilot/customization/custom-agents#_custom-agent-file-structure)
*   [Prompt Files](https://code.visualstudio.com/docs/copilot/customization/prompt-files)

