import fs from "node:fs/promises";
import chalk from "chalk";
import { Command } from "commander";
import { installCodexHooks } from "../lib/codex-hooks.js";

const HOOK_PATH = ".husky/pre-commit";
const VALIDATION_COMMAND = "udd validate --check-tests";

interface HookOptions {
	backup?: string;
	only?: string;
	config?: string;
}

/**
 * Check if test governance hooks are installed
 */
async function isHooksInstalled(): Promise<boolean> {
	try {
		const content = await fs.readFile(HOOK_PATH, "utf-8");
		return content.includes(VALIDATION_COMMAND);
	} catch {
		return false;
	}
}

/**
 * Read current hook content or return default shebang
 */
async function readHookContent(): Promise<string> {
	try {
		return await fs.readFile(HOOK_PATH, "utf-8");
	} catch {
		return `#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

`;
	}
}

/**
 * Ensure hook file is executable
 */
async function makeExecutable(filePath: string): Promise<void> {
	try {
		await fs.chmod(filePath, 0o755);
	} catch {
		console.warn(chalk.yellow("Warning: Could not make hook executable"));
	}
}

/**
 * Backup existing hook file
 */
async function backupHook(backupPath: string): Promise<void> {
	try {
		const content = await fs.readFile(HOOK_PATH, "utf-8");
		await fs.writeFile(backupPath, content);
		console.log(chalk.dim(`  Backup created: ${backupPath}`));
	} catch {
		console.warn(chalk.yellow("Warning: Could not create backup"));
	}
}

/**
 * Load configuration from file
 */
async function loadConfig(configPath: string): Promise<Partial<HookOptions>> {
	try {
		const content = await fs.readFile(configPath, "utf-8");
		return JSON.parse(content) as Partial<HookOptions>;
	} catch {
		console.warn(
			chalk.yellow(`Warning: Could not load config from ${configPath}`),
		);
		return {};
	}
}

/**
 * Get validation command with optional filtering
 */
function getValidationCommand(onlyHooks?: string): string {
	if (!onlyHooks) {
		return VALIDATION_COMMAND;
	}
	const hooks = onlyHooks
		.split(",")
		.map((h) => h.trim())
		.filter(Boolean);
	if (hooks.length === 0) {
		return VALIDATION_COMMAND;
	}
	return `udd validate --check-tests --only ${hooks.join(",")}`;
}

export const hooksCommand = new Command("hooks").description(
	"Manage Git hooks for test governance",
);

hooksCommand
	.command("install-codex")
	.description("Install Codex UDD session hooks into this project")
	.option("-f, --force", "overwrite existing Codex hook files")
	.action(async (options: { force?: boolean }) => {
		try {
			const result = await installCodexHooks(process.cwd(), {
				force: options.force,
			});

			console.log(chalk.green("✓ Codex UDD hooks installed"));
			for (const file of result.written) {
				console.log(chalk.dim(`  Wrote: ${file}`));
			}
			for (const file of result.unchanged) {
				console.log(chalk.dim(`  Unchanged: ${file}`));
			}
		} catch (error) {
			console.error(chalk.red("Error installing Codex hooks:"), error);
			process.exit(1);
		}
	});

hooksCommand
	.command("install")
	.description("Install test governance hooks (adds validation to pre-commit)")
	.option("-b, --backup <path>", "backup existing hook to specified path")
	.option(
		"-o, --only <hooks>",
		"install only specified hooks (comma-separated)",
	)
	.option("-c, --config <path>", "load options from config file")
	.action(async (options: HookOptions) => {
		try {
			// Load config file if specified
			let finalOptions = options;
			if (options.config) {
				const config = await loadConfig(options.config);
				finalOptions = { ...config, ...options };
			}

			// Check if already installed
			if (await isHooksInstalled()) {
				console.log(chalk.yellow("Hooks already installed"));
				return;
			}

			// Backup existing hook if requested
			if (finalOptions.backup) {
				await backupHook(finalOptions.backup);
			}

			// Read current content
			const content = await readHookContent();

			// Get appropriate validation command
			const validationCommand = getValidationCommand(finalOptions.only);

			// Append validation command
			const updatedContent = `${content.trimEnd()}\n${validationCommand}\n`;

			// Write hook file
			await fs.writeFile(HOOK_PATH, updatedContent);

			// Make executable
			await makeExecutable(HOOK_PATH);

			console.log(chalk.green("✓ Test governance hooks installed"));
			console.log(chalk.dim(`  Added to: ${HOOK_PATH}`));
			if (finalOptions.only) {
				console.log(chalk.dim(`  Filters: ${finalOptions.only}`));
			}
		} catch (error) {
			console.error(chalk.red("Error installing hooks:"), error);
			process.exit(1);
		}
	});

hooksCommand
	.command("uninstall")
	.description("Remove test governance hooks from pre-commit")
	.action(async () => {
		try {
			// Check if installed
			if (!(await isHooksInstalled())) {
				console.log(chalk.yellow("Test governance hooks not installed"));
				return;
			}

			// Read current content
			const content = await fs.readFile(HOOK_PATH, "utf-8");

			// Remove validation command line
			const lines = content.split("\n");
			const filteredLines = lines.filter(
				(line) => !line.trim().includes(VALIDATION_COMMAND),
			);
			const updatedContent = `${filteredLines.join("\n").trimEnd()}\n`;

			// Write back
			await fs.writeFile(HOOK_PATH, updatedContent);

			console.log(chalk.green("✓ Test governance hooks removed"));
		} catch (error) {
			console.error(chalk.red("Error uninstalling hooks:"), error);
			process.exit(1);
		}
	});

hooksCommand
	.command("status")
	.description("Show test governance hook status")
	.action(async () => {
		try {
			const installed = await isHooksInstalled();

			if (installed) {
				console.log(chalk.green("✓ Test governance hooks active"));
				console.log(chalk.dim(`  Hook file: ${HOOK_PATH}`));
				console.log(chalk.dim(`  Command: ${VALIDATION_COMMAND}`));
			} else {
				console.log(chalk.yellow("○ Test governance hooks not installed"));
				console.log(chalk.dim("  Run: udd hooks install"));
			}
		} catch (error) {
			console.error(chalk.red("Error checking hook status:"), error);
			process.exit(1);
		}
	});
