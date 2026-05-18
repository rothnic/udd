import chalk from "chalk";
import { Command } from "commander";
import { installCodexHooks } from "../lib/codex-hooks.js";

export const hooksCommand = new Command("hooks").description(
	"Manage UDD agent hooks",
);

hooksCommand
	.command("install-codex")
	.description("Install Codex UDD session hooks into this project")
	.option("-f, --force", "replace conflicting Codex hook files")
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
