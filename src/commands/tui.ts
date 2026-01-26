import { Command } from "commander";
import React from "react";
import { render } from "ink";
import App from "../ui/App.js";

export const tuiCommand = new Command("tui")
	.description("Launch the TUI")
	.action(async () => {
		const { waitUntilExit } = render(React.createElement(App));
		await waitUntilExit();
	});
