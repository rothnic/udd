#!/usr/bin/env node
import { Command } from "commander";
import { inboxCommand } from "../src/commands/inbox.js";
import { initCommand } from "../src/commands/init.js";
import { lintCommand } from "../src/commands/lint.js";
import { newCommand } from "../src/commands/new.js";
import { statusCommand } from "../src/commands/status.js";
import { syncCommand } from "../src/commands/sync.js";
import { testCommand } from "../src/commands/test.js";

const program = new Command();

program.name("udd").description("User Driven Development CLI").version("0.0.1");

program.addCommand(initCommand);
program.addCommand(syncCommand);
program.addCommand(lintCommand);
program.addCommand(statusCommand);
program.addCommand(newCommand);
program.addCommand(testCommand);
program.addCommand(inboxCommand);

program.parse(process.argv);
