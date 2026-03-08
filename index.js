#!/usr/bin/env node

import { Command } from 'commander';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { resolve, join } from 'node:path';
import BookstackSDK from 'bookstack-sdk';

const program = new Command();

const RESOURCE_ALIASES = {
  book: 'book',
  books: 'book',
  page: 'page',
  pages: 'page',
  chapter: 'chapter',
  chapters: 'chapter',
  shelf: 'shelf',
  shelves: 'shelf',
  user: 'user',
  users: 'user'
};

function getConfigPath(globalMode = false) {
  if (globalMode) {
    return join(homedir(), '.bsrc');
  }
  return resolve(process.cwd(), '.bsrc');
}

function loadConfig() {
  const localPath = getConfigPath(false);
  const globalPath = getConfigPath(true);
  const configPath = existsSync(localPath) ? localPath : globalPath;

  if (!configPath || !existsSync(configPath)) {
    return {};
  }

  try {
    return JSON.parse(readFileSync(configPath, 'utf8'));
  } catch {
    throw new Error(`Invalid JSON in config file: ${configPath}`);
  }
}

function buildRuntimeConfig(options) {
  const fileConfig = loadConfig();
  return {
    apiHost: options.apihost || fileConfig.apiHost || process.env.BOOKSTACK_API_HOST,
    apiKey: options.apitoken || fileConfig.apiKey || process.env.BOOKSTACK_API_KEY,
    apiSecret: options.apisecret || fileConfig.apiSecret || process.env.BOOKSTACK_API_SECRET
  };
}

function parseArg(raw) {
  if (raw === undefined) return undefined;
  if (/^-?\d+$/.test(raw)) return Number(raw);
  if (raw === 'true') return true;
  if (raw === 'false') return false;
  if ((raw.startsWith('{') && raw.endsWith('}')) || (raw.startsWith('[') && raw.endsWith(']'))) {
    try {
      return JSON.parse(raw);
    } catch {
      return raw;
    }
  }
  return raw;
}

program
  .name('book-cli')
  .description('BookStack CLI')
  .version('1.0.0');

program
  .command('init')
  .description('Create a .bsrc configuration file with BookStack API credentials')
  .option('--global', 'Write config to ~/.bsrc instead of current working directory')
  .requiredOption('--apihost <url>', 'BookStack host URL, example: https://docs.example.com')
  .requiredOption('--apitoken <token>', 'BookStack API token id')
  .requiredOption('--apisecret <secret>', 'BookStack API token secret')
  .action((options) => {
    const filePath = getConfigPath(options.global);
    const config = {
      apiHost: options.apihost,
      apiKey: options.apitoken,
      apiSecret: options.apisecret
    };
    writeFileSync(filePath, `${JSON.stringify(config, null, 2)}\n`, 'utf8');
    console.log(`Configuration saved to ${filePath}`);
  });

program
  .command('run <resource> <method> [args...]')
  .description('Run a BookStack resource method, e.g. run page read 15')
  .option('--apihost <url>', 'BookStack host URL override')
  .option('--apitoken <token>', 'BookStack API token id override')
  .option('--apisecret <secret>', 'BookStack API token secret override')
  .action(async (resource, method, args, options) => {
    try {
      const resourceKey = RESOURCE_ALIASES[String(resource).toLowerCase()];
      if (!resourceKey) {
        throw new Error(`Unknown resource "${resource}".`);
      }

      const runtimeConfig = buildRuntimeConfig(options);
      const sdk = new BookstackSDK(runtimeConfig);
      const target = sdk[resourceKey];
      if (!target || typeof target[method] !== 'function') {
        throw new Error(`Unknown method "${method}" for resource "${resourceKey}".`);
      }

      const parsedArgs = (args || []).map(parseArg);
      const result = await target[method](...parsedArgs);
      console.log(JSON.stringify(result, null, 2));
    } catch (error) {
      console.error(error.message);
      process.exitCode = 1;
    }
  });

program.parse(process.argv);
