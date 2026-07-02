export type ImageFormat = 'webp' | 'png';

export type WaitUntilOption = 'load' | 'domcontentloaded' | 'networkidle' | 'commit';

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
  /** Browser viewport size. Defaults to 1440x900 */
  viewport?: Viewport;
  /** Resize the captured image before saving. Omitted by default (no resize) */
  resize?: ResizeOptions;
  /** Playwright navigation wait condition. Defaults to "networkidle" */
  waitUntil?: WaitUntilOption;
  /** Navigation timeout in milliseconds. Defaults to 30000 */
  timeout?: number;
}

/** A config with every optional field resolved to a concrete value. */
export type ResolvedPortfolioShotConfig = Required<Omit<PortfolioShotConfig, 'viewport' | 'resize'>> & {
  viewport: Viewport;
  resize?: ResizeOptions;
};

export interface CapturedPage {
  page: PageConfig;
  file: string;
  durationMs: number;
}

export interface GenerateResult {
  outputDir: string;
  pages: CapturedPage[];
  durationMs: number;
}
