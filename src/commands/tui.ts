import { Command } from "commander";
import { render } from "ink";
import React from "react";
import App from "../ui/App.js";

export const tuiCommand = new Command("tui")
	.description("Launch the TUI")
	.action(() => {
		// Clear console
		console.clear();
		render(React.createElement(App));
	});
