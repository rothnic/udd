# Fix perf_capture requirement schema mismatch (@Sisyphus-Junior subagent)

**ID**: ses_36ef09819ffeOELSYSyXk3ODcP
**Project ID**: ad761ea6174e58ed763fc75290c3f403ed51079d
**Created**: 2/24/2026, 1:10:31 PM
**Stats**: 2 files changed, +19 -28

---

## USER (1:10:32 PM)

id: tasks/quick_capture
area: tasks
name: Quick Capture
summary: Quick capture for task recording
phase: 1
kind: core
scenarios:
  - mobile_widget
  - voice_input


key: perf_capture
type: non_functional
feature: specs/features/tasks/quick_capture
scenarios:
  - mobile_widget
  - voice_input
description: |
  Performance SLO for the Task Service create operation when handling quick-capture flows.
  Constrains server-side task creation latency so lightweight clients (mobile widget, voice input,
  desktop shortcut) feel near-instant capture.
use_cases:
  - specs/use-cases/capture_task.yml
notes:
  - "Scope: server-side processing for POST /api/v1/tasks. Measurement excludes client network and on-device transcription."
  - "Offline queuing and sync are out of scope for this requirement and may have separate SLOs."
service_level_objective:
  target: "<100ms"
  metric: "server-side latency for task creation (time from request received to persistence acknowledged)"
  percentile: 95
  measurement_window: 5m
  success_rate: ">=99% of requests under target at steady-state"
measurement_conditions:
  load_assumptions: |
    - Measured under light write load representative of quick-capture traffic: average 10 req/s per region, burst up to 100 req/s for 60s
  env: production-like, cold-starts excluded from percentile calculation
  collection: |
    - Use distributed tracing and histogram aggregation on the server-side persistence path
    - Record time from HTTP request accept to successful write to the Inbox Store and event bus emission
verification:
  method: "Operational monitoring and synthetic tests"
  checks: |
    - Synthetic tests should POST /api/v1/tasks and assert server-side timing metrics meet target
    - Alert when 95th percentile >100ms over 5m window or success_rate drops below target


## USER (1:20:47 PM)

key: perf_capture
type: non_functional
feature: tasks/quick_capture
scenarios:
  - mobile_widget
  - voice_input
description: |
  Performance SLO for the Task Service create operation when handling quick-capture flows.
  Constrains server-side task creation latency so lightweight clients (mobile widget, voice input,
  desktop shortcut) feel near-instant capture.
use_cases:
  - specs/use-cases/capture_task.yml
notes:
  - "Scope: server-side processing for POST /api/v1/tasks. Measurement excludes client network and on-device transcription."
  - "Offline queuing and sync are out of scope for this requirement and may have separate SLOs."
service_level_objective:
  target: "<100ms"
  metric: "server-side latency for task creation (time from request received to persistence acknowledged)"
  percentile: 95
  measurement_window: 5m
  success_rate: ">=99% of requests under target at steady-state"
measurement_conditions:
  load_assumptions: |
    - Measured under light write load representative of quick-capture traffic: average 10 req/s per region, burst up to 100 req/s for 60s
  env: production-like, cold-starts excluded from percentile calculation
  collection: |
    - Use distributed tracing and histogram aggregation on the server-side persistence path
    - Record time from HTTP request accept to successful write to the Inbox Store and event bus emission
verification:
  method: "Operational monitoring and synthetic tests"
  checks: |
    - Synthetic tests should POST /api/v1/tasks and assert server-side timing metrics meet target
    - Alert when 95th percentile >100ms over 5m window or success_rate drops below target


