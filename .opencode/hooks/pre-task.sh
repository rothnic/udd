#!/usr/bin/env bash
# Pre-task health check for agents (non-blocking)
set -euo pipefail

echo "🔍 Agent Pre-Task Health Check"

# Show summary status (if udd available)
if command -v udd >/dev/null 2>&1; then
  echo "\n--- udd status --summary ---"
  udd status --summary || true
else
  echo "udd CLI not found in PATH; skipping 'udd status --summary'"
fi

# Count stub assertions in Phase 3 test-governance tests
# Look for explicit banned patterns used for stubs
STUB_COUNT=0
if command -v rg >/dev/null 2>&1; then
  # Search common test folders for the banned stub pattern
  STUB_COUNT=$(rg --hidden --no-ignore -n "expect\(true\)\.toBe\(true\)|expect\(true\)\.toBeTruthy\(|expect\(false\)\.not\.toBe\(false\)" tests/ || true)
  if [ -n "$STUB_COUNT" ]; then
    # rg prints matching lines; count them
    STUB_COUNT=$(echo "$STUB_COUNT" | wc -l)
  else
    STUB_COUNT=0
  fi
else
  # fallback to grep if rg unavailable
  if [ -d "tests" ]; then
    STUB_COUNT=$(grep -R --line-number -E "expect\(true\)\.toBe\(true\)|expect\(true\)\.toBeTruthy\(|expect\(false\)\.not\.toBe\(false\)" tests/ | wc -l || true)
  else
    STUB_COUNT=0
  fi
fi

if [ "$STUB_COUNT" -gt 0 ]; then
  echo "\n⚠️  WARNING: Found $STUB_COUNT stub assertion(s) in Phase 3 tests."
  echo "These must be removed or converted to real assertions before committing or pushing."
else
  echo "\n✅ No banned stub assertions found in tests/"
fi

# Show a brief project health summary
echo "\n--- Project Health ---"
if command -v udd >/dev/null 2>&1; then
  # udd doctor may present useful guidance; run but don't fail
  udd doctor || true
else
  echo "udd CLI not available; cannot run udd doctor"
fi

echo "\nPre-task health check complete. This hook is advisory only and will not block the task."
exit 0
