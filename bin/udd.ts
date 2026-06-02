#!/usr/bin/env node
import { Command } from "commander";
import { discoverCommand } from "../src/commands/discover.js";
import { doctorCommand } from "../src/commands/doctor.js";
import { gateCommand } from "../src/commands/gate.js";
import { healthCommand } from "../src/commands/health.js";
import { hooksCommand } from "../src/commands/hooks.js";
import { impactCommand } from "../src/commands/impact.js";
import { inboxCommand } from "../src/commands/inbox.js";
import { initCommand } from "../src/commands/init.js";
import { lintCommand } from "../src/commands/lint.js";
import { newCommand } from "../src/commands/new.js";
import { opencodeCommand } from "../src/commands/opencode.js";
import { phaseCommand } from "../src/commands/phase.js";
import { queryCommand } from "../src/commands/query.js";
import { repairCommand } from "../src/commands/repair.js";
import { statusCommand } from "../src/commands/status.js";
import { syncCommand } from "../src/commands/sync.js";
import { testCommand } from "../src/commands/test.js";
import { testScanCommand } from "../src/commands/test-scan.js";
import { traceCommand } from "../src/commands/trace.js";
import { validateCommand } from "../src/commands/validate.js";

const program = new Command();

program.name("udd").description("User Driven Development CLI").version("0.0.1");

program.addCommand(initCommand);
program.addCommand(syncCommand);
program.addCommand(lintCommand);
program.addCommand(statusCommand);
program.addCommand(newCommand);
program.addCommand(phaseCommand);
program.addCommand(discoverCommand);
program.addCommand(doctorCommand);
program.addCommand(repairCommand);
program.addCommand(healthCommand);
program.addCommand(validateCommand);
program.addCommand(testCommand);
program.addCommand(testScanCommand);
program.addCommand(gateCommand);
program.addCommand(inboxCommand);
program.addCommand(queryCommand);
program.addCommand(traceCommand);
program.addCommand(impactCommand);
program.addCommand(hooksCommand);
program.addCommand(opencodeCommand);

program.parse(process.argv);
