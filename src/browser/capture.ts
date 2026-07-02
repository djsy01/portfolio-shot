import type { Page } from 'playwright';
import { PageCaptureError } from '../errors.js';
import type { PageConfig, WaitUntilOption } from '../types.js';

export interface CaptureOptions {
  baseUrl: string;
  page: PageConfig;
  waitUntil: WaitUntilOption;
  timeout: number;
  fullPage: boolean;
}

export async function capturePage(browserPage: Page, options: CaptureOptions): Promise<Buffer> {
  let targetUrl: string;

  try {
    targetUrl = new URL(options.page.path, options.baseUrl).toString();
  } catch (error) {
    throw new PageCaptureError(
      `Invalid URL for page "${options.page.name}": base "${options.baseUrl}" + path "${options.page.path}".`,
      options.page.name,
      error,
    );
  }

  try {
    await browserPage.goto(targetUrl, {
      waitUntil: options.waitUntil,
      timeout: options.timeout,
    });
  } catch (error) {
    throw new PageCaptureError(`Failed to visit "${targetUrl}": ${error instanceof Error ? error.message : String(error)}`, options.page.name, error);
  }

  try {
    return await browserPage.screenshot({ fullPage: options.fullPage });
  } catch (error) {
    throw new PageCaptureError(`Failed to capture a screenshot for "${options.page.name}".`, options.page.name, error);
  }
}
