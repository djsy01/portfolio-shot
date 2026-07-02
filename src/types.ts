export type ImageFormat = 'webp' | 'png';

export type WaitUntilOption = 'load' | 'domcontentloaded' | 'networkidle' | 'commit';

export type ColorScheme = 'light' | 'dark' | 'no-preference';

export interface Viewport {
  width: number;
  height: number;
}

export interface ResizeOptions {
  width?: number;
  height?: number;
}

export interface PageConfig {
  /** Path relative to the configured base URL, e.g. "/" or "/projects" */
  path: string;
  /** Output file name, without extension */
  name: string;
}

/** A resolved device/viewport profile a page is captured under. */
export interface DeviceConfig {
  /** Used as the filename suffix when more than one device is configured, e.g. "mobile" */
  name: string;
  viewport: Viewport;
  userAgent?: string;
  deviceScaleFactor?: number;
  isMobile?: boolean;
  hasTouch?: boolean;
}

/**
 * `"desktop"` and `"mobile"`/`"tablet"` are built-in presets (the latter two map to
 * real Playwright device descriptors). Any other string is looked up as an exact
 * Playwright device name (e.g. `"iPhone 15 Pro"`). Pass a `DeviceConfig` object for
 * full custom control.
 */
export type DeviceInput = string | DeviceConfig;

export interface CookieConfig {
  name: string;
  value: string;
  /** Either `domain` (+ optional `path`) or `url` is required */
  domain?: string;
  path?: string;
  url?: string;
  expires?: number;
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: 'Strict' | 'Lax' | 'None';
}

export interface LoginField {
  /** CSS selector for the input to fill */
  selector: string;
  value: string;
}

export interface LoginStep {
  /** URL of the login page, relative to `url` or absolute */
  url: string;
  /** Form fields to fill before submitting */
  fields: LoginField[];
  /** CSS selector for the submit button */
  submitSelector: string;
  /** Selector to wait for after submitting, to confirm login succeeded */
  waitForSelector?: string;
  waitUntil?: WaitUntilOption;
  timeout?: number;
}

export interface AuthConfig {
  /** Load a previously saved Playwright storageState (cookies + localStorage) JSON file */
  storageStatePath?: string;
  /** After login/cookies run once, save the resulting storageState here for reuse in future runs */
  saveStorageStatePath?: string;
  /** Cookies to inject before capturing, without needing a full login flow */
  cookies?: CookieConfig[];
  /** Automate a login form once before capturing any pages */
  login?: LoginStep;
}

export interface PortfolioShotConfig {
  /** Base URL of the site to capture, e.g. "https://example.vercel.app" */
  url: string;
  /** Directory where screenshots are written */
  output: string;
  /** Pages to capture */
  pages: PageConfig[];
  /** Image format. Defaults to "webp" */
  format?: ImageFormat;
  /** Image quality, 1-100. Defaults to 90 */
  quality?: number;
  /** Capture the full scrollable page. Defaults to true */
  fullPage?: boolean;
  /** Desktop viewport size, used by the built-in "desktop" device. Defaults to 1440x900 */
  viewport?: Viewport;
  /** Resize the captured image before saving. Omitted by default (no resize) */
  resize?: ResizeOptions;
  /**
   * Device profiles to capture each page under. Defaults to `["desktop"]`.
   * When more than one is configured, output filenames get a `-<device>` suffix.
   */
  devices?: DeviceInput[];
  /**
   * Color schemes to emulate. Defaults to `["light"]`.
   * When more than one is configured, output filenames get a `-<scheme>` suffix.
   */
  colorSchemes?: ColorScheme[];
  /** Authenticated session support: storageState, cookies, and/or an automated login flow */
  auth?: AuthConfig;
  /** Playwright navigation wait condition. Defaults to "networkidle" */
  waitUntil?: WaitUntilOption;
  /** Navigation timeout in milliseconds. Defaults to 30000 */
  timeout?: number;
}

/** A config with every optional field resolved to a concrete value. */
export type ResolvedPortfolioShotConfig = Required<Omit<PortfolioShotConfig, 'viewport' | 'resize' | 'devices' | 'colorSchemes' | 'auth'>> & {
  viewport: Viewport;
  resize?: ResizeOptions;
  devices: DeviceConfig[];
  colorSchemes: ColorScheme[];
  auth?: AuthConfig;
};

export interface CapturedPage {
  page: PageConfig;
  device: string;
  colorScheme: ColorScheme;
  file: string;
  durationMs: number;
}

export interface GenerateResult {
  outputDir: string;
  pages: CapturedPage[];
  durationMs: number;
}
