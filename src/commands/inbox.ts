import fs from "node:fs/promises";
import path from "node:path";
import { input } from "@inquirer/prompts";
import chalk from "chalk";
import { Command } from "commander";
import yaml from "yaml";

export const inboxCommand = new Command("inbox").description(
	"Manage the feature inbox",
);

inboxCommand
	.command("add")
	.argument("[title]", "Title of the inbox item")
	.option("-d, --description <description>", "Description of the item")
	.description("Add a new item to the inbox")
	.action(async (title, options) => {
		const rootDir = process.cwd();
		const inboxPath = path.join(rootDir, "specs/inbox.yml");

		let itemTitle = title;
		let itemDescription = options.description;

		// Interactive mode if title is missing
		if (!itemTitle) {
			itemTitle = await input({
				message: "What is the title of the idea?",
				validate: (value: string) => value.trim() !== "" || "Title is required",
			});

			if (!itemDescription) {
				itemDescription = await input({
					message: "Add a description (optional):",
				});
			}
		}

		const newItem = {
			title: itemTitle,
			description: itemDescription || "",
			created_at: new Date().toISOString(),
		};

		try {
			let content = "items: []";
			try {
				content = await fs.readFile(inboxPath, "utf-8");
			} catch {
				// File doesn't exist, start empty
			}

			const data = yaml.parse(content) || { items: [] };
			if (!data.items) data.items = [];

			data.items.push(newItem);

			await fs.writeFile(inboxPath, yaml.stringify(data));
			console.log(chalk.green(`Added to inbox: ${itemTitle}`));
		} catch (error) {
			console.error(chalk.red("Error adding to inbox:"), error);
			process.exit(1);
		}
	});
