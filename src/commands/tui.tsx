import { Command } from "commander";
import { render } from "ink";
import App from "../ui/App.js";

export const tuiCommand = new Command("tui")
	.description("Launch the interactive TUI")
	.action(() => {
		render(<App />);
	});
