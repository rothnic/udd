import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const targetDir = path.resolve(
	__dirname,
	"../node_modules/@amiceli/vitest-cucumber/dist",
);

function walk(dir, fileList = []) {
	const files = fs.readdirSync(dir);
	for (const file of files) {
		const filePath = path.join(dir, file);
		const stat = fs.statSync(filePath);
		if (stat.isDirectory()) {
			walk(filePath, fileList);
		} else if (file.endsWith(".js") || file.endsWith(".d.ts")) {
			fileList.push(filePath);
		}
	}
	return fileList;
}

function resolveImport(baseDir, importPath) {
	if (!importPath.startsWith(".")) return null;
	if (importPath.endsWith(".js")) return null;

	const absolutePath = path.resolve(baseDir, importPath);

	if (
		fs.existsSync(`${absolutePath}.js`) ||
		fs.existsSync(`${absolutePath}.d.ts`)
	) {
		return `${importPath}.js`;
	}

	if (
		fs.existsSync(path.join(absolutePath, "index.js")) ||
		fs.existsSync(path.join(absolutePath, "index.d.ts"))
	) {
		return `${importPath}/index.js`;
	}

	return null;
}

function patchFile(filePath) {
	let content = fs.readFileSync(filePath, "utf-8");
	const baseDir = path.dirname(filePath);
	let changed = false;

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

			if (importPath.endsWith(".json")) {
				changed = true;
				return `from '${importPath}' with { type: 'json' }`;
			}

			return match;
		},
	);

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

if (fs.existsSync(targetDir)) {
	console.log(`Scanning ${targetDir}...`);
	const files = walk(targetDir);
	files.forEach(patchFile);
	console.log("Done patching.");
}
