import { chromium, type Browser, type BrowserContext, type Page } from 'playwright';
import { BrowserLaunchError } from '../errors.js';
import type { Viewport } from '../types.js';

export interface BrowserSessionOptions {
  viewport: Viewport;
  /** Reserved for dark mode support (v1.1) */
  colorScheme?: 'light' | 'dark';
  /** Reserved for authenticated sessions via saved cookies/localStorage (v1.5) */
  storageStatePath?: string;
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
    viewport: options.viewport,
    colorScheme: options.colorScheme,
    storageState: options.storageStatePath,
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
