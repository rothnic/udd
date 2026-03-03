import { exec } from "node:child_process";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { promisify, stripVTControlCharacters } from "node:util";

/**
 * Create a temporary directory, switch cwd to it, run the callback, and
 * always restore the original cwd and remove the temp directory.
 *
 * The callback may be async and return any type T.
 */
export async function withTempDir<T>(fn: () => Promise<T> | T): Promise<T> {
	const prev = process.cwd();
	const base = await fs.mkdtemp(path.join(os.tmpdir(), "udd-test-"));

	try {
		process.chdir(base);
		return await fn();
	} finally {
		try {
			process.chdir(prev);
		} catch {
			// best-effort: if chdir back fails, rethrow after cleanup attempt
		}

		// remove the temp dir recursively; ignore errors
		try {
			await fs.rm(base, { recursive: true, force: true });
		} catch {
			// swallow
		}
	}
}

export const execAsync = promisify(exec);
export const rootDir = process.cwd();
export const uddBin = path.resolve(rootDir, "bin/udd.ts");

export async function runUdd(
	args: string,
	opts?: { cwd?: string; env?: NodeJS.ProcessEnv },
): Promise<{ stdout: string; stderr: string; exitCode?: number }> {
	const command = `npx tsx ${uddBin} ${args}`;
	const execOpts: any = {};
	if (opts?.cwd) execOpts.cwd = opts.cwd;
	if (opts?.env) execOpts.env = { ...process.env, ...opts.env };
	const result = await execAsync(command, execOpts);
	return {
		stdout: stripVTControlCharacters(result.stdout.toString()),
		stderr: stripVTControlCharacters(result.stderr.toString()),
	};
}
