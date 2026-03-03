/**
 * UDD Enforcement Plugin for OpenCode
 *
 * Enforces UDD workflow best practices:
 * - Warns when too many files are modified without committing
 * - Tracks file changes via git status or SDK events
 * - Displays warnings via TUI toast notifications
 * - Checks drift before file write operations
 *
 * Configuration: .opencode/plugin/udd-enforcement.yml
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { parse as parseYaml } from "yaml";
import { checkGate } from "../../src/lib/gate.js";

// Types from @opencode-ai/sdk
interface Session {
	id: string;
	summary?: {
		additions: number;
		deletions: number;
		files: number;
	};
}

interface EventSessionUpdated {
	type: "session.updated";
	properties: {
		info: Session;
	};
}

interface EventFileEdited {
	type: "file.edited";
	properties: {
		file: string;
	};
}

interface EventSessionIdle {
	type: "session.idle";
	properties: {
		sessionID: string;
	};
}

interface EventTuiToastShow {
	type: "tui.toast.show";
	properties: {
		title?: string;
		message: string;
		variant: "info" | "success" | "warning" | "error";
		duration?: number;
	};
}

type Event =
	| EventSessionUpdated
	| EventFileEdited
	| EventSessionIdle
	| { type: string; properties?: Record<string, unknown> };

interface PluginInput {
	client: {
		event: {
			publish: (event: EventTuiToastShow) => Promise<void>;
		};
		session: {
			get: (params: { path: { id: string } }) => Promise<{ data?: Session }>;
		};
	};
	project: {
		path: string;
	};
	directory: string;
	$: (
		strings: TemplateStringsArray,
		...values: unknown[]
	) => Promise<{ stdout: string; stderr: string }>;
}

interface GateResult {
	passed: boolean;
	reason?: string;
	critical: number;
	warning: number;
	info: number;
}

interface Config {
	max_modified_files: number;
	show_toasts: boolean;
	toast_duration: number;
	use_git_status: boolean;
	exclude_patterns: string[];
	warn_uncommitted_on_idle: boolean;
	min_uncommitted_for_warning: number;
	block_on_critical_drift: boolean;
	warn_on_drift: boolean;
}

const DEFAULT_CONFIG: Config = {
	max_modified_files: 10,
	show_toasts: true,
	toast_duration: 5000,
	use_git_status: true,
	exclude_patterns: [
		"*.lock",
		"package-lock.json",
		".opencode/**",
		"node_modules/**",
	],
	warn_uncommitted_on_idle: true,
	min_uncommitted_for_warning: 3,
	block_on_critical_drift: true,
	warn_on_drift: true,
};

function loadConfig(directory: string): Config {
	try {
		const configPath = join(directory, ".opencode/plugin/udd-enforcement.yml");
		const content = readFileSync(configPath, "utf-8");
		const parsed = parseYaml(content) as Partial<Config>;
		return { ...DEFAULT_CONFIG, ...parsed };
	} catch {
		return DEFAULT_CONFIG;
	}
}

function matchesPattern(file: string, patterns: string[]): boolean {
	for (const pattern of patterns) {
		// Simple glob matching - could use minimatch for full support
		const regex = new RegExp(
			`^${pattern.replace(/\*\*/g, ".*").replace(/\*/g, "[^/]*")}$`,
		);
		if (regex.test(file)) {
			return true;
		}
	}
	return false;
}

export default async function UDDEnforcement({
	client,
	directory,
	$,
}: PluginInput) {
	const config = loadConfig(directory);

	// Track files edited in this session (fallback when not using git)
	const editedFiles = new Set<string>();
	let lastWarningTime = 0;
	const WARNING_COOLDOWN = 60000; // 1 minute between warnings

	async function showToast(
		message: string,
		variant: "info" | "warning" | "error" = "warning",
		title?: string,
	) {
		if (!config.show_toasts) return;

		try {
			await client.event.publish({
				type: "tui.toast.show",
				properties: {
					title,
					message,
					variant,
					duration: config.toast_duration,
				},
			});
		} catch {
			// Toast failed, ignore silently
		}
	}

	async function getGitModifiedCount(): Promise<number> {
		try {
			const result = await $`git status --porcelain`;
			const lines = result.stdout.trim().split("\n").filter(Boolean);

			// Filter out excluded patterns
			const relevantFiles = lines.filter((line) => {
				const file = line.slice(3).trim(); // Remove status prefix
				return !matchesPattern(file, config.exclude_patterns);
			});

			return relevantFiles.length;
		} catch {
			return 0;
		}
	}

	async function checkModifiedFiles() {
		if (config.max_modified_files <= 0) return;

		const now = Date.now();
		if (now - lastWarningTime < WARNING_COOLDOWN) return;

		const count = config.use_git_status
			? await getGitModifiedCount()
			: editedFiles.size;

		if (count >= config.max_modified_files) {
			lastWarningTime = now;
			await showToast(
				`${count} files modified. Consider committing before continuing.`,
				"warning",
				"UDD: Large Changeset",
			);
		}
	}

	return {
		name: "udd-enforcement",

		hooks: {
			// Check drift before file write operations
			"tool.execute.before": async (context: {
				tool: string;
				params: Record<string, unknown>;
				sessionID: string;
			}) => {
				// Only check drift for write-related operations
				if (context.tool !== "write" && context.tool !== "edit") {
					return { allowed: true };
				}

				if (!config.warn_on_drift) {
					return { allowed: true };
				}

				try {
					const result = (await checkGate({ strict: false })) as GateResult;

					// Critical drift: block the write
					if (!result.passed && result.critical > 0) {
						const errorMessage = `🚫 UDD Gate Blocked: Critical drift detected (${result.critical} issue${result.critical === 1 ? "" : "s"})\n\n${result.reason}\n\nRun 'udd doctor --fix' to resolve automatically fixable issues.`;

						await showToast(
							`Critical drift detected! Run 'udd doctor --fix'`,
							"error",
							"UDD: Gate Blocked",
						);

						if (config.block_on_critical_drift) {
							return {
								allowed: false,
								error: errorMessage,
							};
						}
					}

					// Warning drift: show warning but allow (configurable)
					if (!result.passed && result.warning > 0) {
						await showToast(
							`Warning: ${result.warning} drift issue${result.warning === 1 ? "" : "s"} detected. Consider running 'udd doctor' before continuing.`,
							"warning",
							"UDD: Drift Warning",
						);

						// Allow but warn (could be configurable to block)
						return { allowed: true };
					}

					// Info drift: show info but always allow
					if (result.info > 0) {
						await showToast(
							`${result.info} improvement suggestion${result.info === 1 ? "" : "s"} available. Run 'udd doctor' for details.`,
							"info",
							"UDD: Suggestions Available",
						);
					}

					return { allowed: true };
				} catch (error) {
					// If gate check fails, log but allow the operation
					console.error("UDD Gate check failed:", error);
					return { allowed: true };
				}
			},

			// Show status banner when session is idle
			"session.idle": async (context: {
				sessionID: string;
				duration: number;
			}) => {
				if (!config.warn_uncommitted_on_idle) {
					return;
				}

				try {
					const count = await getGitModifiedCount();

					if (count >= config.min_uncommitted_for_warning) {
						await showToast(
							`${count} uncommitted files. Remember to commit your progress!`,
							"info",
							"UDD: Uncommitted Changes",
						);
					}

					// Also check for drift during idle and show status
					const driftResult = (await checkGate({
						strict: false,
					})) as GateResult;

					if (driftResult.critical > 0) {
						await showToast(
							`🚫 Critical drift detected (${driftResult.critical} issue${driftResult.critical === 1 ? "" : "s"}). Run 'udd doctor --fix' to resolve.`,
							"error",
							"UDD: Critical Drift",
						);
					} else if (driftResult.warning > 0) {
						await showToast(
							`⚠ ${driftResult.warning} drift warning${driftResult.warning === 1 ? "" : "s"} detected. Run 'udd doctor' for details.`,
							"warning",
							"UDD: Drift Warning",
						);
					} else if (driftResult.info > 0) {
						await showToast(
							`ℹ ${driftResult.info} suggestion${driftResult.info === 1 ? "" : "s"} available. Run 'udd doctor' for details.`,
							"info",
							"UDD: Suggestions",
						);
					}
				} catch (error) {
					// Silently fail for idle checks
					console.error("UDD idle check failed:", error);
				}
			},
		},

		// Handle file edit events (legacy format for backwards compatibility)
		"tool.execute.after": async (
			input: { tool: string; sessionID: string },
			output: { title: string; output: string },
		) => {
			// Track files when not using git status
			if (!config.use_git_status) {
				if (input.tool === "edit" || input.tool === "write") {
					// Extract file path from output if available
					const match = output.title?.match(/(?:Edited|Wrote)\s+(.+)/);
					if (match) {
						const file = match[1];
						if (!matchesPattern(file, config.exclude_patterns)) {
							editedFiles.add(file);
						}
					}
				}
			}

			// Check if this was a commit (reset tracking)
			if (input.tool === "bash") {
				if (
					output.output?.includes("[main") ||
					output.output?.includes("[master") ||
					output.output?.includes("create mode") ||
					output.output?.match(/\d+ file.* changed/)
				) {
					editedFiles.clear();
				}
			}

			// Check threshold after edit/write
			if (input.tool === "edit" || input.tool === "write") {
				await checkModifiedFiles();
			}
		},

		// Handle session idle - warn about uncommitted changes (legacy format)
		event: async ({ event }: { event: Event }) => {
			if (event.type === "session.idle" && config.warn_uncommitted_on_idle) {
				const count = await getGitModifiedCount();
				if (count >= config.min_uncommitted_for_warning) {
					await showToast(
						`${count} uncommitted files. Remember to commit your progress!`,
						"info",
						"UDD: Uncommitted Changes",
					);
				}
			}

			// Track file edits from SDK events
			if (event.type === "file.edited" && !config.use_git_status) {
				const fileEvent = event as EventFileEdited;
				const file = fileEvent.properties.file;
				if (!matchesPattern(file, config.exclude_patterns)) {
					editedFiles.add(file);
					await checkModifiedFiles();
				}
			}
		},

		// Expose for testing/debugging
		getConfig: () => config,
		getEditedFiles: () => Array.from(editedFiles),
	};
}
