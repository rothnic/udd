import { exec } from "node:child_process";
import path from "node:path";
import { promisify } from "node:util";

export const execAsync = promisify(exec);
export const rootDir = process.cwd();
export const uddBin = path.resolve(rootDir, "bin/udd.ts");

export async function runUdd(args: string) {
	const command = `npx tsx ${uddBin} ${args}`;
	return execAsync(command);
}
