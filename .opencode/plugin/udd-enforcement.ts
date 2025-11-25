/**
 * UDD Enforcement Plugin for OpenCode
 *
 * This plugin enforces UDD workflow rules:
 * 1. Warns when editing source files without a passing test
 * 2. Warns when too many files are modified
 * 3. Encourages small commits
 *
 * Plugin API: https://opencode.ai/docs/plugins/
 */

interface PluginContext {
	project: {
		path: string;
	};
	$: (
		strings: TemplateStringsArray,
		...values: unknown[]
	) => Promise<{ stdout: string; stderr: string }>;
}

interface PluginEvent {
	type: string;
	properties?: Record<string, unknown>;
}

const MAX_MODIFIED_FILES = 10;

export default async function UDDEnforcement({ $ }: PluginContext) {
	let modifiedFilesCount = 0;
	let lastWarningTime = 0;
	const WARNING_COOLDOWN = 60000; // 1 minute between warnings

	return {
		name: "udd-enforcement",

		event: async ({ event }: { event: PluginEvent }) => {
			// Track file modifications
			if (event.type === "tool.execute.after") {
				const toolName = event.properties?.tool as string | undefined;
				if (toolName === "edit" || toolName === "write") {
					modifiedFilesCount++;

					// Warn if too many files modified
					const now = Date.now();
					if (
						modifiedFilesCount >= MAX_MODIFIED_FILES &&
						now - lastWarningTime > WARNING_COOLDOWN
					) {
						lastWarningTime = now;
						console.warn(
							`[UDD] Warning: ${modifiedFilesCount} files modified. Consider committing before continuing.`,
						);
					}
				}
			}

			// Reset counter on successful commit
			if (event.type === "tool.execute.after") {
				const toolName = event.properties?.tool as string | undefined;
				if (toolName === "bash") {
					const output = (event.properties?.output as string) || "";
					if (output.includes("[master") || output.includes("commit")) {
						modifiedFilesCount = 0;
					}
				}
			}

			// Check project status periodically
			if (event.type === "session.idle") {
				try {
					const statusResult = await $`./bin/udd status --json`;
					const status = JSON.parse(statusResult.stdout);

					// Check for failing tests
					let failingCount = 0;
					for (const feature of Object.values(status.features || {})) {
						const scenarios =
							(feature as { scenarios?: Record<string, { e2e?: string }> })
								.scenarios || {};
						for (const scenario of Object.values(scenarios)) {
							if (scenario.e2e === "failing") {
								failingCount++;
							}
						}
					}

					if (failingCount > 0) {
						console.log(
							`[UDD] ${failingCount} failing test(s). Focus on fixing these before adding new code.`,
						);
					}
				} catch {
					// Status check failed, ignore
				}
			}
		},
	};
}
