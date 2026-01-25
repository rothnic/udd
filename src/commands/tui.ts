import { Command } from "commander";
import { render } from "ink";
import React from "react";
import { App } from "../ui/App.js";

export const tuiCommand = new Command("tui")
	.description("Launch the interactive TUI")
	.action(async () => {
		// Clear screen before starting
		console.clear();
		const { waitUntilExit } = render(React.createElement(App));
		await waitUntilExit();
	});
