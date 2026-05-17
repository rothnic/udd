import { execFile } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import { expect, test } from "vitest";

const execFileAsync = promisify(execFile);

test("codex hook config registers the pre-task health check", async () => {
	const config = JSON.parse(
		await fs.readFile(path.resolve(process.cwd(), ".codex/hooks.json"), "utf8"),
	);

	expect(config.hooks.UserPromptSubmit[0].hooks[0]).toMatchObject({
		type: "command",
		command: ".codex/hooks/pre-task.sh",
		timeout: 10,
	});
});

test("codex pre-task hook surfaces UDD health checks", async () => {
	const hook = await fs.readFile(
		path.resolve(process.cwd(), ".codex/hooks/pre-task.sh"),
		"utf8",
	);

	expect(hook).toContain("node --import tsx bin/udd.ts");
	expect(hook).toContain("health-check");
	expect(hook).toContain("udd doctor");
	expect(hook).toContain("git status --short");
	expect(hook).not.toContain("/goal");
	expect(hook).not.toContain("goals/");
});

test("codex pre-task hook runs as an advisory check", async () => {
	const result = await execFileAsync("bash", [".codex/hooks/pre-task.sh"], {
		cwd: process.cwd(),
	});

	expect(result.stdout).toContain("Codex Pre-Task Health Check");
	expect(result.stdout).toContain("--- udd health-check ---");
	expect(result.stdout).toContain("--- udd doctor ---");
	expect(result.stdout).toContain("--- git status --short ---");
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
