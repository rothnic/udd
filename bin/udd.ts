#!/usr/bin/env node
import { Command } from "commander";
import { discoverCommand } from "../src/commands/discover.js";
import { inboxCommand } from "../src/commands/inbox.js";
import { initCommand } from "../src/commands/init.js";
import { lintCommand } from "../src/commands/lint.js";
import { newCommand } from "../src/commands/new.js";
import { queryCommand } from "../src/commands/query.js";
import { statusCommand } from "../src/commands/status.js";
import { syncCommand } from "../src/commands/sync.js";
import { testCommand } from "../src/commands/test.js";
import { tuiCommand } from "../src/commands/tui.js";
import { validateCommand } from "../src/commands/validate.js";

const program = new Command();

program.name("udd").description("User Driven Development CLI").version("0.0.1");

program.addCommand(initCommand);
program.addCommand(syncCommand);
program.addCommand(lintCommand);
program.addCommand(statusCommand);
program.addCommand(newCommand);
program.addCommand(discoverCommand);
program.addCommand(validateCommand);
program.addCommand(testCommand);
program.addCommand(inboxCommand);
program.addCommand(queryCommand);
program.addCommand(tuiCommand);

if (process.argv.length === 2) {
	process.argv.push("tui");
}

program.parse(process.argv);
