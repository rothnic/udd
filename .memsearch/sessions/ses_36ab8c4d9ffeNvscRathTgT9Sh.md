# Implement Task 2 explicit system boundary model (@Sisyphus-Junior subagent)

**ID**: ses_36ab8c4d9ffeNvscRathTgT9Sh
**Project ID**: ad761ea6174e58ed763fc75290c3f403ed51079d
**Created**: 2/25/2026, 8:49:59 AM
**Stats**: 1 files changed, +76 -0

---

## USER (8:49:59 AM)

# System boundary definition for UDD - Phase 2
# This YAML defines the system-under-design (boundary subject), what is in-scope,
# out-of-scope, and explicit external actors and external systems with type markers.

boundary_subject: udd-core

# Criteria for items considered inside the system boundary. Keep these atomic and
# deterministic so udd tooling can make decisions programmatically.
in_scope:
  - id: scenario-and-test-mapping
    summary: "All .feature scenario files, use-case YAMLs, and tests that implement those scenarios"
    criteria:
      - "Files under specs/features/** are authoritative for user-facing behavior"
      - "Tests under tests/** that map to scenario paths are implementation verification"

  - id: udd-cli-and-spec-generation
    summary: "CLI commands and sync tooling that generate or update spec artifacts"
    criteria:
      - "bin/udd, templates/, and scripts/ that produce specs or manifest entries"

  - id: artefact-metadata
    summary: "Manifest and mapping metadata used for traceability"
    criteria:
      - "specs/.udd/manifest.yml and any use-case YAMLs that reference scenario paths"

out_of_scope:
  - id: runtime-implementation
    summary: "Application runtime code and services that implement requirements"
    rules:
      - "Source code under src/ and implementation tests that are not direct scenario-verifications are outside the boundary"

  - id: external-hosted-services
    summary: "Third-party services and external infrastructure not owned by project"
    rules:
      - "External CI, hosted DBs, analytics, auth providers are considered external systems"

# Explicit external markers. These name external entities and classify them so tooling
# and reviewers can unambiguously tell them apart from internal actors/components.
external_actors:
  - name: ProductOwner
    type: human
    description: "Person who authors journeys and approves scenarios (document-only actor)."

  - name: EndUser
    type: human
    description: "Representative persona consuming the delivered behavior in scenarios."

external_systems:
  - name: CI_System
    type: external_system
    provider: "external-ci"
    description: "Continuous integration system that runs tests, not part of udd-core boundary."

  - name: Hosted_DB
    type: external_system
    provider: "cloud-db"
    description: "Persistent storage hosted outside repository scope; implementation-level dependency."

# Boundary leakage examples (invalid usages). These are explicit negative examples that
# tooling or reviewers should flag as boundary violations.
boundary_leakage_invalid_examples:
  - id: duplicate-scenario-text-in-journey
    description: "Embedding Given/When/Then scenario text inside product/journeys/*.md instead of referencing scenario path"
    why: "Violates single source of truth; moves scenario text outside specs/features and confuses traceability"

  - id: declaring-internal-service-as-external
    description: "Listing an internal component (src/task_service) under external_systems or actors"
    why: "Creates ambiguity about ownership; internal components must be documented under specs/components or code, not as external_systems"

  - id: external-system-treated-as-in-scope
    description: "Adding CI_System to in_scope or treating Hosted_DB as owned internal storage"
    why: "Misclassifies external dependencies as internal, which prevents correct risk and planning decisions"

notes:
  - "Boundary subject name 'udd-core' chosen to align with package and README naming and to avoid using generic 'system' which caused ambiguity in earlier work."
  - "Keep in_scope focused on artifacts and tooling that are part of the spec-first workflow only. Implementation code is explicitly out_of_scope."


