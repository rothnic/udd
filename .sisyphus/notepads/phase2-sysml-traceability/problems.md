Problem notes:

- The repo contains many `.memsearch` session files that can be noisy in git status and can interfere with staged-commit detection by some pre-commit tooling.

- LSP yaml-language-server was not installed initially; lsp_diagnostics could not run until it was installed.

Mitigation:
- Recommend adding `.memsearch/` to `.gitignore` or moving session files out of the repo workspace if they don't need versioning.

Timestamp: 2026-03-01
