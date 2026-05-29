import { spawn } from "node:child_process";
import path from "node:path";
import { Command } from "commander";

export const testCommand = new Command("test")
	.description("Run E2E tests with visual feedback")
	.argument("[args...]", "Arguments to pass to vitest")
	.action(async (args) => {
		const vitestBin = path.resolve(
			process.cwd(),
			"node_modules/vitest/vitest.mjs",
		);
		const useBun = process.env.UDD_TEST_RUNTIME === "bun";
		const command = useBun ? "bun" : process.execPath;
		const commandArgs = useBun
			? ["--bun", vitestBin, "run", "--reporter=verbose", ...(args || [])]
			: [vitestBin, "run", "--reporter=verbose", ...(args || [])];

		const child = spawn(command, commandArgs, {
			stdio: "inherit",
			shell: false,
		});

		child.on("close", (code) => {
			process.exit(code ?? 1);
		});

		child.on("error", (err) => {
			console.error(err);
			process.exit(1);
		});
	});
