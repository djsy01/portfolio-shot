import path from 'node:path';
import fs from 'fs-extra';
import { logger } from '../../utils/logger.js';

const CONFIG_FILENAME = 'portfolio-shot.config.ts';

const CONFIG_TEMPLATE = `import { defineConfig } from "portfolio-shot";

export default defineConfig({
  url: "https://example.vercel.app",

  output: "./public/screenshots",

  pages: [
    {
      path: "/",
      name: "home",
    },
    {
      path: "/projects",
      name: "projects",
    },
  ],

  format: "webp",

  quality: 90,

  fullPage: true,
});
`;

export interface InitOptions {
  force: boolean;
}

export async function runInit(options: InitOptions): Promise<void> {
  const configPath = path.join(process.cwd(), CONFIG_FILENAME);
  const exists = await fs.pathExists(configPath);

  if (exists && !options.force) {
    logger.warn(`"${CONFIG_FILENAME}" already exists. Use --force to overwrite it.`);
    process.exitCode = 1;
    return;
  }

  await fs.writeFile(configPath, CONFIG_TEMPLATE, 'utf-8');
  logger.success(`Created ${CONFIG_FILENAME}`);
  logger.info('Next: run "npx portfolio-shot generate"');
}
