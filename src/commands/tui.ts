import { Command } from "commander";
import { render } from "ink";
import React from "react";
import { App } from "../ui/app.js";

export const tuiCommand = new Command("tui")
	.description("Launch the TUI interface")
	.action(async () => {
		// Clear console for better experience
		console.clear();
		const { waitUntilExit } = render(React.createElement(App));
		await waitUntilExit();
	});
