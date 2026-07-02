import path from 'node:path';
import { performance } from 'node:perf_hooks';
import { resolveAuthState } from './browser/auth.js';
import { createSession, launchBrowser } from './browser/browser.js';
import { capturePage } from './browser/capture.js';
import { resolveConfig } from './config/loadConfig.js';
import { saveOptimizedImage } from './image/optimize.js';
import { logger } from './utils/logger.js';
import type { CapturedPage, ColorScheme, DeviceConfig, GenerateResult, PortfolioShotConfig } from './types.js';

function variantLabel(device: DeviceConfig, colorScheme: ColorScheme, showDevice: boolean, showColorScheme: boolean): string {
  const parts: string[] = [];
  if (showDevice) parts.push(device.name);
  if (showColorScheme) parts.push(colorScheme);
  return parts.length > 0 ? `[${parts.join('/')}] ` : '';
}

function variantFileName(pageName: string, device: DeviceConfig, colorScheme: ColorScheme, showDevice: boolean, showColorScheme: boolean): string {
  let name = pageName;
  if (showDevice) name += `-${device.name}`;
  if (showColorScheme) name += `-${colorScheme}`;
  return name;
}

export async function generate(config: PortfolioShotConfig): Promise<GenerateResult> {
  const resolved = resolveConfig(config);
  const startedAt = performance.now();

  const showDevice = resolved.devices.length > 1;
  const showColorScheme = resolved.colorSchemes.length > 1;

  const browser = await launchBrowser();
  logger.success('Browser started');

  const capturedPages: CapturedPage[] = [];

  try {
    const authState = await resolveAuthState(browser, resolved.auth);
    if (resolved.auth) {
      logger.success('Authenticated session ready');
    }

    for (const device of resolved.devices) {
      for (const colorScheme of resolved.colorSchemes) {
        const label = variantLabel(device, colorScheme, showDevice, showColorScheme);
        const session = await createSession(browser, { device, colorScheme, storageState: authState });

        try {
          for (const page of resolved.pages) {
            const pageStartedAt = performance.now();
            logger.step(`${label}Visiting ${page.path}`);

            const buffer = await capturePage(session.page, {
              baseUrl: resolved.url,
              page,
              waitUntil: resolved.waitUntil,
              timeout: resolved.timeout,
              fullPage: resolved.fullPage,
            });

            const file = await saveOptimizedImage(buffer, {
              outputDir: resolved.output,
              fileName: variantFileName(page.name, device, colorScheme, showDevice, showColorScheme),
              format: resolved.format,
              quality: resolved.quality,
              resize: resolved.resize,
            });

            capturedPages.push({
              page,
              device: device.name,
              colorScheme,
              file,
              durationMs: performance.now() - pageStartedAt,
            });

            logger.success(`${label}Saved ${path.basename(file)}`);
          }
        } finally {
          await session.close();
        }
      }
    }
  } finally {
    await browser.close();
  }

  const durationMs = performance.now() - startedAt;
  logger.done(`Done in ${(durationMs / 1000).toFixed(1)}s`);

  return { outputDir: resolved.output, pages: capturedPages, durationMs };
}

export { defineConfig, loadConfig } from './config/loadConfig.js';
export * from './types.js';
export * from './errors.js';
