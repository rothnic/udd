import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const targetDir = path.resolve(
	__dirname,
	"../node_modules/@amiceli/vitest-cucumber/dist",
);

function walk(dir: string, fileList: string[] = []) {
	const files = fs.readdirSync(dir);
	for (const file of files) {
		const filePath = path.join(dir, file);
		const stat = fs.statSync(filePath);
		if (stat.isDirectory()) {
			walk(filePath, fileList);
		} else {
			if (file.endsWith(".js") || file.endsWith(".d.ts")) {
				fileList.push(filePath);
			}
		}
	}
	return fileList;
}

function resolveImport(baseDir: string, importPath: string): string | null {
	if (!importPath.startsWith(".")) return null; // Ignore external packages
	if (importPath.endsWith(".js")) return null; // Already has extension

	const absolutePath = path.resolve(baseDir, importPath);

	// Check for .js or .d.ts (for types)
	if (
		fs.existsSync(`${absolutePath}.js`) ||
		fs.existsSync(`${absolutePath}.d.ts`)
	) {
		return `${importPath}.js`;
	}

	// Check for /index.js or /index.d.ts
	if (
		fs.existsSync(path.join(absolutePath, "index.js")) ||
		fs.existsSync(path.join(absolutePath, "index.d.ts"))
	) {
		return `${importPath}/index.js`;
	}

	return null;
}

function patchFile(filePath: string) {
	let content = fs.readFileSync(filePath, "utf-8");
	const baseDir = path.dirname(filePath);
	let changed = false;

	// Replace import ... from '...'
	// Look ahead to ensure we don't double-patch attributes
	content = content.replace(
		/from\s+['"]([^'"]+)['"](?!\s+(?:with|assert))/g,
		(match, importPath) => {
			const newPath = resolveImport(baseDir, importPath);

			if (newPath) {
				changed = true;
				if (newPath.endsWith(".json")) {
					return `from '${newPath}' with { type: 'json' }`;
				}
				return `from '${newPath}'`;
			}

			// Handle existing .json imports that are missing the attribute (and weren't resolved by resolveImport because they might already have extension)
			if (importPath.endsWith(".json")) {
				changed = true;
				return `from '${importPath}' with { type: 'json' }`;
			}

			return match;
		},
	);

	// Replace import('...')
	content = content.replace(
		/import\(['"]([^'"]+)['"]\)/g,
		(match, importPath) => {
			const newPath = resolveImport(baseDir, importPath);
			if (newPath) {
				changed = true;
				return `import('${newPath}')`;
			}
			return match;
		},
	);

	// Fix bug in plugin/index.js where paths are concatenated without separator
	if (filePath.endsWith("plugin/index.js")) {
		const buggyLine =
			"const featureFilePath = `" +
			"$" +
			"{options.featureFilesDir}$" +
			"{filename}`;";
		const fixedLine =
			"const featureFilePath = path.join(options.featureFilesDir, filename);";
		if (content.includes(buggyLine)) {
			content = content.replace(buggyLine, fixedLine);
			changed = true;
			console.log("Fixed path concatenation bug in plugin/index.js");
		}

		// Fix bug where specFilePath ignores specFilesDir
		const buggySpecLine =
			"const specFilePath = featureFilePath.replace('.feature', '.spec.ts');";
		const fixedSpecLine =
			"const specFilePath = path.join(options.specFilesDir, filename).replace('.feature', '.spec.ts'); fs.mkdirSync(path.dirname(specFilePath), { recursive: true });";
		if (content.includes(buggySpecLine)) {
			content = content.replace(buggySpecLine, fixedSpecLine);
			changed = true;
			console.log("Fixed specFilePath calculation in plugin/index.js");
		} else if (
			content.includes(
				"const specFilePath = path.join(options.specFilesDir, filename).replace('.feature', '.spec.ts');",
			) &&
			!content.includes("fs.mkdirSync(path.dirname(specFilePath)")
		) {
			content = content.replace(
				"const specFilePath = path.join(options.specFilesDir, filename).replace('.feature', '.spec.ts');",
				fixedSpecLine,
			);
			changed = true;
			console.log(
				"Updated specFilePath calculation in plugin/index.js (missing mkdirSync)",
			);
		}
	}

	if (changed) {
		console.log(`Patching ${filePath}`);
		fs.writeFileSync(filePath, content);
	}
}

console.log(`Scanning ${targetDir}...`);
if (fs.existsSync(targetDir)) {
	const files = walk(targetDir);
	files.forEach(patchFile);
	console.log("Done patching.");
} else {
	console.error(`Directory not found: ${targetDir}`);
}
