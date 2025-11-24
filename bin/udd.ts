#!/usr/bin/env node
import { Command } from 'commander';
import { lintCommand } from '../src/commands/lint';
import { statusCommand } from '../src/commands/status';
import { newCommand } from '../src/commands/new';

const program = new Command();

program
  .name('udd')
  .description('User Driven Development CLI')
  .version('0.0.1');

program.addCommand(lintCommand);
program.addCommand(statusCommand);
program.addCommand(newCommand);

program.parse(process.argv);
