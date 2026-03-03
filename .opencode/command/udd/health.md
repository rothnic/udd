---
description: Check UDD project health status
---

# udd health

Quick health check for UDD projects.

## Usage

```bash
udd health          # Show health summary
udd health --full   # Show detailed report
```

## What It Checks

- ✓ Stub assertions (should be 0)
- ✓ Drift issues (should be 0 critical)
- ✓ Test status (outcomes satisfied)
- ✓ Outcome satisfaction rate

## Exit Codes

- 0: Healthy
- 1: Issues found (check output)
