import fs from "node:fs/promises";
import path from "node:path";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { afterAll, beforeAll, expect } from "vitest";
import yaml from "yaml";
import { rootDir, runUdd } from "../../../../utils.js";

const feature = await loadFeature(
	"specs/features/udd/cli/inbox/add_item_via_cli.feature",
);

describeFeature(feature, ({ Scenario }) => {
	const inboxPath = path.join(rootDir, "specs/inbox.yml");
	let originalContent: string;

	beforeAll(async () => {
		originalContent = await fs.readFile(inboxPath, "utf-8");
	});

	afterAll(async () => {
		await fs.writeFile(inboxPath, originalContent);
	});

	Scenario("Add item via CLI", ({ Given, When, Then, And }) => {
		Given("I have an empty inbox", async () => {
			await fs.writeFile(inboxPath, "items: []");
		});

		When(
			"I run \"udd inbox add 'My new idea' --description 'Some details'\"",
			async () => {
				await runUdd("inbox add 'My new idea' --description 'Some details'");
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
