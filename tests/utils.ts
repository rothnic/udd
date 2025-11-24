import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

export const execAsync = promisify(exec);
export const rootDir = process.cwd();
export const uddBin = path.resolve(rootDir, 'bin/udd.ts');

export async function runUdd(args: string) {
  const command = `node --loader ts-node/esm --experimental-specifier-resolution=node ${uddBin} ${args}`;
  return execAsync(command);
}
