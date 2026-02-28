# Create Layer 4 component spec document (@Sisyphus-Junior subagent)

**ID**: ses_36f03e24effeN7MTuc4Xvit9d8
**Project ID**: ad761ea6174e58ed763fc75290c3f403ed51079d
**Created**: 2/24/2026, 12:49:27 PM
**Stats**: 1 files changed, +133 -0

---

## USER (12:49:27 PM)

# Component: Task Service

Layer: 4 - Component

Summary
-------
The Task Service is the backend component responsible for creating, validating, and storing user tasks captured via lightweight entry points. It provides a concise REST API used by mobile quick-capture widgets, voice capture flows, and desktop shortcuts. The component focuses only on capture, validation, and persistence for the inbox; richer task management (editing, assigning, workflows) is out of scope and handled by other components.

Actor
-----
- team_member (see product/actors.md)

Alignment
---------
- Supports the "Capture Task" use case defined in specs/use-cases/capture_task.yml. Primary scenarios: mobile_widget, voice_input, desktop_shortcut. Offline_sync is noted but deferred to Phase 2 and is not implemented by this component spec.

Responsibilities
----------------
- Accept task capture requests from lightweight clients (mobile widget, voice input, desktop shortcut)
- Validate incoming payloads and return actionable errors
- Persist a minimal task representation to the Inbox store
- Emit events for downstream processing (indexing, sync, notifications) via an internal event bus
- Rate-limit and idempotency support for duplicate protection

REST API
--------
Base path: /api/v1/tasks

1) Create Task

  POST /api/v1/tasks

  Purpose: Create a new task in the user's inbox from a quick-capture source.

  Request (application/json)
  - Headers:
    - Authorization: Bearer <token>
    - Content-Type: application/json

  - Body schema (required fields):
    {
      "title": string,            # short text, 1-200 chars
      "notes"?: string,           # optional longer description
      "source": "mobile_widget" | "voice_input" | "desktop_shortcut", # origin
      "created_at"?: string,      # ISO 8601, optional client timestamp
      "client_id"?: string        # optional client-generated idempotency key
    }

  Success Response (201 Created)
  - Body:
    {
      "id": string,               # server id (uuid)
      "title": string,
      "notes"?: string,
      "inbox": true,
      "created_at": string
    }

  Error Responses
  - 400 Bad Request: validation failed (body missing title, title too long, invalid source)
    { "error": "validation_error", "details": { "title": "required" } }
  - 401 Unauthorized: missing or invalid auth
  - 409 Conflict: duplicate (client_id already used within deduplication window)
  - 429 Too Many Requests: rate limiting exceeded
  - 500 Internal Server Error: persistent store or bus failure

  Notes:
  - Server must enforce idempotency when client_id is provided. Duplicate submissions with same client_id within a 5 minute window should return 200/201 with existing resource or 409 depending on implementation choice (document chosen behavior).
  - created_at from client may be accepted but server authoritative timestamp will be returned in response.

Validation Rules
----------------
- title: required, trimmed, length 1-200 characters
- notes: optional, max 4000 characters
- source: required, one of allowed enum values
- client_id: optional, alphanumeric and hyphen, max 64 chars

Use Cases Supported
-------------------
- mobile_widget: quick text capture from lock-screen or widget. Matches specs/features/tasks/quick_capture/mobile_widget.feature.
- voice_input: create via speech-to-text flow. Matches specs/features/tasks/quick_capture/voice_input.feature. Server accepts confirmed transcription only.
- desktop_shortcut: create from a lightweight desktop entry point or global hotkey. Scenario listed in specs/use-cases/capture_task.yml but feature file lives elsewhere.

Excluded / Deferred
--------------------
- Offline capture and background sync are deferred to Phase 2 (specs/use-cases/capture_task.yml coverage_gaps). This component will provide APIs that support client-side queuing but does not define sync protocols here.
- Full task editing, assignment, project linkage, or scheduling. Those are Layer 4+ responsibilities for Task Manager component.

Dependencies
------------
Internal
- Auth Service: verifies bearer tokens and maps to user id (expected interface: token introspection endpoint or JWT verification library)
- Inbox Store: persistent datastore for minimal task records (expected contract: insert, get_by_id, get_by_client_id)
- Event Bus: internal pub/sub for downstream services (notifications, search indexing, sync)

External
- Push Notification service: to show confirmation notifications on mobile lock-screen if required (async)
- Speech-to-text provider: voice capture clients are expected to transcribe on-device or via dedicated service. Task Service only receives the confirmed transcription text.

Operational Concerns
--------------------
- Idempotency window: recommended 5 minutes for client_id dedupe
- Rate limits: 60 requests per minute per user by default; adjust via config
- Monitoring: track create success rate, validation errors (400), auth failures (401), duplication (409), and latency to persist
- Privacy: tasks are user-scoped; ensure storage encryption at rest and transport TLS

API Examples
------------
Request example

  POST /api/v1/tasks
  Authorization: Bearer ey...
  {
    "title": "Buy milk",
    "source": "mobile_widget",
    "client_id": "mwidget-20260224-01"
  }

Response example (201)

  {
    "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "title": "Buy milk",
    "inbox": true,
    "created_at": "2026-02-24T12:34:56Z"
  }

Appendix: Mapping to Capture Task Use Cases
------------------------------------------
- capture_task.yml scenarios mapped:
  - mobile_widget -> specs/features/tasks/quick_capture/mobile_widget.feature
  - voice_input -> specs/features/tasks/quick_capture/voice_input.feature
  - desktop_shortcut -> scenario listed in use-case, implementation clients expected to call POST /api/v1/tasks


