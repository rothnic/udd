import fs from "node:fs/promises";
import path from "node:path";

export const CODEX_HOOKS_JSON = `${JSON.stringify(
	{
		hooks: {
			UserPromptSubmit: [
				{
					hooks: [
						{
							type: "command",
							command: ".codex/hooks/pre-task.sh",
							timeout: 10,
						},
					],
				},
			],
		},
	},
	null,
	"\t",
)}
`;

export const CODEX_PRE_TASK_HOOK = `#!/usr/bin/env bash
# Pre-task health check for Codex sessions (non-blocking).
set -euo pipefail

echo "Codex Pre-Task Health Check"

run_udd() {
\tif [ -f "bin/udd.ts" ] && [ -d "node_modules/tsx" ]; then
\t\tnode --import tsx bin/udd.ts "$@"
\telif command -v udd >/dev/null 2>&1; then
\t\tudd "$@"
\telse
\t\treturn 127
\tfi
}

if run_udd --help >/dev/null 2>&1; then
\tprintf "\\n--- udd health-check ---\\n"
\trun_udd health-check || true

\tprintf "\\n--- udd doctor ---\\n"
\trun_udd doctor || true
else
\techo "udd CLI not found; skipping udd health-check and udd doctor"
fi

printf "\\n--- git status --short ---\\n"
git status --short || true

printf "\\nPre-task health check complete. This hook is advisory only and will not block the task.\\n"
exit 0
`;

export interface InstallCodexHooksOptions {
	force?: boolean;
}

export interface InstallCodexHooksResult {
	written: string[];
	unchanged: string[];
}

async function writeManagedFile(
	filePath: string,
	content: string,
	options: InstallCodexHooksOptions,
): Promise<"written" | "unchanged"> {
	try {
		const existing = await fs.readFile(filePath, "utf8");
		if (existing === content) return "unchanged";
		if (!options.force) {
			throw new Error(
				`${path.relative(process.cwd(), filePath)} already exists with different content. Re-run with --force to overwrite.`,
			);
		}
	} catch (error) {
		if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
			throw error;
		}
	}

	await fs.writeFile(filePath, content);
	return "written";
}

export async function installCodexHooks(
	rootDir = process.cwd(),
	options: InstallCodexHooksOptions = {},
): Promise<InstallCodexHooksResult> {
	const codexDir = path.join(rootDir, ".codex");
	const hooksDir = path.join(codexDir, "hooks");
	const hooksJsonPath = path.join(codexDir, "hooks.json");
	const preTaskPath = path.join(hooksDir, "pre-task.sh");
	const result: InstallCodexHooksResult = { written: [], unchanged: [] };

	await fs.mkdir(hooksDir, { recursive: true });

	for (const [filePath, content] of [
		[hooksJsonPath, CODEX_HOOKS_JSON],
		[preTaskPath, CODEX_PRE_TASK_HOOK],
	] as const) {
		const status = await writeManagedFile(filePath, content, options);
		result[status].push(path.relative(rootDir, filePath));
	}

	await fs.chmod(preTaskPath, 0o755);

	return result;
}
