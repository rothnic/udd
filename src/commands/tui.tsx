import { Command } from "commander";
import { render } from "ink";
import React from "react";
import { App } from "../ui/App.js";

export const tuiCommand = new Command("tui")
	.description("Launch the interactive TUI")
	.action(async () => {
		const { waitUntilExit } = render(<App />);
		await waitUntilExit();
	});
