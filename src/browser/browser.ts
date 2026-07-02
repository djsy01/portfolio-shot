import { chromium, type Browser, type BrowserContext, type Page } from 'playwright';
import { BrowserLaunchError } from '../errors.js';
import type { StorageState } from './auth.js';
import type { ColorScheme, DeviceConfig } from '../types.js';

export interface BrowserSessionOptions {
  device: DeviceConfig;
  colorScheme: ColorScheme;
  /** Shared storageState (cookies + localStorage) resolved once via `resolveAuthState` */
  storageState?: StorageState | string;
}

export interface BrowserSession {
  browser: Browser;
  context: BrowserContext;
  page: Page;
  close: () => Promise<void>;
}

export async function launchBrowser(): Promise<Browser> {
  try {
    return await chromium.launch({ headless: true });
  } catch (error) {
    throw new BrowserLaunchError(
      'Failed to launch Chromium. Make sure Playwright browsers are installed ' + '(run "npx playwright install chromium").',
      error,
    );
  }
}

export async function createSession(browser: Browser, options: BrowserSessionOptions): Promise<BrowserSession> {
  const context = await browser.newContext({
    viewport: options.device.viewport,
    userAgent: options.device.userAgent,
    deviceScaleFactor: options.device.deviceScaleFactor,
    isMobile: options.device.isMobile,
    hasTouch: options.device.hasTouch,
    colorScheme: options.colorScheme,
    storageState: options.storageState,
  });

  const page = await context.newPage();

  return {
    browser,
    context,
    page,
    close: async () => {
      await context.close();
    },
  };
}
