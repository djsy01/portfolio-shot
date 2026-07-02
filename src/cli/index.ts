#!/usr/bin/env node
import { createRequire } from 'node:module';
import { Command } from 'commander';
import { runGenerate } from './commands/generate.js';
import { runInit } from './commands/init.js';

const require = createRequire(import.meta.url);
const { version } = require('../../package.json') as { version: string };

const program = new Command();

program.name('portfolio-shot').description('Automatically capture, optimize, and save portfolio screenshots.').version(version);

program
  .command('init')
  .description('Generate a portfolio-shot.config.ts file in the current directory')
  .option('-f, --force', 'Overwrite an existing config file', false)
  .action(async (opts: { force: boolean }) => {
    await runInit(opts);
  });

program
  .command('generate')
  .description('Capture screenshots defined in portfolio-shot.config.ts')
  .option('-c, --config <path>', 'Path to a config file')
  .action(async (opts: { config?: string }) => {
    await runGenerate(opts);
  });

program.parseAsync(process.argv);
