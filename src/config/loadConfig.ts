import path from 'node:path';
import { pathToFileURL } from 'node:url';
import fs from 'fs-extra';
import ts from 'typescript';
import { InvalidConfigError } from '../errors.js';
import type { PortfolioShotConfig, ResolvedPortfolioShotConfig } from '../types.js';

const CONFIG_FILENAMES = [
  'portfolio-shot.config.ts',
  'portfolio-shot.config.mjs',
  'portfolio-shot.config.js',
  'portfolio-shot.config.cjs',
  'portfolio-shot.config.json',
];

const DEFAULTS = {
  format: 'webp' as const,
  quality: 90,
  fullPage: true,
  viewport: { width: 1440, height: 900 },
  waitUntil: 'networkidle' as const,
  timeout: 30_000,
};

/** Type-only helper so `portfolio-shot.config.ts` files get autocomplete and validation. */
export function defineConfig(config: PortfolioShotConfig): PortfolioShotConfig {
  return config;
}

export async function findConfigFile(cwd: string = process.cwd()): Promise<string | null> {
  for (const filename of CONFIG_FILENAMES) {
    const fullPath = path.join(cwd, filename);
    if (await fs.pathExists(fullPath)) {
      return fullPath;
    }
  }
  return null;
}

/**
 * Transpiles a `.ts` config file on the fly and imports it as ESM.
 * The temp file is written next to the original config so relative
 * `import`s (e.g. `from "portfolio-shot"`) still resolve against the
 * user's own `node_modules`.
 */
async function importTypeScriptConfig(configPath: string): Promise<unknown> {
  const source = await fs.readFile(configPath, 'utf-8');

  const transpiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
      esModuleInterop: true,
    },
    fileName: configPath,
  });

  const tempFile = path.join(path.dirname(configPath), `.portfolio-shot.config.${Date.now()}.mjs`);

  await fs.writeFile(tempFile, transpiled.outputText, 'utf-8');

  try {
    const imported = (await import(pathToFileURL(tempFile).href)) as {
      default?: unknown;
    };
    return imported.default ?? imported;
  } finally {
    await fs.remove(tempFile);
  }
}

async function importConfigModule(configPath: string): Promise<unknown> {
  const ext = path.extname(configPath);

  if (ext === '.json') {
    return fs.readJson(configPath);
  }

  if (ext === '.ts') {
    return importTypeScriptConfig(configPath);
  }

  const imported = (await import(pathToFileURL(configPath).href)) as {
    default?: unknown;
  };
  return imported.default ?? imported;
}

function validateConfig(raw: unknown, configPath: string): PortfolioShotConfig {
  if (typeof raw !== 'object' || raw === null) {
    throw new InvalidConfigError(`Config file "${configPath}" must export a default object.`);
  }

  const config = raw as Partial<PortfolioShotConfig>;

  if (!config.url || typeof config.url !== 'string') {
    throw new InvalidConfigError('Config is missing a required "url" string field.');
  }

  try {
    new URL(config.url);
  } catch {
    throw new InvalidConfigError(`Config "url" is not a valid URL: "${config.url}"`);
  }

  if (!config.output || typeof config.output !== 'string') {
    throw new InvalidConfigError('Config is missing a required "output" string field.');
  }

  if (!Array.isArray(config.pages) || config.pages.length === 0) {
    throw new InvalidConfigError('Config must define at least one entry in "pages".');
  }

  for (const page of config.pages) {
    if (!page.path || typeof page.path !== 'string') {
      throw new InvalidConfigError('Each entry in "pages" requires a "path" string field.');
    }
    if (!page.name || typeof page.name !== 'string') {
      throw new InvalidConfigError('Each entry in "pages" requires a "name" string field.');
    }
  }

  if (config.format && config.format !== 'webp' && config.format !== 'png') {
    throw new InvalidConfigError('Config "format" must be "webp" or "png".');
  }

  if (config.quality !== undefined && (config.quality < 1 || config.quality > 100)) {
    throw new InvalidConfigError('Config "quality" must be between 1 and 100.');
  }

  return config as PortfolioShotConfig;
}

export function resolveConfig(config: PortfolioShotConfig): ResolvedPortfolioShotConfig {
  return {
    url: config.url,
    output: config.output,
    pages: config.pages,
    format: config.format ?? DEFAULTS.format,
    quality: config.quality ?? DEFAULTS.quality,
    fullPage: config.fullPage ?? DEFAULTS.fullPage,
    viewport: config.viewport ?? DEFAULTS.viewport,
    resize: config.resize,
    waitUntil: config.waitUntil ?? DEFAULTS.waitUntil,
    timeout: config.timeout ?? DEFAULTS.timeout,
  };
}

export async function loadConfig(configPath?: string): Promise<ResolvedPortfolioShotConfig> {
  const resolvedPath = configPath ? path.resolve(configPath) : await findConfigFile();

  if (!resolvedPath || !(await fs.pathExists(resolvedPath))) {
    throw new InvalidConfigError('Could not find a "portfolio-shot.config.(ts|js|mjs|cjs|json)" file. Run "portfolio-shot init" to create one.');
  }

  const raw = await importConfigModule(resolvedPath);
  const config = validateConfig(raw, resolvedPath);
  return resolveConfig(config);
}
