#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

export PATH="${HOME}/.bun/bin:${PATH}"

if ! command -v bun >/dev/null 2>&1; then
	echo "Bun is required for Codex verification. Expected it at ${HOME}/.bun/bin/bun or on PATH." >&2
	exit 1
fi

if [[ ! -f node_modules/tsx/dist/loader.mjs || ! -f node_modules/vitest/vitest.mjs ]]; then
	bash scripts/codex-setup.sh
fi

./bin/udd status
./bin/udd lint
UDD_TEST_RUNTIME=bun ./bin/udd test "$@"
