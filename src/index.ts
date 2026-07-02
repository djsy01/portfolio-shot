import path from 'node:path';
import { performance } from 'node:perf_hooks';
import { createSession, launchBrowser } from './browser/browser.js';
import { capturePage } from './browser/capture.js';
import { resolveConfig } from './config/loadConfig.js';
import { saveOptimizedImage } from './image/optimize.js';
import { logger } from './utils/logger.js';
import type { CapturedPage, GenerateResult, PortfolioShotConfig } from './types.js';

export async function generate(config: PortfolioShotConfig): Promise<GenerateResult> {
  const resolved = resolveConfig(config);
  const startedAt = performance.now();

  const browser = await launchBrowser();
  logger.success('Browser started');

  const session = await createSession(browser, {
    viewport: resolved.viewport,
  });

  const capturedPages: CapturedPage[] = [];

  try {
    for (const page of resolved.pages) {
      const pageStartedAt = performance.now();
      logger.step(`Visiting ${page.path}`);

      const buffer = await capturePage(session.page, {
        baseUrl: resolved.url,
        page,
        waitUntil: resolved.waitUntil,
        timeout: resolved.timeout,
        fullPage: resolved.fullPage,
      });

      const file = await saveOptimizedImage(buffer, {
        outputDir: resolved.output,
        fileName: page.name,
        format: resolved.format,
        quality: resolved.quality,
        resize: resolved.resize,
      });

      capturedPages.push({
        page,
        file,
        durationMs: performance.now() - pageStartedAt,
      });

      logger.success(`Saved ${path.basename(file)}`);
    }
  } finally {
    await session.close();
    await browser.close();
  }

  const durationMs = performance.now() - startedAt;
  logger.done(`Done in ${(durationMs / 1000).toFixed(1)}s`);

  return { outputDir: resolved.output, pages: capturedPages, durationMs };
}

export { defineConfig, loadConfig } from './config/loadConfig.js';
export * from './types.js';
export * from './errors.js';
