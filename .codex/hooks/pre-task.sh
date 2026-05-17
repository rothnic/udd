#!/usr/bin/env bash
# Pre-task health check for Codex sessions (non-blocking).
set -euo pipefail

echo "Codex Pre-Task Health Check"

run_udd() {
	if [ -f "bin/udd.ts" ] && [ -d "node_modules/tsx" ]; then
		node --import tsx bin/udd.ts "$@"
	elif command -v udd >/dev/null 2>&1; then
		udd "$@"
	else
		return 127
	fi
}

if run_udd --help >/dev/null 2>&1; then
	printf "\n--- udd health-check ---\n"
	run_udd health-check || true

	printf "\n--- udd doctor ---\n"
	run_udd doctor || true
else
	echo "udd CLI not found; skipping udd health-check and udd doctor"
fi

printf "\n--- git status --short ---\n"
git status --short || true

printf "\nPre-task health check complete. This hook is advisory only and will not block the task.\n"
exit 0
