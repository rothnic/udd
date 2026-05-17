import { execFile } from "node:child_process";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { expect, test } from "vitest";
import { installCodexHooks } from "../../src/lib/codex-hooks.js";

const execFileAsync = promisify(execFile);

async function withExternalProject<T>(fn: (rootDir: string) => Promise<T>) {
	const rootDir = await fs.mkdtemp(path.join(os.tmpdir(), "udd-codex-hooks-"));
	try {
		return await fn(rootDir);
	} finally {
		await fs.rm(rootDir, { recursive: true, force: true });
	}
}

test("installs codex hook config into an external project", async () => {
	await withExternalProject(async (rootDir) => {
		const result = await installCodexHooks(rootDir);

		expect(result.written).toEqual([
			".codex/hooks.json",
			".codex/hooks/pre-task.sh",
		]);

		const config = JSON.parse(
			await fs.readFile(path.join(rootDir, ".codex/hooks.json"), "utf8"),
		);

		expect(config.hooks.UserPromptSubmit[0].hooks[0]).toMatchObject({
			type: "command",
			command: ".codex/hooks/pre-task.sh",
			timeout: 10,
		});
	});
});

test("codex hook installer is idempotent", async () => {
	await withExternalProject(async (rootDir) => {
		await installCodexHooks(rootDir);
		const result = await installCodexHooks(rootDir);

		expect(result.unchanged).toEqual([
			".codex/hooks.json",
			".codex/hooks/pre-task.sh",
		]);
	});
});

test("codex pre-task hook surfaces UDD health checks", async () => {
	await withExternalProject(async (rootDir) => {
		await installCodexHooks(rootDir);
		const hook = await fs.readFile(
			path.join(rootDir, ".codex/hooks/pre-task.sh"),
			"utf8",
		);

		expect(hook).toContain("node --import tsx bin/udd.ts");
		expect(hook).toContain("health-check");
		expect(hook).toContain("udd doctor");
		expect(hook).toContain("git status --short");
		expect(hook).not.toContain("/goal");
		expect(hook).not.toContain("goals/");
	});
});

test("codex pre-task hook runs as an advisory check", async () => {
	await withExternalProject(async (rootDir) => {
		await installCodexHooks(rootDir);
		const fakeBin = path.join(rootDir, "bin");
		await fs.mkdir(fakeBin, { recursive: true });
		const fakeUdd = path.join(fakeBin, "udd");
		await fs.writeFile(fakeUdd, '#!/usr/bin/env sh\necho "udd $*"\n');
		await fs.chmod(fakeUdd, 0o755);

		const result = await execFileAsync("bash", [".codex/hooks/pre-task.sh"], {
			cwd: rootDir,
			env: {
				...process.env,
				PATH: `${fakeBin}${path.delimiter}${process.env.PATH || ""}`,
			},
		});

		expect(result.stdout).toContain("Codex Pre-Task Health Check");
		expect(result.stdout).toContain("--- udd health-check ---");
		expect(result.stdout).toContain("--- udd doctor ---");
		expect(result.stdout).toContain("--- git status --short ---");
		expect(result.stdout).toContain("udd health-check");
		expect(result.stdout).toContain("udd doctor");
	});
});

test("codex integration docs describe UDD tooling instead of goal workflow", async () => {
	const readme = await fs.readFile(
		path.resolve(process.cwd(), "integrations/codex/README.md"),
		"utf8",
	);

	expect(readme).toContain(".codex/hooks.json");
	expect(readme).toContain(".codex/hooks/pre-task.sh");
	expect(readme).toContain("udd health-check");
	expect(readme).toContain("udd doctor");
	expect(readme).not.toContain("/goal");
	expect(readme).not.toContain("goals/");
});
