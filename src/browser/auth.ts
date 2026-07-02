import type { Browser, BrowserContext } from 'playwright';
import { AuthError } from '../errors.js';
import type { AuthConfig, LoginStep } from '../types.js';

export type StorageState = Awaited<ReturnType<BrowserContext['storageState']>>;

/** `page.waitForLoadState()` doesn't accept "commit" the way `page.goto()` does. */
function toLoadState(waitUntil: LoginStep['waitUntil']): 'load' | 'domcontentloaded' | 'networkidle' {
  return waitUntil === 'commit' || waitUntil === undefined ? 'networkidle' : waitUntil;
}

async function runLogin(context: BrowserContext, login: LoginStep): Promise<void> {
  const page = await context.newPage();
  const timeout = login.timeout ?? 30_000;

  try {
    await page.goto(login.url, {
      waitUntil: login.waitUntil ?? 'networkidle',
      timeout,
    });

    for (const field of login.fields) {
      await page.fill(field.selector, field.value);
    }

    await Promise.all([
      login.waitForSelector
        ? page.waitForSelector(login.waitForSelector, { timeout })
        : page.waitForLoadState(toLoadState(login.waitUntil), { timeout }),
      page.click(login.submitSelector),
    ]);
  } catch (error) {
    throw new AuthError(`Login flow failed: ${error instanceof Error ? error.message : String(error)}`, error);
  } finally {
    await page.close();
  }
}

/**
 * Resolves an `AuthConfig` into something `browser.newContext({ storageState })` accepts,
 * shared across every device/color-scheme context created afterwards.
 *
 * - Only `storageStatePath` set: returned as-is (Playwright reads the file directly).
 * - `cookies` and/or `login` set: run once in a scratch context, capture the resulting
 *   storageState (optionally persisting it to `saveStorageStatePath`), and reuse that.
 */
export async function resolveAuthState(browser: Browser, auth: AuthConfig | undefined): Promise<StorageState | string | undefined> {
  if (!auth) {
    return undefined;
  }

  const hasCookies = Boolean(auth.cookies && auth.cookies.length > 0);
  const needsBrowserFlow = hasCookies || Boolean(auth.login);

  if (!needsBrowserFlow) {
    return auth.storageStatePath;
  }

  const context = await browser.newContext({
    storageState: auth.storageStatePath,
  });

  try {
    if (auth.cookies && auth.cookies.length > 0) {
      try {
        await context.addCookies(auth.cookies);
      } catch (error) {
        throw new AuthError('Failed to apply configured cookies.', error);
      }
    }

    if (auth.login) {
      await runLogin(context, auth.login);
    }

    return await context.storageState(auth.saveStorageStatePath ? { path: auth.saveStorageStatePath } : undefined);
  } finally {
    await context.close();
  }
}
