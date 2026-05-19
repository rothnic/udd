import { execFile } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import { describe, expect, it } from "vitest";
import { rootDir, withTempDir } from "../../../utils.js";

const execFileAsync = promisify(execFile);

async function runUddInCwd(args: string[]) {
	const uddBin = path.resolve(rootDir, "bin/udd.ts");
	const tsxLoader = path.resolve(rootDir, "node_modules/tsx/dist/loader.mjs");
	return execFileAsync(process.execPath, [
		"--import",
		tsxLoader,
		uddBin,
		...args,
	]);
}

async function readInstalledHookConfig(root: string) {
	return JSON.parse(
		await fs.readFile(path.join(root, ".codex/hooks.json"), "utf8"),
	);
}

describe("codex hooks CLI", () => {
	it("installs codex hooks into an external project", async () => {
		await withTempDir(async () => {
			await runUddInCwd(["hooks", "install-codex"]);

			const config = await readInstalledHookConfig(process.cwd());
			const hook = await fs.readFile(".codex/hooks/pre-task.sh", "utf8");

			expect(config.hooks.UserPromptSubmit[0].hooks[0]).toMatchObject({
				type: "command",
				command: ".codex/hooks/pre-task.sh",
			});
			expect(hook).toContain("udd status");
			expect(hook).toContain("udd status --doctor");
		});
	});

	it("initializes a project with codex hooks", async () => {
		await withTempDir(async () => {
			await runUddInCwd(["init", "--yes", "--codex-hooks"]);

			const config = await readInstalledHookConfig(process.cwd());
			const productReadme = await fs.readFile("product/README.md", "utf8");

			expect(productReadme).toContain("# My Product");
			expect(config.hooks.UserPromptSubmit[0].hooks[0].command).toBe(
				".codex/hooks/pre-task.sh",
			);
		});
	});
});
