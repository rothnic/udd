import fs from "node:fs/promises";
import path from "node:path";
import chalk from "chalk";
import { Command } from "commander";

const HOOK_PATH = ".husky/pre-commit";
const VALIDATION_COMMAND = "udd validate --check-tests";

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
	} catch (error) {
		console.warn(chalk.yellow("Warning: Could not make hook executable"));
	}
}

export const hooksCommand = new Command("hooks").description(
	"Manage Git hooks for test governance",
);

hooksCommand
	.command("install")
	.description("Install test governance hooks (adds validation to pre-commit)")
	.action(async () => {
		try {
			// Check if already installed
			if (await isHooksInstalled()) {
				console.log(chalk.yellow("Hooks already installed"));
				return;
			}

			// Read current content
			const content = await readHookContent();

			// Append validation command
			const updatedContent =
				content.trimEnd() + "\n" + VALIDATION_COMMAND + "\n";

			// Write hook file
			await fs.writeFile(HOOK_PATH, updatedContent);

			// Make executable
			await makeExecutable(HOOK_PATH);

			console.log(chalk.green("✓ Test governance hooks installed"));
			console.log(chalk.dim(`  Added to: ${HOOK_PATH}`));
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
			const updatedContent = filteredLines.join("\n").trimEnd() + "\n";

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
