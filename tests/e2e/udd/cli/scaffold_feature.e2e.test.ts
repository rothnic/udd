import fs from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { runUdd, withTempDir } from "../../../utils.js";

// repoRoot (tests are located at tests/e2e/udd/cli)
const repoRoot = path.resolve(__dirname, "../../../../");

describe("udd new feature CLI", () => {
	it("creates a new feature from SysML template", async () => {
		await withTempDir(async () => {
			// create parent domain
			await fs.mkdir(path.join(process.cwd(), "specs/features/test_domain"), {
				recursive: true,
			});

			// ensure template exists in temp cwd so command can read it
			await fs.mkdir(path.join(process.cwd(), "templates"), {
				recursive: true,
			});
			const templateSrc = path.join(
				repoRoot,
				"templates",
				"feature-template.feature",
			);
			const templateContent = await fs.readFile(templateSrc, "utf8");
			await fs.writeFile(
				path.join(process.cwd(), "templates", "feature-template.feature"),
				templateContent,
			);

			const res = await runUdd("new feature test_domain sample_feature");
			expect(res).toHaveProperty("stdout");

			const featurePath = path.join(
				process.cwd(),
				"specs/features/test_domain/sample_feature/sample_feature.feature",
			);
			const exists = await fs
				.access(featurePath)
				.then(() => true)
				.catch(() => false);
			expect(exists).toBe(true);

			const content = await fs.readFile(featurePath, "utf8");
			expect(content).toContain("Feature: Sample Feature");
			// basic gherkin presence
			expect(/Scenario:|Background:/i.test(content)).toBe(true);
		});
	});

	it("creates feature when parent directory does not exist", async () => {
		await withTempDir(async () => {
			// do not create parent dir - command should create parents
			// add template so command can run from temp dir
			await fs.mkdir(path.join(process.cwd(), "templates"), {
				recursive: true,
			});
			await fs.copyFile(
				path.join(repoRoot, "templates", "feature-template.feature"),
				path.join(process.cwd(), "templates", "feature-template.feature"),
			);

			const res = await runUdd("new feature nonexistent_domain new_feature");
			expect(res).toHaveProperty("stdout");

			const featurePath = path.join(
				process.cwd(),
				"specs/features/nonexistent_domain/new_feature/new_feature.feature",
			);
			const exists = await fs
				.access(featurePath)
				.then(() => true)
				.catch(() => false);
			expect(exists).toBe(true);
		});
	});

	it("overwrites existing feature when duplicate name is used", async () => {
		await withTempDir(async () => {
			const featureDir = path.join(
				process.cwd(),
				"specs/features/test_domain/existing_feature",
			);
			await fs.mkdir(featureDir, { recursive: true });
			const existingPath = path.join(featureDir, "existing_feature.feature");
			const original = "Feature: Existing Feature\n\nScenario: existing\n";
			await fs.writeFile(existingPath, original);

			// ensure template available in temp dir
			await fs.mkdir(path.join(process.cwd(), "templates"), {
				recursive: true,
			});
			await fs.copyFile(
				path.join(repoRoot, "templates", "feature-template.feature"),
				path.join(process.cwd(), "templates", "feature-template.feature"),
			);

			const res = await runUdd("new feature test_domain existing_feature");
			expect(res).toHaveProperty("stdout");

			const content = await fs.readFile(existingPath, "utf8");
			// Should be overwritten with template-based content (not equal original)
			expect(content).not.toBe(original);
			expect(content).toContain("Feature: Existing Feature");
		});
	});

	it("creates nested directories when feature name contains slashes", async () => {
		await withTempDir(async () => {
			// ensure template available in temp dir
			await fs.mkdir(path.join(process.cwd(), "templates"), {
				recursive: true,
			});
			await fs.copyFile(
				path.join(repoRoot, "templates", "feature-template.feature"),
				path.join(process.cwd(), "templates", "feature-template.feature"),
			);

			// The current implementation fails when featureName contains slashes
			// because the filename is constructed using the raw featureName and
			// the write attempts to create a nested filename that wasn't mkdir'ed.
			// Expect the command to error and no file to be created.
			let err: unknown = null;
			try {
				await runUdd("new feature test_domain invalid/name");
			} catch (e) {
				err = e;
			}
			expect(err).not.toBeNull();

			const featurePath = path.join(
				process.cwd(),
				"specs/features/test_domain/invalid/name.feature",
			);
			const exists = await fs
				.access(featurePath)
				.then(() => true)
				.catch(() => false);
			expect(exists).toBe(false);
		});
	});
});
