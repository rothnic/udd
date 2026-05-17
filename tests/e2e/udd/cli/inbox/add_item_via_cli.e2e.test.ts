import { execFile } from "node:child_process";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { promisify, stripVTControlCharacters } from "node:util";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { afterAll, beforeAll, expect } from "vitest";
import yaml from "yaml";
import { rootDir, uddBin } from "../../../../utils.js";

const execFileAsync = promisify(execFile);

const feature = await loadFeature(
	"specs/features/udd/cli/inbox/add_item_via_cli.feature",
);

describeFeature(feature, ({ Scenario }) => {
	let projectDir: string;
	let inboxPath: string;

	beforeAll(async () => {
		projectDir = await fs.mkdtemp(path.join(os.tmpdir(), "udd-inbox-e2e-"));
		inboxPath = path.join(projectDir, "specs/inbox.yml");
		await fs.mkdir(path.dirname(inboxPath), { recursive: true });
	});

	afterAll(async () => {
		await fs.rm(projectDir, { recursive: true, force: true });
	});

	Scenario("Add item via CLI", ({ Given, When, Then, And }) => {
		Given("I have an empty inbox", async () => {
			await fs.writeFile(inboxPath, "items: []");
		});

		When(
			"I run \"udd inbox add 'My new idea' --description 'Some details'\"",
			async () => {
				const result = await execFileAsync(
					path.join(rootDir, "node_modules/.bin/tsx"),
					[
						uddBin,
						"inbox",
						"add",
						"My new idea",
						"--description",
						"Some details",
					],
					{ cwd: projectDir },
				);

				expect(stripVTControlCharacters(result.stdout)).toContain(
					"Added to inbox: My new idea",
				);
			},
		);

		Then('the inbox should contain "My new idea"', async () => {
			const content = await fs.readFile(inboxPath, "utf-8");
			const data = yaml.parse(content);
			expect(data.items).toHaveLength(1);
			expect(data.items[0].title).toBe("My new idea");
		});

		And('the item should have description "Some details"', async () => {
			const content = await fs.readFile(inboxPath, "utf-8");
			const data = yaml.parse(content);
			expect(data.items[0].description).toBe("Some details");
		});
	});
});
