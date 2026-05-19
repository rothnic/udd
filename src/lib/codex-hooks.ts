import fs from "node:fs/promises";
import path from "node:path";

const CODEX_HOOK_COMMAND = ".codex/hooks/pre-task.sh";
const CODEX_HOOK_GROUP = {
	hooks: [
		{
			type: "command",
			command: CODEX_HOOK_COMMAND,
			timeout: 10,
		},
	],
};
type CodexHooksConfig = {
	hooks?: Record<string, unknown>;
	[key: string]: unknown;
};

function createDefaultHooksConfig(): CodexHooksConfig {
	return {
		hooks: {
			UserPromptSubmit: [CODEX_HOOK_GROUP],
		},
	};
}

function formatHooksConfig(config: CodexHooksConfig): string {
	return `${JSON.stringify(config, null, "\t")}\n`;
}

export const CODEX_PRE_TASK_HOOK = `#!/usr/bin/env bash
# Pre-task health check for Codex sessions (non-blocking).
set -euo pipefail

echo "Codex Pre-Task Health Check"

run_udd() {
\tif [ -x "node_modules/.bin/udd" ]; then
\t\tnode_modules/.bin/udd "$@"
\telif command -v udd >/dev/null 2>&1; then
\t\tudd "$@"
\telse
\t\treturn 127
\tfi
}

if run_udd --help >/dev/null 2>&1; then
\tprintf "\\n--- udd status ---\\n"
\trun_udd status || true

\tprintf "\\n--- udd status --doctor ---\\n"
\trun_udd status --doctor || true
else
\techo "udd CLI not found; skipping udd status checks"
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

function hasCodexHook(group: unknown): boolean {
	if (!group || typeof group !== "object" || !("hooks" in group)) {
		return false;
	}

	const hooks = (group as { hooks?: unknown }).hooks;
	if (!Array.isArray(hooks)) return false;

	return hooks.some((hook) => {
		return (
			hook !== null &&
			typeof hook === "object" &&
			(hook as { command?: unknown }).command === CODEX_HOOK_COMMAND
		);
	});
}

async function writeHooksJson(
	filePath: string,
	options: InstallCodexHooksOptions,
): Promise<"written" | "unchanged"> {
	let config: CodexHooksConfig;

	try {
		const existing = await fs.readFile(filePath, "utf8");
		try {
			config = JSON.parse(existing) as CodexHooksConfig;
		} catch (_error) {
			if (!options.force) {
				throw new Error(
					`${path.relative(process.cwd(), filePath)} is not valid JSON. Re-run with --force to replace it.`,
				);
			}
			config = {};
		}

		if (!config || typeof config !== "object" || Array.isArray(config)) {
			if (!options.force) {
				throw new Error(
					`${path.relative(process.cwd(), filePath)} must contain a JSON object. Re-run with --force to replace it.`,
				);
			}
			config = {};
		}

		if (
			config.hooks &&
			(typeof config.hooks !== "object" || Array.isArray(config.hooks))
		) {
			if (!options.force) {
				throw new Error(
					`${path.relative(process.cwd(), filePath)} has an unsupported hooks field. Re-run with --force to replace it.`,
				);
			}
			config.hooks = {};
		} else {
			config.hooks = config.hooks ?? {};
		}

		let promptHooks: unknown[] = [];
		if (config.hooks.UserPromptSubmit !== undefined) {
			if (!Array.isArray(config.hooks.UserPromptSubmit)) {
				if (!options.force) {
					throw new Error(
						`${path.relative(process.cwd(), filePath)} has an unsupported UserPromptSubmit hook list. Re-run with --force to replace it.`,
					);
				}
			} else {
				promptHooks = config.hooks.UserPromptSubmit;
			}
		}

		if (promptHooks.some(hasCodexHook)) {
			return "unchanged";
		}

		config.hooks.UserPromptSubmit = [...promptHooks, CODEX_HOOK_GROUP];
	} catch (error) {
		if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
			throw error;
		}
		config = createDefaultHooksConfig();
	}

	await fs.writeFile(filePath, formatHooksConfig(config));
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

	const hooksJsonStatus = await writeHooksJson(hooksJsonPath, options);
	result[hooksJsonStatus].push(path.relative(rootDir, hooksJsonPath));

	const preTaskStatus = await writeManagedFile(
		preTaskPath,
		CODEX_PRE_TASK_HOOK,
		options,
	);
	result[preTaskStatus].push(path.relative(rootDir, preTaskPath));

	await fs.chmod(preTaskPath, 0o755);

	return result;
}
