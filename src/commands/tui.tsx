import { Command } from "commander";
import { render } from "ink";
import { App } from "../ui/App.js";

export const tuiCommand = new Command("tui")
	.description("Launch the interactive TUI mode")
	.action(async () => {
		const { waitUntilExit } = render(<App />);
		await waitUntilExit();
	});
