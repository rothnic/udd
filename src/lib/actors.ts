import fs from 'node:fs/promises';
import path from 'node:path';

export interface Actor {
	name: string;
	description: string;
}

export async function getActors(): Promise<Actor[]> {
	try {
		const rootDir = process.cwd();
		const actorsPath = path.join(rootDir, 'product/actors.md');
		const content = await fs.readFile(actorsPath, 'utf-8');

		const actors: Actor[] = [];
		const lines = content.split('\n');
		let inTable = false;

		for (const line of lines) {
			if (line.includes('| Actor | Description |')) {
				inTable = true;
				continue;
			}
			if (inTable && line.includes('|---|---|')) continue;

			if (inTable && line.trim().startsWith('|')) {
				const parts = line.split('|').map(p => p.trim()).filter(p => p);
				if (parts.length >= 2) {
					actors.push({
						name: parts[0],
						description: parts[1]
					});
				}
			}
		}
		return actors;
	} catch {
		return [];
	}
}
