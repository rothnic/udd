import { spawn } from "node:child_process";
import { Command } from "commander";

export const testCommand = new Command("test")
	.description("Run E2E tests with visual feedback")
	.argument("[args...]", "Arguments to pass to vitest")
	.action(async (args) => {
		const child = spawn(
			"npx",
			["vitest", "run", "--reporter=verbose", ...(args || [])],
			{
				stdio: "inherit",
				shell: true,
			},
		);

		child.on("close", (code) => {
			process.exit(code ?? 1);
		});

		child.on("error", (err) => {
			console.error(err);
			process.exit(1);
		});
	});
